<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Capacitor } from '@capacitor/core';
	import { getBalance } from '$lib/permissions.js';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	async function checkBlockState() {
		if (!Capacitor.isNativePlatform()) return;

		const currentPath = window.location.pathname;
		if (currentPath === '/setup') return;

		try {
			const balance = await getBalance();
			
			// Load blocked apps from local storage
			const saved = localStorage.getItem('walkify_blocked_apps');
			let blockedApps = [];
			if (saved) {
				try {
					blockedApps = JSON.parse(saved);
				} catch (e) {}
			} else {
				blockedApps = ['com.instagram.android', 'com.facebook.katana', 'com.twitter.android'];
			}

			const isBlockedApp = balance.blockingEnabled && 
			                     balance.minutes <= 0.0 && 
			                     balance.foregroundPackage && 
			                     blockedApps.includes(balance.foregroundPackage);

			if (isBlockedApp) {
				if (currentPath !== '/blocked') {
					goto('/blocked', { replaceState: true });
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

	onMount(() => {
		checkBlockState();

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
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

