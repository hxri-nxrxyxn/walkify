<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		PERMISSION_STEPS,
		checkAllPermissions,
		checkPermission,
		requestPermission,
		openPermissionSettings,
	} from '$lib/permissions.js';

	// ─── State ─────────────────────────────────────────────────────────────────
	let pendingSteps = $state([]);  // only the un-granted permission steps
	let currentIndex = $state(0);
	let granted = $state(false);
	let busy = $state(false);
	let message = $state('');

	const step = $derived(pendingSteps[currentIndex] ?? null);
	const progress = $derived(
		pendingSteps.length > 0 ? `${currentIndex + 1} of ${pendingSteps.length}` : ''
	);

	// ─── Initialise ────────────────────────────────────────────────────────────
	onMount(async () => {
		const perms = await checkAllPermissions();
		pendingSteps = PERMISSION_STEPS.filter((s) => !perms[s.id]);
		if (pendingSteps.length === 0) {
			goto('/home', { replaceState: true });
		}
	});

	// ─── Handlers ──────────────────────────────────────────────────────────────

	async function handleGrant() {
		busy = true;
		message = '';
		try {
			const ok = await requestPermission(step.id);
			if (ok) {
				granted = true;
				message = '✓ Permission granted.';
			} else {
				message = 'Permission was not granted. Please try again.';
			}
		} catch (e) {
			message = 'Error: ' + e.message;
		}
		busy = false;
	}

	async function handleOpenSettings() {
		await openPermissionSettings(step.id);
	}

	async function handleCheckAgain() {
		busy = true;
		message = 'Checking...';
		try {
			const ok = await checkPermission(step.id);
			if (ok) {
				granted = true;
				message = '✓ Permission granted.';
			} else {
				message = 'Not yet granted. Please go back to settings and enable it.';
			}
		} catch (e) {
			message = 'Error: ' + e.message;
		}
		busy = false;
	}

	function handleNext() {
		granted = false;
		message = '';
		const next = currentIndex + 1;
		if (next >= pendingSteps.length) {
			goto('/home', { replaceState: true });
		} else {
			currentIndex = next;
		}
	}
</script>

<svelte:head>
	<title>Walkify — Setup</title>
</svelte:head>

{#if step}
	<main>
		<p>{progress}</p>
		<h1>{step.title}</h1>
		<p>{step.reason}</p>

		{#if granted}
			<p>{message}</p>
			<button onclick={handleNext}>Next</button>
		{:else}
			{#if step.type === 'runtime'}
				<button onclick={handleGrant} disabled={busy}>
					{busy ? 'Requesting...' : 'Grant Permission'}
				</button>
			{:else}
				<button onclick={handleOpenSettings} disabled={busy}>Open Settings</button>
				<button onclick={handleCheckAgain} disabled={busy}>
					{busy ? 'Checking...' : "I've done it — check again"}
				</button>
			{/if}
			{#if message}
				<p>{message}</p>
			{/if}
		{/if}
	</main>
{:else}
	<p>Loading...</p>
{/if}
