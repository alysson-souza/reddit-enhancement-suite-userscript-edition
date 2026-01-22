/* @flow */
/* eslint-disable require-await */

import { createMessageHandler } from '../utils/messaging';
import { messaging as messagingAdapter } from '../adapters';

// $FlowIgnore - process.env defined at build time
const isUserscript: boolean = process.env.BUILD_TARGET === 'userscript';

let _handleMessage;
let sendMessage;
let addListener;

if (isUserscript) {
	const handlers: Map<string, (data: mixed) => Promise<mixed> | mixed> = new Map();

	sendMessage = async (type: string, data: mixed): Promise<any> => {
		const handler = handlers.get(type);
		if (handler) {
			return handler(data);
		}
		return messagingAdapter.sendMessage(type, data);
	};

	addListener = (type: string, callback: (data: mixed) => Promise<mixed> | mixed) => {
		handlers.set(type, callback);
	};

	_handleMessage = () => false;
} else {
	// $FlowIgnore - Type cast for extension adapter messaging
	const handler = createMessageHandler((obj: any) => messagingAdapter.sendMessage(obj));
	_handleMessage = handler._handleMessage;
	sendMessage = handler.sendMessage;
	addListener = handler.addListener;

	// $FlowIgnore - Type cast for extension adapter messaging
	messagingAdapter.addListener((obj: any, sendResponse: any) => _handleMessage(obj, sendResponse));
}

export {
	sendMessage,
	addListener,
};
