/* @flow */

import { id as idAdapter } from '../adapters';

export function getExtensionId(): string {
	return idAdapter.getExtensionId();
}

export const getURL = (path: string) => idAdapter.getURL(path);

export const getOptionsURL = (hash: string = '') => new URL(hash, getURL('options.html'));
export const isOptionsPage = () => location.origin === getOptionsURL().origin;
