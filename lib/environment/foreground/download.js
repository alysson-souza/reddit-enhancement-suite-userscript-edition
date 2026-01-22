/* @flow */

import { download as downloadAdapter } from '../adapters';
import { sendMessage } from './messaging';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

export function download(url: string, filename?: string) {
	const resolvedUrl = new URL(url, location.href).href;

	if (isUserscript && downloadAdapter) {
		downloadAdapter.download(resolvedUrl, filename);
	} else {
		sendMessage('download', { url: resolvedUrl, filename });
	}
}
