<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Capacitor } from '@capacitor/core';
	import { checkAllPermissions, PERMISSION_STEPS } from '$lib/permissions.js';

	onMount(async () => {
		if (!Capacitor.isNativePlatform()) {
			goto('/home');
			return;
		}
		const perms = await checkAllPermissions();
		const hasPending = PERMISSION_STEPS.some((s) => !perms[s.id]);
		goto(hasPending ? '/setup' : '/home', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Walkify</title>
	<meta name="description" content="Walk to earn your doomscroll minutes." />
</svelte:head>

<p>Loading...</p>

