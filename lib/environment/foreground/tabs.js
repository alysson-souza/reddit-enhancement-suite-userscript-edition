/* @flow */

import { tabs as tabsAdapter } from '../adapters';
import { sendMessage } from './messaging';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

export function openNewTab(url: string, focus?: boolean = true) {
	return openNewTabs(focus, url);
}

type Focus = 'first' | 'last' | 'none' | boolean;

export function openNewTabs(focus: Focus, ...urls: string[]) {
	let focusIndex;

	if (typeof focus !== 'string') focus = !!focus;

	switch (focus) {
		case 'first':
			focusIndex = 0;
			break;
		case true:
		case 'last':
			focusIndex = urls.length - 1;
			break;
		case false:
		case 'none':
			focusIndex = -1;
			break;
		default:
			throw new Error(`Invalid focus specified: ${focus}`);
	}

	urls = urls.map(url => new URL(url, location.href).href);

	if (isUserscript && tabsAdapter) {
		return tabsAdapter.open(urls, focusIndex);
	}
	return sendMessage('openNewTabs', { urls, focusIndex });
}
