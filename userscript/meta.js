/* @noflow */

import packageInfo from '../package.json' with { type: 'json' };

const name = packageInfo.title;
const version = packageInfo.version;
const description = packageInfo.description;
const author = packageInfo.author;

const matches = [
	'https://*.reddit.com/*',
];

const excludeMatches = [
	'https://mod.reddit.com/*',
	'https://ads.reddit.com/*',
	'https://i.reddit.com/*',
	'https://m.reddit.com/*',
	'https://static.reddit.com/*',
	'https://thumbs.reddit.com/*',
	'https://blog.reddit.com/*',
	'https://code.reddit.com/*',
	'https://about.reddit.com/*',
	'https://sh.reddit.com/*',
	'https://*.reddit.com/talk/*',
	'https://*.reddit.com/chat/*',
	'https://*.reddit.com/*.compact',
	'https://*.reddit.com/*.compact?*',
	'https://*.reddit.com/*.mobile',
	'https://*.reddit.com/*.mobile?*',
	'https://*.reddit.com/*.json',
	'https://*.reddit.com/*.json?*',
	'https://*.reddit.com/*.json-html',
	'https://*.reddit.com/*.json-html?*',
];

const grants = [
	'GM_getValue',
	'GM_setValue',
	'GM_deleteValue',
	'GM_listValues',
	'GM_xmlhttpRequest',
	'GM_addStyle',
	'GM_openInTab',
	'GM_registerMenuCommand',
	'GM_notification',
	'GM_download',
	'GM_setClipboard',
	'unsafeWindow',
];

const connects = [
	'*.reddit.com',
	'*.redd.it',
	'publish.twitter.com',
	'backend.deviantart.com',
	'api.gyazo.com',
	'api.tumblr.com',
	'xkcd.com',
	'api.steampowered.com',
	'www.googleapis.com',
	'www.flickr.com',
	'redditenhancementsuite.com',
	'accounts.google.com',
	'www.dropbox.com',
	'login.live.com',
	'embed.bsky.app',
	'*',
];

export function generateMetaBlock() {
	const lines = [
		'// ==UserScript==',
		`// @name         ${name}`,
		`// @namespace    ${packageInfo.repository.url.replace('.git', '')}`,
		`// @version      ${version}`,
		`// @description  ${description}`,
		`// @author       ${author}`,
		'// @license      GPL-3.0',
		...matches.map(m => `// @match        ${m}`),
		...excludeMatches.map(e => `// @exclude      ${e}`),
		...grants.map(g => `// @grant        ${g}`),
		...connects.map(c => `// @connect      ${c}`),
		'// @run-at       document-start',
		'// @noframes',
		`// @homepageURL  ${packageInfo.repository.url.replace('.git', '')}`,
		`// @supportURL   ${packageInfo.repository.url.replace('.git', '')}/issues`,
		`// @updateURL    ${packageInfo.repository.url.replace('.git', '')}/releases/latest/download/reddit-enhancement-suite.meta.js`,
		`// @downloadURL  ${packageInfo.repository.url.replace('.git', '')}/releases/latest/download/reddit-enhancement-suite.user.js`,
		'// ==/UserScript==',
		'',
	];

	return lines.join('\n');
}

export function generateMetaOnlyBlock() {
	const lines = [
		'// ==UserScript==',
		`// @name         ${name}`,
		`// @namespace    ${packageInfo.repository.url.replace('.git', '')}`,
		`// @version      ${version}`,
		`// @description  ${description}`,
		`// @author       ${author}`,
		`// @updateURL    ${packageInfo.repository.url.replace('.git', '')}/releases/latest/download/reddit-enhancement-suite.meta.js`,
		`// @downloadURL  ${packageInfo.repository.url.replace('.git', '')}/releases/latest/download/reddit-enhancement-suite.user.js`,
		'// ==/UserScript==',
	];

	return lines.join('\n');
}
