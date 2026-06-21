<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getBalance, stopBlockingService } from '$lib/permissions.js';

	let currentBalance = $state(127);
	let stepsWalked = $state(1142);
	let poller = null;
	let simulationTimer = null;

	onMount(() => {
		// Set initial random simulated stats on web
		stepsWalked = 1142;
		currentBalance = 127;

		// 1. Live system poller (updates from native service)
		poller = setInterval(async () => {
			try {
				const bal = await getBalance();
				if (bal) {
					currentBalance = Math.round(bal.minutes || 0);
					stepsWalked = bal.steps || 0;
				}
			} catch (e) {
				// No native plugin found
			}
		}, 1000);

		// 2. Visual Organic Step Simulator (for web demo and responsive feel)
		function simulateWalk() {
			if (Math.random() > 0.6) {
				stepsWalked += Math.floor(Math.random() * 8) + 1;
				// Estimate minutes: ~100 steps per minute
				currentBalance = 127 + Math.floor((stepsWalked - 1142) / 100);
			}
			const nextInterval = 1000 + Math.random() * 2000;
			simulationTimer = setTimeout(simulateWalk, nextInterval);
		}
		simulationTimer = setTimeout(simulateWalk, 2000);
	});

	onDestroy(() => {
		if (poller) clearInterval(poller);
		if (simulationTimer) clearTimeout(simulationTimer);
	});

	async function handlePauseWalk() {
		try {
			// Stop background blocker if needed, or simply return to home
			await stopBlockingService();
		} catch (e) {
			console.log('Error pausing service on web.');
		}
		goto('/home');
	}
</script>

<svelte:head>
	<title>MOTION — Session Active</title>
</svelte:head>

<main class="walking-hud-container">
	<!-- Status Indicator -->
	<div class="reveal status-indicator-container">
		<div class="status-badge-pulsing">
			<span class="material-symbols-outlined walk-icon">directions_walk</span>
			<span class="font-label-caps tracking-widest active-session-label">Session Active</span>
		</div>
	</div>

	<!-- Massive Numerical Display -->
	<div class="reveal display-container" style="animation-delay: 0.15s;">
		<div class="numeral-row">
			<span class="font-numeral-xl text-primary counter-glow tabular-nums main-counter">
				{currentBalance}
			</span>
			<span class="font-headline-lg time-unit animate-unit">m</span>
		</div>
		
		<!-- Contextual feedback -->
		<div class="metrics-context">
			<p class="font-body-lg context-headline">Earned through movement today.</p>
			<div class="steps-row font-label-caps">
				<span class="steps-count">{stepsWalked.toLocaleString()}</span>
				<span class="steps-label">Validated Steps</span>
			</div>
		</div>
	</div>

	<!-- Focus / Pause Action Area -->
	<div class="reveal action-container" style="animation-delay: 0.35s;">
		<button onclick={handlePauseWalk} class="btn-primary pause-btn interactive-element">
			PAUSE WALK
		</button>
	</div>
</main>

<style>
	.walking-hud-container {
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
		padding: 0 var(--spacing-margin-safe) 140px var(--spacing-margin-safe);
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		justify-content: center;
		align-items: center;
	}

	.status-indicator-container {
		margin-bottom: var(--spacing-stack-loose);
	}

	.status-badge-pulsing {
		display: flex;
		align-items: center;
		gap: 8px;
		background-color: rgba(164, 230, 255, 0.06);
		border: 1px solid rgba(164, 230, 255, 0.15);
		padding: 8px 16px;
		border-radius: var(--rounded-full);
	}

	.walk-icon {
		color: var(--color-primary);
		font-size: 16px;
		font-variation-settings: 'FILL' 1;
	}

	.active-session-label {
		color: var(--color-primary);
		font-size: 10px;
		letter-spacing: 0.25em;
	}

	.display-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin-bottom: var(--spacing-section-gap);
		width: 100%;
	}

	.numeral-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.main-counter {
		color: var(--color-primary);
	}

	.time-unit {
		color: var(--color-primary);
		opacity: 0.4;
		margin-left: 8px;
	}

	.metrics-context {
		margin-top: 16px;
		max-width: 280px;
	}

	.context-headline {
		color: var(--color-on-surface-variant);
		opacity: 0.65;
		line-height: 1.4;
	}

	.steps-row {
		display: flex;
		justify-content: center;
		align-items: baseline;
		gap: 6px;
		margin-top: 16px;
		font-size: 11px;
	}

	.steps-count {
		color: #ffffff;
		font-weight: 700;
	}

	.steps-label {
		color: var(--color-outline);
	}

	.action-container {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.pause-btn {
		width: 100%;
		height: 64px;
		font-weight: 700;
	}
</style>
