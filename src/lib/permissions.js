import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Ordered list of permissions Walkify requires.
 * type: 'runtime'  — triggers a system dialog directly.
 * type: 'settings' — sends the user to a settings screen manually.
 */
export const PERMISSION_STEPS = [
	{
		id: 'activityRecognition',
		title: 'Walkify needs permission to count your steps.',
		reason:
			'This uses the Activity Recognition sensor built into your phone. Without it, ' +
			'no steps can be counted and no doomscroll minutes can be earned.',
		type: 'runtime',
	},
	{
		id: 'location',
		title: 'Walkify needs your location to verify you are actually moving.',
		reason:
			'GPS speed is used as an anti-cheat check. It prevents you from earning steps ' +
			'by shaking the phone or riding in a vehicle. Only movement speed is read — ' +
			'no position data is stored or transmitted.',
		type: 'runtime',
	},
	{
		id: 'notifications',
		title: 'Walkify needs permission to show a notification.',
		reason:
			'A persistent foreground notification keeps Walkify running in the background. ' +
			'Without it, step tracking and app blocking stop the moment you close the app.',
		type: 'runtime',
	},
	{
		id: 'usageStats',
		title: 'Walkify needs to see which app is currently open.',
		reason:
			'Usage Access lets Walkify detect when you open a blocked social media app. ' +
			'This is required for the doomscroll time limit to work. Go to the settings ' +
			'screen and enable Walkify in the list.',
		type: 'settings',
		openMethod: 'openUsageAccessSettings',
	},
	{
		id: 'overlay',
		title: 'Walkify needs to display over other apps.',
		reason:
			'This lets Walkify draw a lock screen on top of blocked apps when your ' +
			'doomscroll minutes run out. Without it, the block overlay cannot appear. ' +
			'Find Walkify in the list and enable the toggle.',
		type: 'settings',
		openMethod: 'openOverlaySettings',
	},
	{
		id: 'accessibility',
		title: 'Walkify needs the Accessibility Service to detect app switches instantly.',
		reason:
			'This fires in real time when you switch to a blocked app, which is more ' +
			'reliable than polling. Go to Settings → Accessibility → Installed Services, ' +
			'find Walkify, and toggle it on. Android will show a warning screen — this ' +
			'is expected and safe.',
		type: 'settings',
		openMethod: 'openAccessibilitySettings',
	},
];

let _permPlugin = null;

function getPermPlugin() {
	if (!_permPlugin && Capacitor.isNativePlatform()) {
		_permPlugin = registerPlugin('WalkifyPermissions');
	}
	return _permPlugin;
}

/**
 * Returns a map of { [permissionId]: boolean } for all steps.
 * On web, all are reported as granted so the setup wizard is bypassed.
 */
export async function checkAllPermissions() {
	if (!Capacitor.isNativePlatform()) {
		return Object.fromEntries(PERMISSION_STEPS.map((s) => [s.id, true]));
	}

	const { CapacitorPedometer } = await import('@capgo/capacitor-pedometer');
	const { Geolocation } = await import('@capacitor/geolocation');
	const permPlugin = getPermPlugin();

	const [pedoResult, geoResult, nativeResult] = await Promise.all([
		CapacitorPedometer.checkPermissions().catch(() => ({ activityRecognition: 'denied' })),
		Geolocation.checkPermissions().catch(() => ({ location: 'denied' })),
		permPlugin
			.checkPermissions()
			.catch(() => ({ usageStats: false, overlay: false, accessibility: false, notifications: false })),
	]);

	return {
		activityRecognition: pedoResult.activityRecognition === 'granted',
		location: geoResult.location === 'granted',
		notifications: nativeResult.notifications === true,
		usageStats: nativeResult.usageStats === true,
		overlay: nativeResult.overlay === true,
		accessibility: nativeResult.accessibility === true,
	};
}

/**
 * Check a single permission by id. Returns true if granted.
 */
export async function checkPermission(id) {
	if (!Capacitor.isNativePlatform()) return true;

	if (id === 'activityRecognition') {
		const { CapacitorPedometer } = await import('@capgo/capacitor-pedometer');
		const r = await CapacitorPedometer.checkPermissions();
		return r.activityRecognition === 'granted';
	}
	if (id === 'location') {
		const { Geolocation } = await import('@capacitor/geolocation');
		const r = await Geolocation.checkPermissions();
		return r.location === 'granted';
	}
	const permPlugin = getPermPlugin();
	const r = await permPlugin.checkPermissions();
	return r[id] === true;
}

/**
 * Request a runtime permission by id. Returns true if granted.
 * Only valid for type: 'runtime' steps.
 */
export async function requestPermission(id) {
	if (!Capacitor.isNativePlatform()) return true;

	if (id === 'activityRecognition') {
		const { CapacitorPedometer } = await import('@capgo/capacitor-pedometer');
		const r = await CapacitorPedometer.requestPermissions();
		return r.activityRecognition === 'granted';
	}
	if (id === 'location') {
		const { Geolocation } = await import('@capacitor/geolocation');
		const r = await Geolocation.requestPermissions();
		return r.location === 'granted';
	}
	if (id === 'notifications') {
		const permPlugin = getPermPlugin();
		// openNotificationSettings triggers the runtime dialog on Android 13+.
		// For older versions it's a no-op and the permission is always granted.
		await permPlugin.openNotificationSettings();
		const r = await permPlugin.checkPermissions();
		return r.notifications === true;
	}
	return false;
}

/**
 * Open the settings screen for a 'settings'-type permission.
 */
export async function openPermissionSettings(id) {
	const permPlugin = getPermPlugin();
	if (!permPlugin) return;
	const step = PERMISSION_STEPS.find((s) => s.id === id);
	if (step?.openMethod) {
		await permPlugin[step.openMethod]();
	}
}
