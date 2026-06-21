<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getBalance } from '$lib/permissions.js';
	import { getAppMeta } from '$lib/appRegistry.js';

	let appPkg = $state('com.instagram.android');
	let minutesNeeded = $state(8);
	let stepsNeeded = $state(1142);

	const appName = $derived(getAppMeta(appPkg).name);

	onMount(async () => {
		// Read app parameter from URL query string
		const urlApp = $page.url.searchParams.get('app');
		if (urlApp) {
			appPkg = urlApp;
		}

		// Pull current balance metrics if on native
		try {
			const bal = await getBalance();
			if (bal) {
				// Estimate steps and minutes needed based on current progress
				// Let's assume a baseline target of 5 minutes (or steps equivalent) to unlock
				if (bal.minutes <= 0) {
					// Hardcode some sensible progress targets based on steps
					// e.g. target is 5000 steps, each minute is 1000 steps.
					const currentSteps = bal.steps || 0;
					const targetSteps = 2000; // Let's set a 2k steps threshold for simulator demo
					const stepsDiff = Math.max(0, targetSteps - currentSteps);
					stepsNeeded = stepsDiff > 0 ? stepsDiff : 1142;
					minutesNeeded = Math.ceil(stepsNeeded / 150); // ~150 steps per minute
				}
			}
		} catch (e) {
			console.log('Using mock layout values for blocked screen.');
		}
	});

	function handleWalkNow() {
		goto('/home/walking');
	}

	function handleDismiss() {
		goto('/home');
	}
</script>

<svelte:head>
	<title>Locked — {appName}</title>
</svelte:head>

<main class="locked-container">
	<!-- Top indicator badge -->
	<div class="locked-badge">
		<span class="material-symbols-outlined locked-icon">lock_clock</span>
	</div>

	<!-- App Identity -->
	<div class="app-identity reveal">
		<span class="font-label-caps app-label">{appName}</span>
	</div>

	<!-- Locked Headline -->
	<div class="headline-container reveal" style="animation-delay: 0.1s;">
		<h1 class="font-display-hero-mobile locked-title">Locked</h1>
		<div class="glow-accent-bar"></div>
	</div>

	<!-- Required Progress Metrics -->
	<div class="metrics-grid reveal" style="animation-delay: 0.25s;">
		<!-- Minutes Required -->
		<div class="metric-row group">
			<div class="metric-digits-container">
				<span class="font-numeral-xl metric-value">{minutesNeeded}</span>
				<span class="font-label-caps metric-label">MINUTES</span>
			</div>
			<p class="font-body-md metric-description">Needed to unlock feed</p>
		</div>

		<!-- Steps Required -->
		<div class="metric-row group">
			<div class="metric-digits-container">
				<span class="font-numeral-xl metric-value">{stepsNeeded.toLocaleString()}</span>
				<span class="font-label-caps metric-label">STEPS</span>
			</div>
			<p class="font-body-md metric-description">Away from your goal</p>
		</div>
	</div>

	<!-- Bottom Action Area -->
	<div class="actions-panel reveal" style="animation-delay: 0.4s;">
		<button onclick={handleWalkNow} class="btn-primary walk-btn interactive-element">
			[ WALK NOW ]
		</button>
		
		<button onclick={handleDismiss} class="dismiss-btn font-label-caps interactive-element">
			Return to Focus
		</button>
	</div>
</main>

<style>
	.locked-container {
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
		padding: 120px var(--spacing-margin-safe) 180px var(--spacing-margin-safe);
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		justify-content: center;
	}

	.locked-badge {
		position: fixed;
		top: var(--spacing-gutter);
		right: var(--spacing-margin-safe);
		opacity: 0.4;
		z-index: 60;
	}

	.locked-icon {
		color: var(--color-primary);
		font-size: 24px;
	}

	.app-identity {
		margin-bottom: var(--spacing-stack-loose);
	}

	.app-label {
		color: rgba(226, 226, 226, 0.6);
		letter-spacing: 0.2em;
	}

	.headline-container {
		margin-bottom: var(--spacing-section-gap);
	}

	.locked-title {
		color: #ffffff;
		letter-spacing: -0.04em;
	}

	.glow-accent-bar {
		width: 48px;
		height: 4px;
		background-color: var(--color-primary-container);
		border-radius: var(--rounded-full);
		margin-top: 16px;
		box-shadow: 0 0 10px rgba(0, 209, 255, 0.5);
	}

	.metrics-grid {
		display: flex;
		flex-direction: column;
		gap: 40px;
		width: 100%;
		margin-bottom: 48px;
	}

	.metric-row {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.metric-digits-container {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.metric-value {
		font-size: 72px;
		line-height: 1;
		color: var(--color-on-surface);
		transition: color 0.5s ease;
	}

	.metric-row:hover .metric-value {
		color: var(--color-primary);
	}

	.metric-label {
		color: var(--color-on-surface-variant);
		opacity: 0.6;
	}

	.metric-description {
		color: rgba(187, 201, 207, 0.4);
		margin-top: 8px;
	}

	.actions-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: 480px;
		margin: 0 auto;
		padding: 0 var(--spacing-margin-safe) 48px var(--spacing-margin-safe);
		background: linear-gradient(to top, #000000 80%, transparent);
		z-index: 50;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.walk-btn {
		width: 100%;
		height: 64px;
		font-weight: 700;
	}

	.dismiss-btn {
		font-size: 10px;
		color: rgba(187, 201, 207, 0.4);
		background: transparent;
		border: none;
		padding: 12px 0;
		cursor: pointer;
		text-align: center;
		transition: color 0.2s ease;
	}

	.dismiss-btn:hover {
		color: var(--color-on-surface);
	}
</style>
