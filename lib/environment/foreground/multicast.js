/* @flow */

import { addListener, sendMessage } from './messaging';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

const callbacks = new Map();

let broadcastChannel: ?BroadcastChannel = null;

function getBroadcastChannel(): BroadcastChannel {
	if (!broadcastChannel) {
		broadcastChannel = new BroadcastChannel('RES_multicast_channel');
		broadcastChannel.onmessage = (event: MessageEvent) => {
			const { name, args } = (event.data: any);
			const callback = callbacks.get(name);
			if (callback) callback(...args);
		};
	}
	return broadcastChannel;
}

if (!isUserscript) {
	addListener('multicast', data => {
		const { name, args } = (data: any);
		const callback = callbacks.get(name);
		if (callback) return callback(...args);
	});
}

export function multicast<T:(...args: any) => any>(callback: T, { name, local = true, crossContext = true }: {| name: string, local?: boolean, crossContext?: boolean |}): T {
	if (callbacks.has(name)) {
		throw new Error(`Multicast handler with name "${name}" exists.`);
	}

	callbacks.set(name, callback);

	function localOnly(...args) {
		callback(...args);
	}

	const invoke: any = (...args) => {
		if (isUserscript) {
			if (crossContext) {
				getBroadcastChannel().postMessage({ name, args });
			}
		} else {
			sendMessage('multicast', { name, args, crossContext });
		}

		if (local) {
			localOnly(...args);
		}
	};

	invoke.local = localOnly;

	return invoke;
}
