/* @flow */

import { privateBrowsing as privateBrowsingAdapter } from '../adapters';

export function isPrivateBrowsing(): boolean {
	return privateBrowsingAdapter.isPrivateBrowsing();
}
