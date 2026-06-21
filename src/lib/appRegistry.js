export const APP_REGISTRY = [
	{ keyword: 'instagram', name: 'Instagram', defaultPkg: 'com.instagram.android' },
	{ keyword: 'youtube', name: 'YouTube', defaultPkg: 'com.google.android.youtube' },
	{ keyword: 'tiktok', name: 'TikTok', defaultPkg: 'com.zhiliaoapp.musically' },
	{ keyword: 'facebook', name: 'Facebook', defaultPkg: 'com.facebook.katana' },
	{ keyword: 'whatsapp', name: 'WhatsApp', defaultPkg: 'com.whatsapp' },
	{ keyword: 'twitter', name: 'Twitter/X', defaultPkg: 'com.twitter.android' },
	{ keyword: 'x.android', name: 'Twitter/X', defaultPkg: 'com.twitter.android' },
	{ keyword: 'reddit', name: 'Reddit', defaultPkg: 'com.reddit.frontpage' },
	{ keyword: 'snapchat', name: 'Snapchat', defaultPkg: 'com.snapchat.android' },
	{ keyword: 'netflix', name: 'Netflix', defaultPkg: 'com.netflix.mediaclient' },
	{ keyword: 'twitch', name: 'Twitch', defaultPkg: 'tv.twitch.android.app' },
	{ keyword: 'pinterest', name: 'Pinterest', defaultPkg: 'com.pinterest' },
	{ keyword: 'linkedin', name: 'LinkedIn', defaultPkg: 'com.linkedin.android' },
];

/**
 * Returns friendly metadata for a package name.
 * @param {string} pkg - The package name of the app.
 * @returns {{ name: string, keyword: string }}
 */
export function getAppMeta(pkg) {
	if (!pkg) return { name: 'Unknown App', keyword: 'generic' };
	const lower = pkg.toLowerCase();
	const match = APP_REGISTRY.find(app => lower.includes(app.keyword));
	if (match) {
		return { name: match.name, keyword: match.keyword };
	}
	
	// Fallback to capitalizing the last segment of the package name
	const parts = pkg.split('.');
	const name = parts[parts.length - 1] || pkg;
	const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
	return { name: formattedName, keyword: 'generic' };
}
