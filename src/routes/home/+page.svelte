<script>
	import { onMount, onDestroy } from 'svelte';
	import { Capacitor } from '@capacitor/core';
	import { createStepTracker } from '$lib/stepTracker.js';

	let tracker = null;

	// ─── DOM update helpers (vanilla JS, no reactive state needed) ─────────────

	function el(id) {
		return document.getElementById(id);
	}

	function handleUpdate(update) {
		if (update.steps !== undefined) {
			el('steps').textContent = String(update.steps).padStart(4, '0');
		}
		if (update.earned !== undefined) {
			el('earned').textContent = update.earned;
		}
		if (update.status !== undefined) {
			el('status').textContent = update.status;
		}
		if (update.anticheat !== undefined) {
			el('anticheat').textContent = update.anticheat;
		}
	}

	// ─── Lifecycle ─────────────────────────────────────────────────────────────

	onMount(() => {
		if (!Capacitor.isNativePlatform()) {
			el('status').textContent = 'Step sensor not available on web.';
			return;
		}

		tracker = createStepTracker(handleUpdate);

		tracker.start().catch((err) => {
			el('status').textContent = 'Error starting tracker: ' + err.message;
		});
	});

	onDestroy(() => {
		tracker?.stop();
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
				<th>Status</th>
				<td id="status">Initializing...</td>
			</tr>
			<tr>
				<th>Earned today</th>
				<td><span id="earned">0</span> scroll minutes</td>
			</tr>
			<tr>
				<th>Anti-cheat</th>
				<td id="anticheat"></td>
			</tr>
		</tbody>
	</table>
</main>
