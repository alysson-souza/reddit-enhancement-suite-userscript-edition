/* @flow */
/* eslint-disable require-await */

import { apiToPromise } from '../utils/api';

import type {
	StorageAdapter,
	AjaxResponse,
	IdAdapter,
	PrivateBrowsingAdapter,
} from './types';

export const storage: StorageAdapter = {
	get: apiToPromise((keys, callback) => chrome.storage.local.get(keys, callback)),
	set: apiToPromise((items, callback) => chrome.storage.local.set(items, callback)),
	remove: apiToPromise((keys, callback) => chrome.storage.local.remove(keys, callback)),
	clear: apiToPromise(callback => chrome.storage.local.clear(callback)),
};

export const messaging = {
	sendMessage: apiToPromise(chrome.runtime.sendMessage),
	addListener: (callback: (message: mixed, sendResponse: (response: mixed) => void) => boolean) => {
		chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => callback(obj, sendResponse));
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
	return (sendMessage('ajax', options): any);
}

export const id: IdAdapter = {
	getExtensionId: () => chrome.runtime.id,
	getURL: (path: string) => chrome.runtime.getURL(path),
};

export const privateBrowsing: PrivateBrowsingAdapter = {
	isPrivateBrowsing: () => chrome.extension.inIncognitoContext,
};
