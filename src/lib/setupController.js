import { goto } from '$app/navigation';
import {
	PERMISSION_STEPS,
	checkAllPermissions,
	checkPermission,
	requestPermission,
	openPermissionSettings,
} from '$lib/permissions.js';

/**
 * Loads the list of un-granted permission steps and navigates to /home if
 * all permissions are already granted.
 *
 * @returns {Promise<import('$lib/permissions.js').PermissionStep[]>}
 *   The pending (un-granted) permission steps, or an empty array if
 *   redirected to /home.
 */
export async function loadPendingSteps() {
	const perms = await checkAllPermissions();
	const pending = PERMISSION_STEPS.filter((s) => !perms[s.id]);
	if (pending.length === 0) {
		goto('/home', { replaceState: true });
	}
	return pending;
}

/**
 * Requests the runtime permission for the given step.
 *
 * @param {string} stepId
 * @returns {Promise<{ granted: boolean, message: string }>}
 */
export async function handleGrant(stepId) {
	try {
		const ok = await requestPermission(stepId);
		return ok
			? { granted: true, message: '✓ Permission granted.' }
			: { granted: false, message: 'Permission was not granted. Please try again.' };
	} catch (e) {
		return { granted: false, message: 'Error: ' + e.message };
	}
}

/**
 * Opens the system settings screen for the given 'settings'-type step.
 *
 * @param {string} stepId
 */
export async function handleOpenSettings(stepId) {
	await openPermissionSettings(stepId);
}

/**
 * Re-checks a permission (typically after the user has visited settings).
 *
 * @param {string} stepId
 * @returns {Promise<{ granted: boolean, message: string }>}
 */
export async function handleCheckAgain(stepId) {
	try {
		const ok = await checkPermission(stepId);
		return ok
			? { granted: true, message: '✓ Permission granted.' }
			: { granted: false, message: 'Not yet granted. Please go back to settings and enable it.' };
	} catch (e) {
		return { granted: false, message: 'Error: ' + e.message };
	}
}

/**
 * Advances to the next pending permission step, or navigates to /home when
 * all steps are complete.
 *
 * @param {number} currentIndex
 * @param {number} totalSteps
 * @returns {number | null}  The next index, or null if navigation to /home was triggered.
 */
export function handleNext(currentIndex, totalSteps) {
	const next = currentIndex + 1;
	if (next >= totalSteps) {
		goto('/home', { replaceState: true });
		return null;
	}
	return next;
}
