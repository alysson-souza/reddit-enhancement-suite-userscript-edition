/* @flow */
/* eslint-disable new-cap, no-undef, camelcase, require-await, no-unused-vars, no-restricted-syntax */

import type {
	StorageAdapter,
	AjaxResponse,
	IdAdapter,
	PrivateBrowsingAdapter,
} from './types';

const STORAGE_PREFIX = 'RES.';

export const storage: StorageAdapter = {
	async get(keys: { [string]: mixed } | null): Promise<{ [string]: mixed }> {
		const result: { [string]: mixed } = {};

		if (keys === null) {
			// $FlowIgnore - GM_listValues injected by userscript manager
			const allKeys: string[] = GM_listValues();
			for (const key of allKeys) {
				if (key.startsWith(STORAGE_PREFIX)) {
					const actualKey = key.slice(STORAGE_PREFIX.length);
					// $FlowIgnore - GM_getValue injected by userscript manager
					const value = GM_getValue(key);
					result[actualKey] = value !== undefined ? JSON.parse((value: any)) : null;
				}
			}
		} else {
			for (const [key, defaultValue] of Object.entries(keys)) {
				const prefixedKey = STORAGE_PREFIX + key;
				// $FlowIgnore - GM_getValue injected by userscript manager
				const value = GM_getValue(prefixedKey);
				result[key] = value !== undefined ? JSON.parse((value: any)) : defaultValue;
			}
		}

		return result;
	},

	async set(items: { [string]: mixed }): Promise<void> {
		for (const [key, value] of Object.entries(items)) {
			const prefixedKey = STORAGE_PREFIX + key;
			// $FlowIgnore - GM_setValue injected by userscript manager
			GM_setValue(prefixedKey, JSON.stringify(value));
		}
	},

	async remove(keys: string | string[]): Promise<void> {
		const keyArray = Array.isArray(keys) ? keys : [keys];
		for (const key of keyArray) {
			const prefixedKey = STORAGE_PREFIX + key;
			// $FlowIgnore - GM_deleteValue injected by userscript manager
			GM_deleteValue(prefixedKey);
		}
	},

	async clear(): Promise<void> {
		// $FlowIgnore - GM_listValues injected by userscript manager
		const allKeys: string[] = GM_listValues();
		for (const key of allKeys) {
			if (key.startsWith(STORAGE_PREFIX)) {
				// $FlowIgnore - GM_deleteValue injected by userscript manager
				GM_deleteValue(key);
			}
		}
	},
};

const messageListeners: Map<string, (data: mixed, context: mixed) => mixed> = new Map();
let broadcastChannel: ?BroadcastChannel = null;

function getBroadcastChannel(): BroadcastChannel {
	if (!broadcastChannel) {
		broadcastChannel = new BroadcastChannel('RES_userscript_channel');
		broadcastChannel.onmessage = (event: MessageEvent) => {
			const { type, data } = (event.data: any);
			const listener = messageListeners.get(type);
			if (listener) {
				listener(data, {});
			}
		};
	}
	return broadcastChannel;
}

export const messaging = {
	async sendMessage(type: string, data: mixed): Promise<mixed> {
		const listener = messageListeners.get(type);
		if (listener) {
			return listener(data, {});
		}
		return undefined;
	},

	addListener(callback: (message: mixed, sendResponse: (response: mixed) => void) => boolean) {
		// Userscript mode registers handlers via registerHandler instead
	},

	registerHandler(type: string, handler: (data: mixed, context: mixed) => mixed) {
		messageListeners.set(type, handler);
	},

	broadcast(type: string, data: mixed) {
		getBroadcastChannel().postMessage({ type, data });
	},
};

export async function crossOriginAjax(
	sendMessage: (type: string, data: mixed) => Promise<mixed>,
	options: {|
		method: string,
		url: string,
		headers: { [string]: string },
		data: ?string,
		credentials: 'omit' | 'include',
	|},
): Promise<AjaxResponse> {
	return new Promise((resolve, reject) => {
		// $FlowIgnore - GM_xmlhttpRequest injected by userscript manager
		GM_xmlhttpRequest({
			method: options.method,
			url: options.url,
			headers: options.headers,
			data: options.data,
			anonymous: options.credentials === 'omit',
			onload(response) {
				const headers: { [string]: string } = {};
				const headerLines = response.responseHeaders.trim().split('\n');
				for (const line of headerLines) {
					const colonIndex = line.indexOf(':');
					if (colonIndex > 0) {
						const name = line.slice(0, colonIndex).trim().toLowerCase();
						const value = line.slice(colonIndex + 1).trim();
						headers[name] = value;
					}
				}

				resolve({
					ok: response.status >= 200 && response.status < 300,
					status: response.status,
					headers,
					text: response.responseText,
				});
			},
			onerror(error) {
				reject(new Error(`Request failed: ${error.statusText || 'Unknown error'}`));
			},
			ontimeout() {
				reject(new Error('Request timed out'));
			},
		});
	});
}

export const id: IdAdapter = {
	getExtensionId: () => 'userscript',
	getURL: (path: string) => {
		if (path === 'options.html') {
			return '#res-settings';
		}
		console.warn(`getURL called for '${path}' in userscript mode - resource should be bundled`);
		return `about:blank?res-resource=${encodeURIComponent(path)}`;
	},
};

export const privateBrowsing: PrivateBrowsingAdapter = {
	isPrivateBrowsing: () => false,
};

const SESSION_PREFIX = 'RES_session.';

export const session = {
	async get(key: string): Promise<mixed> {
		const value = sessionStorage.getItem(SESSION_PREFIX + key);
		return value !== null ? JSON.parse((value: any)) : undefined;
	},

	async set(key: string, value: mixed): Promise<void> {
		sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value));
	},

	async delete(key: string): Promise<void> {
		sessionStorage.removeItem(SESSION_PREFIX + key);
	},

	async has(key: string): Promise<boolean> {
		return sessionStorage.getItem(SESSION_PREFIX + key) !== null;
	},

	async clear(): Promise<void> {
		const keysToRemove: string[] = [];
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key && key.startsWith(SESSION_PREFIX)) {
				keysToRemove.push(key);
			}
		}
		for (const key of keysToRemove) {
			sessionStorage.removeItem(key);
		}
	},
};

const XHR_CACHE_PREFIX = 'RES_xhrCache.';

export const xhrCache = {
	async get(key: string, maxAge: ?number): Promise<mixed> {
		const item = localStorage.getItem(XHR_CACHE_PREFIX + key);
		if (!item) return undefined;

		try {
			const { value, timestamp } = JSON.parse(item);
			if (maxAge && Date.now() - timestamp > maxAge) {
				localStorage.removeItem(XHR_CACHE_PREFIX + key);
				return undefined;
			}
			return value;
		} catch (e) {
			return undefined;
		}
	},

	async set(key: string, value: mixed): Promise<void> {
		const item = JSON.stringify({ value, timestamp: Date.now() });
		try {
			localStorage.setItem(XHR_CACHE_PREFIX + key, item);
		} catch (e) {
			console.warn('Failed to cache XHR response, storage may be full:', e);
		}
	},

	async delete(key: string): Promise<void> {
		localStorage.removeItem(XHR_CACHE_PREFIX + key);
	},

	async clear(): Promise<void> {
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(XHR_CACHE_PREFIX)) {
				keysToRemove.push(key);
			}
		}
		for (const key of keysToRemove) {
			localStorage.removeItem(key);
		}
	},
};

export const tabs = {
	async open(urls: string[], focusIndex: number): Promise<void> {
		for (let i = 0; i < urls.length; i++) {
			const active = i === focusIndex;
			// $FlowIgnore - GM_openInTab injected by userscript manager
			GM_openInTab(urls[i], { active, insert: true, setParent: true });
		}
	},
};

export const download = {
	download(url: string, filename: ?string): void {
		if (typeof GM_download !== 'undefined') {
			// $FlowIgnore - GM_download injected by userscript manager
			GM_download({ url, name: filename || 'download' });
		} else {
			const a = document.createElement('a');
			a.href = url;
			if (filename) a.download = filename;
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();
			setTimeout(() => a.remove(), 100);
		}
	},
};

export const permissions = {
	async has(perms: string[]): Promise<boolean> {
		return true;
	},

	async request(perms: string[]): Promise<boolean> {
		return true;
	},
};

export const history = {
	async addURLToHistory(url: string): Promise<void> {
		// Cannot add to browser history in userscripts
	},

	async isURLVisited(url: string): Promise<boolean> {
		return false;
	},
};

export const multicast = {
	send(name: string, args: mixed[], crossContext: boolean): void {
		if (crossContext) {
			getBroadcastChannel().postMessage({ type: 'multicast', name, args });
		}
	},

	addListener(callback: (name: string, args: mixed[]) => void): void {
		const channel = getBroadcastChannel();
		const originalHandler = channel.onmessage;
		channel.onmessage = (event: MessageEvent) => {
			if (originalHandler) originalHandler(event);
			const { type, name, args } = (event.data: any);
			if (type === 'multicast') {
				callback(name, args);
			}
		};
	},
};

export const auth = {
	async launchAuthFlow(options: {|
		domain: string,
		clientId: string,
		scope: string,
		interactive: boolean,
	|}): Promise<string> {
		const { domain, clientId, scope } = options;

		const redirectUri = 'https://redditenhancementsuite.com/oauth';
		const state = Math.random().toString(36).substring(2);
		const authUrl = new URL(`https://${domain}/oauth2/authorize`);
		authUrl.searchParams.set('client_id', clientId);
		authUrl.searchParams.set('redirect_uri', redirectUri);
		authUrl.searchParams.set('response_type', 'token');
		authUrl.searchParams.set('scope', scope);
		authUrl.searchParams.set('state', state);

		return new Promise((resolve, reject) => {
			// $FlowIgnore - GM_openInTab injected by userscript manager
			const tab = GM_openInTab(authUrl.href, { active: true });

			const storageKey = `RES_oauth_response_${state}`;
			const pollInterval = setInterval(() => {
				const response = localStorage.getItem(storageKey);
				if (response) {
					clearInterval(pollInterval);
					localStorage.removeItem(storageKey);
					try {
						tab.close();
					} catch (e) { /* tab may already be closed */ }
					resolve(response);
				}
			}, 500);

			setTimeout(() => {
				clearInterval(pollInterval);
				reject(new Error('OAuth flow timed out'));
			}, 5 * 60 * 1000);
		});
	},
};

export function addStyle(css: string): void {
	// $FlowIgnore - GM_addStyle injected by userscript manager
	if (typeof GM_addStyle !== 'undefined') {
		GM_addStyle(css);
	} else {
		const style = document.createElement('style');
		style.textContent = css;
		(document.head || document.documentElement).appendChild(style);
	}
}
