/* @flow */

export type * from './types';

// Use conditional require to allow tree-shaking by esbuild
// $FlowIgnore - process.env defined at build time
let storage, messaging, crossOriginAjax, id, privateBrowsing;
let session, xhrCache, tabs, download, permissions, history, multicast, auth, addStyle;

if (process.env.BUILD_TARGET === 'userscript') {
	const adapter = require('./userscript');
	storage = adapter.storage;
	messaging = adapter.messaging;
	crossOriginAjax = adapter.crossOriginAjax;
	id = adapter.id;
	privateBrowsing = adapter.privateBrowsing;
	session = adapter.session;
	xhrCache = adapter.xhrCache;
	tabs = adapter.tabs;
	download = adapter.download;
	permissions = adapter.permissions;
	history = adapter.history;
	multicast = adapter.multicast;
	auth = adapter.auth;
	addStyle = adapter.addStyle;
} else {
	const adapter = require('./extension');
	storage = adapter.storage;
	messaging = adapter.messaging;
	crossOriginAjax = adapter.crossOriginAjax;
	id = adapter.id;
	privateBrowsing = adapter.privateBrowsing;
	session = null;
	xhrCache = null;
	tabs = null;
	download = null;
	permissions = null;
	history = null;
	multicast = null;
	auth = null;
	addStyle = null;
}

export { storage, messaging, crossOriginAjax, id, privateBrowsing };
export { session, xhrCache, tabs, download, permissions, history, multicast, auth, addStyle };
