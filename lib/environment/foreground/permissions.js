/* @flow */

import { memoize } from 'lodash-es';
import { mutex } from '../../utils/async';
import { sendMessage } from './messaging';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

type Perms = Array<string>;

function filterPerms(perms) {
	const permissions = perms.filter(p => !p.includes('://') && p !== '<all_urls>');
	const origins = perms.filter(p => p.includes('://') || p === '<all_urls>');
	return { permissions, origins };
}

export const has = memoize(
	(perms: Perms) => {
		if (isUserscript) {
			return Promise.resolve(true);
		}
		return sendMessage('permissions', { operation: 'contains', ...filterPerms(perms) });
	},
	perms => perms.join(','),
);

export const request = mutex(async (perms: Perms) => {
	if (await has(perms)) return;

	if (isUserscript) {
		return;
	}

	const { permissions, origins } = filterPerms(perms);

	const granted = await sendMessage('permissions', { operation: 'request', permissions, origins });
	if (granted) {
		has.cache.set(perms.join(','), true);
	} else {
		throw new Error(`Permission not granted for: ${perms.join(', ')}`);
	}
});
