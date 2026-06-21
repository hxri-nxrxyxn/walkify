import { Capacitor } from '@capacitor/core';
import { goto } from '$app/navigation';
import { getBalance } from '$lib/permissions.js';

const DEFAULT_BLOCKED_APPS = [
	'com.instagram.android',
	'com.facebook.katana',
	'com.twitter.android',
];

/**
 * Loads the blocked app list from localStorage.
 * Falls back to the default set if nothing is saved or JSON is invalid.
 * @returns {string[]}
 */
export function loadBlockedApps() {
	const saved = localStorage.getItem('walkify_blocked_apps');
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch (e) {
			return [...DEFAULT_BLOCKED_APPS];
		}
	}
	return [...DEFAULT_BLOCKED_APPS];
}

/**
 * Checks whether a blocked app is currently foregrounded with zero balance,
 * then navigates to /blocked or back to /home as appropriate.
 *
 * Must only be called on a native platform and outside of the /setup route.
 */
export async function checkBlockState() {
	if (!Capacitor.isNativePlatform()) return;

	const currentPath = window.location.pathname;
	if (currentPath === '/setup') return;

	try {
		const balance = await getBalance();
		const blockedApps = loadBlockedApps();

		const isBlockedApp =
			balance.blockingEnabled &&
			balance.minutes <= 0.0 &&
			balance.foregroundPackage &&
			blockedApps.includes(balance.foregroundPackage);

		if (isBlockedApp) {
			if (currentPath !== '/blocked') {
				goto(`/blocked?app=${encodeURIComponent(balance.foregroundPackage)}`, { replaceState: true });
			}
		} else {
			if (currentPath === '/blocked') {
				goto('/home', { replaceState: true });
			}
		}
	} catch (err) {
		console.error('Error checking block state:', err);
	}
}

/**
 * Attaches a 1 s polling interval and a visibilitychange listener that both
 * call checkBlockState(). Returns a cleanup function to remove them.
 * @returns {() => void}
 */
export function startBlockGuard() {
	const handleVisibility = () => {
		if (document.visibilityState === 'visible') {
			checkBlockState();
		}
	};
	document.addEventListener('visibilitychange', handleVisibility);
	const interval = setInterval(checkBlockState, 1000);

	return () => {
		document.removeEventListener('visibilitychange', handleVisibility);
		clearInterval(interval);
	};
}
