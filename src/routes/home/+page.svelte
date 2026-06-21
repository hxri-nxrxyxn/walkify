<script>
	import { onMount, onDestroy } from 'svelte';
	import { Capacitor } from '@capacitor/core';
	import {
		getBalance,
		setBalance,
		setBlockedApps,
		startBlockingService,
		stopBlockingService
	} from '$lib/permissions.js';

	let pollInterval = null;
	let blockedApps = $state([]);
	let newAppPackage = $state('');
	let serviceRunning = $state(false);

	// ─── DOM update helpers (vanilla JS for maximum efficiency) ────────────────
	function el(id) {
		return document.getElementById(id);
	}

	async function updateFromNative() {
		if (!Capacitor.isNativePlatform()) return;
		try {
			const res = await getBalance();
			if (res) {
				const steps = res.steps || 0;
				const minutes = res.minutes || 0;
				
				if (el('steps')) {
					el('steps').textContent = String(steps).padStart(4, '0');
				}
				if (el('earned')) {
					el('earned').textContent = minutes.toFixed(2);
				}
			}
		} catch (err) {
			console.error('Error polling balance', err);
		}
	}

	async function toggleService() {
		if (!Capacitor.isNativePlatform()) return;
		try {
			if (serviceRunning) {
				await stopBlockingService();
				serviceRunning = false;
				if (el('status')) el('status').textContent = 'Background service stopped.';
			} else {
				await startBlockingService();
				serviceRunning = true;
				if (el('status')) el('status').textContent = 'Background service running.';
			}
		} catch (err) {
			alert('Error toggling service: ' + err.message);
		}
	}

	async function addMinute() {
		if (Capacitor.isNativePlatform()) {
			const res = await getBalance();
			const newMins = (res.minutes || 0) + 1.0;
			await setBalance(newMins);
			await updateFromNative();
		} else {
			// Web fallback
			let currentMins = parseFloat(localStorage.getItem('walkify_earned_mins') || '0');
			currentMins += 1.0;
			localStorage.setItem('walkify_earned_mins', currentMins.toString());
			if (el('earned')) el('earned').textContent = currentMins.toFixed(2);
		}
	}

	async function clearBalance() {
		if (Capacitor.isNativePlatform()) {
			await setBalance(0.0);
			await updateFromNative();
		} else {
			// Web fallback
			localStorage.setItem('walkify_earned_mins', '0');
			if (el('earned')) el('earned').textContent = '0.00';
		}
	}

	async function addBlockedApp() {
		const pkg = newAppPackage.trim();
		if (!pkg) return;
		if (!blockedApps.includes(pkg)) {
			blockedApps = [...blockedApps, pkg];
			localStorage.setItem('walkify_blocked_apps', JSON.stringify(blockedApps));
			await syncBlockedApps();
		}
		newAppPackage = '';
	}

	async function removeBlockedApp(pkg) {
		blockedApps = blockedApps.filter(p => p !== pkg);
		localStorage.setItem('walkify_blocked_apps', JSON.stringify(blockedApps));
		await syncBlockedApps();
	}

	async function syncBlockedApps() {
		if (Capacitor.isNativePlatform()) {
			await setBlockedApps(blockedApps);
		}
	}

	// ─── Lifecycle ─────────────────────────────────────────────────────────────
	onMount(async () => {
		// Load blocked apps from local storage
		const saved = localStorage.getItem('walkify_blocked_apps');
		if (saved) {
			try {
				blockedApps = JSON.parse(saved);
			} catch (e) {
				blockedApps = ['com.instagram.android', 'com.facebook.katana', 'com.twitter.android'];
			}
		} else {
			blockedApps = ['com.instagram.android', 'com.facebook.katana', 'com.twitter.android'];
		}
		
		// Initial sync
		await syncBlockedApps();

		if (!Capacitor.isNativePlatform()) {
			if (el('status')) el('status').textContent = 'Step sensor / Blocker not available on web.';
			// Show dummy web values
			const mins = parseFloat(localStorage.getItem('walkify_earned_mins') || '0');
			if (el('earned')) el('earned').textContent = mins.toFixed(2);
			return;
		}

		// Auto-start foreground service on mount
		try {
			await startBlockingService();
			serviceRunning = true;
			if (el('status')) el('status').textContent = 'Background service running.';
		} catch (err) {
			if (el('status')) el('status').textContent = 'Failed to start service: ' + err.message;
		}

		// Polling native state every 1 second
		await updateFromNative();
		pollInterval = setInterval(updateFromNative, 1000);
	});

	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
	});
</script>

<svelte:head>
	<title>Walkify</title>
	<meta name="description" content="Walk to earn your doomscroll minutes." />
</svelte:head>

<main>
	<h1 id="steps">0000</h1>

	<table>
		<tbody>
			<tr>
				<th>Service Status</th>
				<td id="status">Initializing...</td>
			</tr>
			<tr>
				<th>Balance</th>
				<td><span id="earned">0.00</span> scroll minutes</td>
			</tr>
		</tbody>
	</table>

	<h2>Service Control</h2>
	<div>
		<button onclick={toggleService}>
			{serviceRunning ? 'Stop Service' : 'Start Service'}
		</button>
	</div>

	<h2>Test Controls</h2>
	<div>
		<button onclick={addMinute}>Add 1 Minute</button>
		<button onclick={clearBalance}>Clear Balance (Lock Blocker)</button>
	</div>

	<h2>Blocked Apps</h2>
	<form onsubmit={(e) => { e.preventDefault(); addBlockedApp(); }}>
		<input 
			type="text" 
			placeholder="App package name (e.g. com.instagram.android)" 
			bind:value={newAppPackage} 
		/>
		<button type="submit">Block App</button>
	</form>

	<ul>
		{#each blockedApps as app}
			<li>
				<span>{app}</span>
				<button onclick={() => removeBlockedApp(app)}>Unblock</button>
			</li>
		{/each}
	</ul>
</main>
