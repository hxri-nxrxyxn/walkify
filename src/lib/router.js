import { Capacitor } from '@capacitor/core';
import { goto } from '$app/navigation';
import { checkAllPermissions, PERMISSION_STEPS } from '$lib/permissions.js';

/**
 * Entry-point routing logic: redirects to /setup if any permissions are
 * missing, or /home if all are granted.
 *
 * On web (non-native) we skip straight to /home.
 */
export async function resolveStartRoute() {
	if (!Capacitor.isNativePlatform()) {
		goto('/home');
		return;
	}
	const perms = await checkAllPermissions();
	const hasPending = PERMISSION_STEPS.some((s) => !perms[s.id]);
	goto(hasPending ? '/setup' : '/home', { replaceState: true });
}
