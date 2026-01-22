/* @flow */

import { sendMessage } from './messaging';
import { isPrivateBrowsing } from './privateBrowsing';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

export async function addURLToHistory(url: string): Promise<void> {
	if (isPrivateBrowsing()) return;
	if (isUserscript) return;

	await sendMessage('addURLToHistory', url);
}

export function isURLVisited(url: string): Promise<boolean> {
	if (isUserscript) {
		return Promise.resolve(false);
	}
	return sendMessage('isURLVisited', url);
}
