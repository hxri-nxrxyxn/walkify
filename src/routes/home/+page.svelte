<script>
	import { onMount, onDestroy } from 'svelte';
	import { initHome, toggleService, persistBlockedApps, clearBalance } from '$lib/homeController.js';
	import AppIcon from '$lib/AppIcon.svelte';
	import { getAppMeta, APP_REGISTRY } from '$lib/appRegistry.js';

	let pollInterval = null;
	let blockedApps = $state([]);
	let appSearchQuery = $state('');
	let showSuggestions = $state(false);
	let serviceRunning = $state(false);

	// Reactive balance and steps tracker
	let currentBalance = $state(0);
	let currentSteps = $state(0);

	// Fuzzy filter suggestions
	const suggestions = $derived.by(() => {
		const q = appSearchQuery.trim().toLowerCase();
		if (!q) return [];
		return APP_REGISTRY.filter(app => 
			(app.name.toLowerCase().includes(q) || app.defaultPkg.toLowerCase().includes(q)) &&
			!blockedApps.includes(app.defaultPkg)
		);
	});

	// ─── Lifecycle ─────────────────────────────────────────────────────────────
	onMount(async () => {
		const result = await initHome((data) => {
			currentBalance = data.minutes;
			currentSteps = data.steps;
		});
		blockedApps = result.blockedApps;
		serviceRunning = result.serviceRunning;
		pollInterval = result.pollInterval;
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});

	// ─── Event handlers ────────────────────────────────────────────────────────
	async function onAddAppBySearch() {
		const q = appSearchQuery.trim();
		if (!q) return;

		// Try to match search term to registry apps by name or package
		const match = APP_REGISTRY.find(app => 
			app.name.toLowerCase() === q.toLowerCase() || 
			app.defaultPkg.toLowerCase() === q.toLowerCase()
		);

		let pkg = q;
		if (match) {
			pkg = match.defaultPkg;
		}

		if (blockedApps.includes(pkg)) {
			appSearchQuery = '';
			showSuggestions = false;
			return;
		}

		blockedApps = [...blockedApps, pkg];
		appSearchQuery = '';
		showSuggestions = false;
		await persistBlockedApps(blockedApps);
	}

	async function selectSuggestion(app) {
		if (!blockedApps.includes(app.defaultPkg)) {
			blockedApps = [...blockedApps, app.defaultPkg];
			await persistBlockedApps(blockedApps);
		}
		appSearchQuery = '';
		showSuggestions = false;
	}

	async function onRemoveBlockedApp(pkg) {
		blockedApps = blockedApps.filter((p) => p !== pkg);
		await persistBlockedApps(blockedApps);
	}

	async function handleLockApps() {
		await clearBalance((data) => {
			currentBalance = data.minutes;
			currentSteps = data.steps;
		});
	}
</script>

<svelte:head>
	<title>MOTION — Dashboard</title>
	<meta name="description" content="Walk to earn your doomscroll minutes." />
</svelte:head>

<main class="home-container">
	<!-- Hidden hooks for background controllers -->
	<div id="status" style="display: none;"></div>

	<!-- Large Empty Space Top to match mockup spacing -->
	<div class="h-24"></div>

	<!-- Balance Section -->
	<section class="reveal balance-section">
		<div class="balance-row">
			<span id="earned" class="font-numeral-xl text-on-surface counter-glow">{currentBalance.toFixed(2)}</span>
			<span class="font-headline-lg-mobile text-on-surface-variant balance-unit">minutes</span>
		</div>
		<p class="font-label-caps label-status">Available now</p>
		{#if currentBalance > 0}
			<button onclick={handleLockApps} class="lock-apps-btn font-label-caps interactive-element">
				[ Lock Apps Now ]
			</button>
		{/if}
	</section>

	<!-- Stats Section -->
	<section class="reveal stats-section" style="animation-delay: 0.15s;">
		<p class="font-label-caps stats-title">Today's activity</p>
		<div class="stats-row">
			<!-- Steps count -->
			<div class="stat-group">
				<span id="steps" class="font-body-md text-primary font-bold">{String(currentSteps).padStart(4, '0')}</span>
				<span class="font-label-caps stat-label">STEPS</span>
			</div>
			
			<div class="divider"></div>
			
			<!-- Earned minutes -->
			<div class="stat-group">
				<span class="font-body-md text-primary font-bold">+{Math.round(currentBalance)}</span>
				<span class="font-label-caps stat-label">EARNED</span>
			</div>
			
			<div class="divider"></div>
			
			<!-- Spent minutes -->
			<div class="stat-group">
				<span class="font-body-md text-error font-bold">-0</span>
				<span class="font-label-caps stat-label">SPENT</span>
			</div>
		</div>
	</section>

	<!-- Apps Section -->
	<section class="reveal apps-section" style="animation-delay: 0.3s;">
		<div class="mb-gutter">
			<p class="font-label-caps section-title">Protected Apps</p>
		</div>

		<!-- Form to block new app (clean line bottom, no box) -->
		<form onsubmit={(e) => { e.preventDefault(); onAddAppBySearch(); }} class="add-app-form">
			<div class="input-wrapper">
				<input
					type="text"
					placeholder="Search apps (e.g. Instagram)"
					bind:value={appSearchQuery}
					onfocus={() => showSuggestions = true}
					onblur={() => setTimeout(() => showSuggestions = false, 200)}
					class="input-minimal"
				/>
				{#if showSuggestions && suggestions.length > 0}
					<div class="suggestions-dropdown">
						{#each suggestions as app}
							<button 
								type="button" 
								onclick={() => selectSuggestion(app)}
								class="suggestion-item"
							>
								<AppIcon package={app.defaultPkg} class="suggestion-icon" />
								<div class="suggestion-details">
									<span class="suggestion-name">{app.name}</span>
									<span class="suggestion-pkg">{app.defaultPkg}</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<button type="submit" class="add-btn interactive-element">Block</button>
		</form>

		<!-- Apps list matching mockup items style -->
		<div class="apps-list">
			{#if blockedApps.length === 0}
				<p class="empty-text font-body-md">No apps restricted yet. Search above to add apps.</p>
			{:else}
				{#each blockedApps as app}
					{@const meta = getAppMeta(app)}
					<div class="app-item group interactive-element">
						<div class="app-info">
							<div class="app-icon-container">
								<AppIcon package={app} class="app-icon" />
							</div>
							<div class="app-details">
								<span class="font-body-lg app-name">{meta.name}</span>
								<span class="app-pkg">{app}</span>
							</div>
						</div>
						
						<div class="app-actions">
							<button onclick={() => onRemoveBlockedApp(app)} class="unblock-btn font-label-caps" aria-label="Unblock app">
								Remove
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</section>
</main>

<style>
	.home-container {
		max-width: 440px;
		margin: 0 auto;
		width: 100%;
		padding: 0 var(--spacing-margin-safe) 160px var(--spacing-margin-safe);
		display: flex;
		flex-direction: column;
	}

	.h-24 {
		height: 96px;
	}

	/* Balance Display matching mockup */
	.balance-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin-top: 16px;
	}

	.balance-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.balance-unit {
		margin-left: 8px;
		margin-bottom: 4px;
	}

	.label-status {
		color: var(--color-outline);
		margin-top: 12px;
		letter-spacing: 0.2em;
	}

	/* Stats section */
	.stats-section {
		margin-top: var(--spacing-section-gap);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		opacity: 0.8;
	}

	.stats-title {
		color: var(--color-on-surface-variant);
		margin-bottom: var(--spacing-stack-loose);
	}

	.stats-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-stack-loose);
	}

	.stat-group {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.stat-label {
		font-size: 10px;
		color: var(--color-outline);
	}

	.divider {
		width: 1px;
		height: 16px;
		background-color: var(--color-outline-variant);
	}

	/* Protected apps section */
	.apps-section {
		margin-top: var(--spacing-section-gap);
		width: 100%;
	}

	.section-title {
		color: var(--color-outline);
		letter-spacing: 0.15em;
	}

	.add-app-form {
		display: flex;
		gap: 16px;
		align-items: flex-end;
		margin-bottom: 24px;
	}

	.lock-apps-btn {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: var(--color-error);
		padding: 6px 12px;
		font-size: 10px;
		margin-top: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		letter-spacing: 0.15em;
	}

	.lock-apps-btn:hover {
		background: rgba(255, 180, 171, 0.08);
		border-color: var(--color-error);
	}

	.input-wrapper {
		flex-grow: 1;
		position: relative;
	}

	.suggestions-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: #000000;
		border: 1px solid var(--color-outline-variant);
		border-top: none;
		z-index: 100;
		max-height: 240px;
		overflow-y: auto;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
	}

	.suggestion-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgba(60, 73, 78, 0.15);
		color: #ffffff;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.suggestion-item:hover {
		background-color: rgba(255, 255, 255, 0.04);
	}

	:global(.suggestion-icon) {
		width: 16px;
		height: 16px;
		color: var(--color-on-surface-variant);
	}

	.suggestion-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.suggestion-name {
		font-size: 13px;
		font-weight: 600;
	}

	.suggestion-pkg {
		font-size: 10px;
		color: var(--color-outline);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.add-btn {
		height: 44px;
		padding: 0 16px;
		background-color: #ffffff;
		color: #000000;
		font-family: 'Inter', sans-serif;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border: none;
		cursor: pointer;
	}

	.add-btn:hover {
		background-color: var(--color-primary-container);
	}

	.apps-list {
		display: flex;
		flex-direction: column;
	}

	.empty-text {
		color: var(--color-on-surface-variant);
		opacity: 0.4;
		text-align: center;
		padding: 24px 0;
	}

	.app-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 8px;
		border-bottom: 1px solid rgba(60, 73, 78, 0.25);
		transition: background-color 0.2s ease;
		border-radius: var(--rounded-lg);
	}

	.app-item:hover {
		background-color: rgba(255, 255, 255, 0.02);
	}

	.app-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-gutter);
		min-width: 0;
	}

	.app-icon-container {
		width: 40px;
		height: 40px;
		background-color: var(--color-surface-container-highest);
		border-radius: var(--rounded-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: filter 0.2s ease;
	}

	.app-item:hover .app-icon-container {
		filter: grayscale(0);
	}

	:global(.app-icon) {
		color: var(--color-on-surface);
		width: 20px;
		height: 20px;
	}

	.app-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.app-name {
		font-weight: 600;
		color: var(--color-on-surface);
	}

	.app-pkg {
		font-size: 11px;
		color: var(--color-outline-variant);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.app-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-stack-loose);
	}


	.unblock-btn {
		background: transparent;
		border: none;
		color: var(--color-on-surface-variant);
		opacity: 0.4;
		cursor: pointer;
		font-size: 9px;
		padding: 6px 0;
		transition: opacity 0.2s ease, color 0.2s ease;
	}

	.unblock-btn:hover {
		opacity: 1;
		color: var(--color-error);
	}
</style>
