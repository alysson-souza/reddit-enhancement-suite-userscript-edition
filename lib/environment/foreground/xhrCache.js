/* @flow */
/* eslint-disable require-await, no-restricted-syntax */

import { sendMessage } from './messaging';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

let cacheImpl;

if (isUserscript) {
	const XHR_CACHE_PREFIX = 'RES_xhrCache.';

	cacheImpl = {
		async set(key: string, value: mixed): Promise<void> {
			const item = JSON.stringify({ value, timestamp: Date.now() });
			try {
				localStorage.setItem(XHR_CACHE_PREFIX + key, item);
			} catch (e) {
				console.warn('Failed to cache XHR response:', e);
			}
		},

		async check(key: string, maxAge?: number): Promise<any | void> {
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

		async delete_(key: string): Promise<void> {
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
} else {
	cacheImpl = {
		set: (key: string, value: mixed) => sendMessage('XHRCache', ['set', key, value]),
		check: (key: string, maxAge?: number) => sendMessage('XHRCache', ['check', key, maxAge]),
		delete_: (key: string) => sendMessage('XHRCache', ['delete', key]),
		clear: () => sendMessage('XHRCache', ['clear']),
	};
}

export function set(key: string, value: mixed) {
	return cacheImpl.set(key, value);
}

export function check(key: string, maxAge?: number): Promise<any | void> {
	return cacheImpl.check(key, maxAge);
}

function delete_(key: string) {
	return cacheImpl.delete_(key);
}
export { delete_ as delete };

export function clear() {
	return cacheImpl.clear();
}
