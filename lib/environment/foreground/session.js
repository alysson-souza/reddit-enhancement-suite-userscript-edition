/* @flow */
/* eslint-disable require-await, no-restricted-syntax */

import { sendMessage } from './messaging';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

let sessionImpl;

if (isUserscript) {
	const SESSION_PREFIX = 'RES_session.';

	sessionImpl = {
		async get(key: string): Promise<any | void> {
			const value = sessionStorage.getItem(SESSION_PREFIX + key);
			return value !== null ? JSON.parse((value: any)) : undefined;
		},

		async set(key: string, value: mixed): Promise<void> {
			sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value));
		},

		async delete_(key: string): Promise<void> {
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
} else {
	sessionImpl = {
		get: (key: string) => sendMessage('session', ['get', key]),
		set: (key: string, value: mixed) => sendMessage('session', ['set', key, value]),
		delete_: (key: string) => sendMessage('session', ['delete', key]),
		has: (key: string) => sendMessage('session', ['has', key]),
		clear: () => sendMessage('session', ['clear']),
	};
}

export function get(key: string): Promise<any | void> {
	return sessionImpl.get(key);
}

export function set(key: string, value: mixed) {
	return sessionImpl.set(key, value);
}

function delete_(key: string) {
	return sessionImpl.delete_(key);
}
export { delete_ as delete };

export function has(key: string): Promise<boolean> {
	return sessionImpl.has(key);
}

export function clear() {
	return sessionImpl.clear();
}
