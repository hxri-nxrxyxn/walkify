<script>
	import { onMount } from 'svelte';
	import { getBalance } from '$lib/permissions.js';

	let weeklyEarned = $state(420);
	let hoursReclaimed = $state(12);
	let spentMins = $state(184);
	let streakDays = $state(14);

	onMount(async () => {
		try {
			const bal = await getBalance();
			if (bal && bal.minutes) {
				// Incorporate the current active balance into our weekly total
				weeklyEarned = 420 + Math.round(bal.minutes);
			}
		} catch (e) {
			console.log('Using mockup fallback values for stats.');
		}
	});
</script>

<svelte:head>
	<title>MOTION — Statistics</title>
</svelte:head>

<main class="history-container">
	<div class="header-spacer"></div>

	<!-- Header text -->
	<div class="stats-header fade-in" style="animation-delay: 0.1s;">
		<p class="font-label-caps stats-tag">Performance Summary</p>
		<h2 class="font-headline-lg-mobile stats-headline">Your time is your most valuable asset.</h2>
	</div>

	<!-- Metric: Minutes Earned -->
	<section class="metric-section fade-in" style="animation-delay: 0.2s;">
		<p class="font-label-caps metric-title">Earned This Week</p>
		<div class="metric-display">
			<span class="font-numeral-xl metric-number">{weeklyEarned}</span>
			<span class="metric-superscript">m</span>
		</div>
		<div class="progress-bar">
			<div class="progress-bar-fill" style="width: 70%;"></div>
		</div>
	</section>

	<!-- Metric: Hours Reclaimed -->
	<section class="metric-section fade-in" style="animation-delay: 0.3s;">
		<p class="font-label-caps metric-title">Hours Reclaimed</p>
		<div class="metric-display">
			<span class="font-numeral-xl metric-number">{hoursReclaimed}</span>
			<span class="metric-superscript">h</span>
		</div>
		<p class="font-body-md metric-text">
			You have redirected {hoursReclaimed} hours from passive scrolling to active movement this month.
		</p>
	</section>

	<!-- Bento Grid for secondary metrics -->
	<div class="bento-grid fade-in" style="animation-delay: 0.4s;">
		<!-- Spent -->
		<div class="bento-card">
			<p class="font-label-caps card-title">Spent</p>
			<div class="card-value-row">
				<span class="font-headline-lg-mobile card-value">{spentMins}</span>
				<span class="card-unit">m</span>
			</div>
		</div>

		<!-- Streak -->
		<div class="bento-card">
			<p class="font-label-caps card-title">Streak</p>
			<div class="card-value-row items-center">
				<span class="font-headline-lg-mobile card-value">{streakDays}</span>
				<span class="material-symbols-outlined streak-icon">bolt</span>
			</div>
		</div>
	</div>

	<!-- CTA Action button -->
	<div class="action-row fade-in" style="animation-delay: 0.5s;">
		<button disabled class="btn-secondary report-btn" style="opacity: 0.35; cursor: not-allowed;">
			[ REPORT GENERATES SUNDAY ]
		</button>
	</div>
</main>

<style>
	.history-container {
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
		padding: 0 var(--spacing-margin-safe) 140px var(--spacing-margin-safe);
		display: flex;
		flex-direction: column;
	}

	.header-spacer {
		height: 96px;
	}

	.stats-header {
		margin-top: 16px;
		margin-bottom: var(--spacing-section-gap);
		width: 100%;
	}

	.stats-tag {
		color: var(--color-on-surface-variant);
		margin-bottom: 12px;
	}

	.stats-headline {
		color: #ffffff;
		line-height: 1.3;
	}

	.metric-section {
		width: 100%;
		margin-bottom: var(--spacing-section-gap);
	}

	.metric-title {
		color: var(--color-on-surface-variant);
		margin-bottom: 8px;
		letter-spacing: 0.15em;
	}

	.metric-display {
		display: flex;
		align-items: baseline;
	}

	.metric-number {
		font-size: 96px;
		line-height: 90px;
		color: #ffffff;
	}

	.metric-superscript {
		font-size: 32px;
		font-weight: 700;
		color: var(--color-primary);
		margin-left: 4px;
		opacity: 0.8;
	}

	.progress-bar {
		width: 100%;
		height: 2px;
		background-color: rgba(255, 255, 255, 0.1);
		margin-top: 16px;
		position: relative;
	}

	.progress-bar-fill {
		height: 100%;
		background-color: var(--color-primary);
		box-shadow: 0 0 8px rgba(164, 230, 255, 0.6);
	}

	.metric-text {
		color: var(--color-on-surface-variant);
		opacity: 0.7;
		margin-top: 12px;
		line-height: 1.5;
	}

	.bento-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-stack-loose);
		width: 100%;
		margin-bottom: var(--spacing-section-gap);
	}

	.bento-card {
		display: flex;
		flex-direction: column;
		border-left: 1px solid rgba(255, 255, 255, 0.08);
		padding-left: 16px;
	}

	.card-title {
		color: var(--color-on-surface-variant);
		margin-bottom: 8px;
		font-size: 10px;
	}

	.card-value-row {
		display: flex;
		align-items: baseline;
		gap: 4px;
	}

	.card-value {
		color: #ffffff;
		font-size: 28px;
		font-weight: 700;
	}

	.card-unit {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-on-surface-variant);
		opacity: 0.6;
	}

	.streak-icon {
		color: var(--color-primary);
		font-size: 22px;
		font-variation-settings: 'FILL' 1;
	}

	.action-row {
		width: 100%;
	}

	.report-btn {
		width: 100%;
	}
</style>
