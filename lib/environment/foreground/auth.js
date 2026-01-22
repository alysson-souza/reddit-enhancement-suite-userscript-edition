/* @flow */

import { auth as authAdapter } from '../adapters';
import { sendMessage } from './messaging';
import * as Permissions from './permissions';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

export async function launchAuthFlow({
	domain,
	clientId,
	scope = '',
	permissions,
}: {|
	domain: string,
	clientId: string,
	scope?: string,
	permissions: Array<string>,
|}, warnUserInteraction: (message: string) => Promise<void>): Promise<string> {
	if (!isUserscript && permissions.length && !await Permissions.has(permissions)) {
		const resAuth = 'https://redditenhancementsuite.com/oauth';
		if (process.env.BUILD_TARGET !== 'firefox' && !await Permissions.has([resAuth])) {
			permissions.push(resAuth);
		}

		await warnUserInteraction(permissions.includes(resAuth) ? 'You may be redirected to redditenhancementsuite.com to complete the login process.' : '');

		await Permissions.request(permissions);
	}

	let responseUrl;

	if (isUserscript && authAdapter) {
		responseUrl = await authAdapter.launchAuthFlow({ domain, clientId, scope, interactive: true });
	} else {
		try {
			responseUrl = await sendMessage('authFlow', { domain, clientId, scope, interactive: false });
		} catch (e) {
			console.error('Noninteractive auth failed:', e);
			responseUrl = await sendMessage('authFlow', { domain, clientId, scope, interactive: true });
		}
	}

	const hash = new URL(responseUrl).hash.slice(1);
	const token = new URLSearchParams(hash).get('access_token');

	if (!token) throw new Error('No token found in response.');

	return token;
}
