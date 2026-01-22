/* @flow */

export type StorageAdapter = {|
	get: (keys: { [string]: mixed } | null) => Promise<{ [string]: mixed }>,
	set: (items: { [string]: mixed }) => Promise<void>,
	remove: (keys: string | string[]) => Promise<void>,
	clear: () => Promise<void>,
|};

export type AjaxResponse = {|
	ok: boolean,
	status: number,
	headers: { [string]: string },
	text: string,
|};

export type AjaxAdapter = {|
	ajax: (options: {|
		method: string,
		url: string,
		headers: { [string]: string },
		data: ?string,
		credentials: 'omit' | 'include',
	|}) => Promise<AjaxResponse>,
|};

export type TabsAdapter = {|
	open: (urls: string[], focusIndex: number) => Promise<void>,
|};

export type DownloadAdapter = {|
	download: (url: string, filename: ?string) => void,
|};

export type IdAdapter = {|
	getExtensionId: () => string,
	getURL: (path: string) => string,
|};

export type PrivateBrowsingAdapter = {|
	isPrivateBrowsing: () => boolean,
|};

export type SessionAdapter = {|
	get: (key: string) => Promise<mixed>,
	set: (key: string, value: mixed) => Promise<void>,
	delete: (key: string) => Promise<void>,
	has: (key: string) => Promise<boolean>,
	clear: () => Promise<void>,
|};

export type XhrCacheAdapter = {|
	get: (key: string, maxAge: ?number) => Promise<mixed>,
	set: (key: string, value: mixed) => Promise<void>,
	delete: (key: string) => Promise<void>,
	clear: () => Promise<void>,
|};

export type MulticastAdapter = {|
	send: (name: string, args: mixed[], crossContext: boolean) => void,
	addListener: (callback: (name: string, args: mixed[]) => void) => void,
|};

export type PermissionsAdapter = {|
	has: (perms: string[]) => Promise<boolean>,
	request: (perms: string[]) => Promise<boolean>,
|};

export type HistoryAdapter = {|
	addURLToHistory: (url: string) => Promise<void>,
	isURLVisited: (url: string) => Promise<boolean>,
|};

export type AuthAdapter = {|
	launchAuthFlow: (options: {|
		domain: string,
		clientId: string,
		scope: string,
		interactive: boolean,
	|}) => Promise<string>,
|};
