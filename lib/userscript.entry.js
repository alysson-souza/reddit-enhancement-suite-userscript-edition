/* @flow */

import { getLocaleDictionary } from '../locales';
import { RES_DISABLED_HASH } from './constants/urlHashes';
import { init } from './core/init';
import { migrate } from './core/migrate/migrate';
import { addStyle } from './environment/adapters/userscript';
import { addListener } from './environment/foreground/messaging';

const userscriptConsoleCSS = `
#RESConsoleContainer {
	position: fixed !important;
	top: 0 !important;
	left: 0 !important;
	right: 0 !important;
	bottom: 0 !important;
	width: 100% !important;
	height: 100% !important;
	z-index: 2147483640 !important;
	overflow: auto !important;
	background-color: #fff;
}
.res-nightmode #RESConsoleContainer {
	background-color: rgb(34, 34, 34) !important;
}
#alert_message,
#alert_message_background {
	z-index: 2147483647 !important;
}
`;

const blockers = [];

if (location.hash === RES_DISABLED_HASH) {
	blockers.push(`Hash ${RES_DISABLED_HASH} disables RES.`);
} else {
	window.addEventListener('hashchange', () => { if (location.hash === RES_DISABLED_HASH) location.reload(); });
}

if (document.documentElement && document.documentElement.classList.contains('res')) {
	document.documentElement.setAttribute('res-warning', 'This page must be reloaded for Reddit Enhancement Suite to function correctly');
	blockers.push('RES is previously loaded on this page.');
}

if (window !== window.parent && (new URL(location.href)).searchParams.get('embedded') !== 'true') {
	blockers.push('Conditions for running on an embedded page are not met.');
}

if (blockers.length) {
	console.warn('Preventing initialization of RES:', blockers);
} else {
	addStyle(userscriptConsoleCSS);

	let lastRedditLocale = localStorage.getItem('RES.lastRedditLocale') || null;
	addListener('i18n', (locale: mixed) => getLocaleDictionary(typeof locale === 'string' ? locale : 'en'));
	addListener('getLastRedditLocale', () => lastRedditLocale);
	addListener('setLastRedditLocale', (v: mixed) => {
		lastRedditLocale = typeof v === 'string' ? v : null;
		if (typeof v === 'string') localStorage.setItem('RES.lastRedditLocale', v);
	});

	migrate().then(() => {
		init();
	});
}
