<script>
	import { onMount } from 'svelte';
	import { loadPendingSteps, handleGrant, handleOpenSettings, handleCheckAgain, handleNext } from '$lib/setupController.js';

	// ─── State ─────────────────────────────────────────────────────────────────
	let pendingSteps = $state([]);
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
		pendingSteps = await loadPendingSteps();
	});

	// ─── Event handlers ────────────────────────────────────────────────────────
	async function onGrant() {
		busy = true;
		message = '';
		({ granted, message } = await handleGrant(step.id));
		busy = false;
	}

	async function onOpenSettings() {
		await handleOpenSettings(step.id);
	}

	async function onCheckAgain() {
		busy = true;
		message = 'Checking...';
		({ granted, message } = await handleCheckAgain(step.id));
		busy = false;
	}

	function onNext() {
		granted = false;
		message = '';
		const next = handleNext(currentIndex, pendingSteps.length);
		if (next !== null) currentIndex = next;
	}
</script>

<svelte:head>
	<title>MOTION — Setup</title>
</svelte:head>

<main class="setup-container">
	<div class="header-spacer"></div>

	{#if step}
		<div class="setup-card reveal">
			<!-- Stepper Progress Label -->
			<div class="progress-bar-container">
				<div class="progress-label font-label-caps">{progress}</div>
				<div class="progress-line">
					<div 
						class="progress-fill" 
						style="width: {(pendingSteps.length > 0 ? ((currentIndex + 1) / pendingSteps.length) * 100 : 0)}%"
					></div>
				</div>
			</div>

			<!-- Permission title -->
			<div class="title-container">
				<h1 class="font-headline-lg-mobile step-title">{step.title}</h1>
			</div>

			<!-- Reason explanation -->
			<div class="reason-container">
				<p class="font-body-lg step-reason">{step.reason}</p>
			</div>

			<!-- Interaction Actions -->
			<div class="actions-container">
				{#if granted}
					<div class="success-capsule">
						<span class="material-symbols-outlined success-icon">check_circle</span>
						<p class="font-body-md success-message">{message || 'Access granted successfully.'}</p>
					</div>
					<button onclick={onNext} class="btn-primary next-btn interactive-element">
						[ CONTINUE ]
					</button>
				{:else}
					{#if step.type === 'runtime'}
						<button onclick={onGrant} disabled={busy} class="btn-primary action-btn interactive-element">
							{busy ? 'Requesting...' : '[ GRANT ACCESS ]'}
						</button>
					{:else}
						<button onclick={onOpenSettings} disabled={busy} class="btn-primary action-btn interactive-element">
							[ OPEN SYSTEM SETTINGS ]
						</button>
						<button onclick={onCheckAgain} disabled={busy} class="btn-secondary verify-btn interactive-element">
							{busy ? 'Verifying...' : '[ I\'VE DONE IT — VERIFY ]'}
						</button>
					{/if}

					{#if message}
						<div class="status-capsule {message.includes('fail') || message.includes('denied') || message.includes('required') ? 'error-state' : ''}">
							<span class="material-symbols-outlined status-icon">info</span>
							<p class="font-body-md status-message">{message}</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{:else}
		<div class="loading-state reveal">
			<span class="material-symbols-outlined loading-spinner">autorenew</span>
			<p class="font-label-caps">Configuring permissions...</p>
		</div>
	{/if}
</main>

<style>
	.setup-container {
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
		padding: 0 var(--spacing-margin-safe) 80px var(--spacing-margin-safe);
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		justify-content: center;
	}

	.header-spacer {
		height: 96px;
	}

	.setup-card {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.progress-bar-container {
		margin-bottom: var(--spacing-stack-loose);
	}

	.progress-label {
		color: var(--color-primary);
		letter-spacing: 0.15em;
		margin-bottom: 8px;
		display: block;
	}

	.progress-line {
		width: 100%;
		height: 2px;
		background-color: var(--color-outline-variant);
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--color-primary-container);
		transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
		box-shadow: 0 0 6px rgba(0, 209, 255, 0.4);
	}

	.title-container {
		margin-bottom: 24px;
	}

	.step-title {
		color: #ffffff;
		line-height: 1.3;
	}

	.reason-container {
		margin-bottom: var(--spacing-section-gap);
	}

	.step-reason {
		color: var(--color-on-surface-variant);
		opacity: 0.8;
	}

	.actions-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}

	.action-btn, .next-btn {
		width: 100%;
		height: 64px;
		font-weight: 700;
	}

	.verify-btn {
		width: 100%;
		height: 64px;
	}

	.success-capsule {
		display: flex;
		align-items: center;
		gap: 12px;
		background-color: rgba(164, 230, 255, 0.05);
		border: 1px solid var(--color-primary-container);
		padding: 16px;
		border-radius: var(--rounded-md);
		margin-bottom: 12px;
	}

	.success-icon {
		color: var(--color-primary);
	}

	.success-message {
		color: var(--color-on-surface);
	}

	.status-capsule {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		background-color: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--color-outline-variant);
		padding: 16px;
		border-radius: var(--rounded-md);
		margin-top: 12px;
	}

	.status-capsule.error-state {
		border-color: var(--color-error);
		background-color: rgba(255, 180, 171, 0.03);
	}

	.status-capsule.error-state .status-icon {
		color: var(--color-error);
	}

	.status-icon {
		color: var(--color-outline);
		font-size: 20px;
		margin-top: 2px;
	}

	.status-message {
		color: var(--color-on-surface-variant);
		font-size: 14px;
		line-height: 1.4;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		text-align: center;
	}

	.loading-spinner {
		font-size: 36px;
		color: var(--color-primary);
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
