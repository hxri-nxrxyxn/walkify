import { Capacitor } from '@capacitor/core';
import {
	getBalance,
	setBalance,
	setBlockedApps,
	startBlockingService,
	stopBlockingService,
} from '$lib/permissions.js';
import { loadBlockedApps } from '$lib/blockGuard.js';

const STORAGE_KEY_BLOCKED = 'walkify_blocked_apps';
const STORAGE_KEY_MINS = 'walkify_earned_mins';


// ─── Native polling ───────────────────────────────────────────────────────────

/**
 * Fetches the current balance from the native plugin and triggers the
 * callback with updated metrics.
 *
 * @param {(data: { steps: number, minutes: number }) => void} onUpdate
 */
export async function updateFromNative(onUpdate) {
	if (!Capacitor.isNativePlatform()) return;
	try {
		const res = await getBalance();
		if (res && onUpdate) {
			onUpdate({
				steps: res.steps || 0,
				minutes: res.minutes || 0,
			});
		}
	} catch (err) {
		console.error('Error polling balance', err);
	}
}

// ─── Service control ──────────────────────────────────────────────────────────

/**
 * Toggles the foreground blocking service on/off.
 *
 * @param {boolean} serviceRunning  Current running state.
 * @returns {Promise<boolean>}  The new running state.
 */
export async function toggleService(serviceRunning) {
	if (!Capacitor.isNativePlatform()) return serviceRunning;
	try {
		if (serviceRunning) {
			await stopBlockingService();
			return false;
		} else {
			await startBlockingService();
			return true;
		}
	} catch (err) {
		alert('Error toggling service: ' + err.message);
		return serviceRunning;
	}
}

// ─── Balance helpers ──────────────────────────────────────────────────────────

/**
 * Adds one scroll minute to the balance (native or web fallback).
 *
 * @param {(data: { steps: number, minutes: number }) => void} onUpdate
 */
export async function addMinute(onUpdate) {
	if (Capacitor.isNativePlatform()) {
		const res = await getBalance();
		const newMins = (res.minutes || 0) + 1.0;
		await setBalance(newMins);
		await updateFromNative(onUpdate);
	} else {
		let current = parseFloat(localStorage.getItem(STORAGE_KEY_MINS) || '0');
		current += 1.0;
		localStorage.setItem(STORAGE_KEY_MINS, current.toString());
		if (onUpdate) {
			onUpdate({ steps: 0, minutes: current });
		}
	}
}

/**
 * Resets the balance to zero (native or web fallback).
 *
 * @param {(data: { steps: number, minutes: number }) => void} onUpdate
 */
export async function clearBalance(onUpdate) {
	if (Capacitor.isNativePlatform()) {
		await setBalance(0.0);
		await updateFromNative(onUpdate);
	} else {
		localStorage.setItem(STORAGE_KEY_MINS, '0');
		if (onUpdate) {
			onUpdate({ steps: 0, minutes: 0 });
		}
	}
}

// ─── Blocked apps ─────────────────────────────────────────────────────────────

/**
 * Persists the blocked-apps list to localStorage and syncs it to the native
 * plugin (no-op on web).
 *
 * @param {string[]} apps
 */
export async function persistBlockedApps(apps) {
	localStorage.setItem(STORAGE_KEY_BLOCKED, JSON.stringify(apps));
	if (Capacitor.isNativePlatform()) {
		await setBlockedApps(apps);
	}
}

// ─── Mount / init ─────────────────────────────────────────────────────────────

/**
 * Initialises the home page: loads blocked apps, starts the service (native
 * only), and sets up a 1 s polling interval.
 *
 * @param {(data: { steps: number, minutes: number }) => void} onUpdate
 * @returns {Promise<{ blockedApps: string[], serviceRunning: boolean, pollInterval: number|null }>}
 */
export async function initHome(onUpdate) {
	// Load + sync blocked apps
	const blockedApps = loadBlockedApps();
	await persistBlockedApps(blockedApps);

	if (!Capacitor.isNativePlatform()) {
		const mins = parseFloat(localStorage.getItem(STORAGE_KEY_MINS) || '0');
		if (onUpdate) {
			onUpdate({ steps: 0, minutes: mins });
		}
		return { blockedApps, serviceRunning: false, pollInterval: null };
	}

	// Auto-start foreground service
	let serviceRunning = false;
	try {
		await startBlockingService();
		serviceRunning = true;
	} catch (err) {
		console.error('Failed to start service: ' + err.message);
	}

	// Initial fetch + start polling
	await updateFromNative(onUpdate);
	const pollInterval = setInterval(() => updateFromNative(onUpdate), 1000);

	return { blockedApps, serviceRunning, pollInterval };
}
