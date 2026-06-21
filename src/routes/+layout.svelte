<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { checkBlockState, startBlockGuard } from '$lib/blockGuard.js';
	import AmbientShader from '$lib/AmbientShader.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		checkBlockState();
		return startBlockGuard();
	});

	// Navigation & header layout styles are context-aware
	const isTransactional = $derived(
		$page.url.pathname === '/blocked' ||
		$page.url.pathname === '/setup' ||
		$page.url.pathname === '/'
	);

	const currentPath = $derived($page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-layout">
	<!-- Background Ambient Shader -->
	<AmbientShader opacity={isTransactional ? 0.25 : 0.4} />

	<!-- Centered Minimalist Header -->
	<header class="app-header {currentPath === '/blocked' ? 'header-blocked' : ''}">
		<span class="font-label-caps logo-text">MOTION</span>
	</header>

	<!-- Page Content Area -->
	<div class="content-container">
		{@render children()}
	</div>

	<!-- Bottom Navigation Bar (Suppressed on Setup and Blocked screens) -->
	{#if !isTransactional}
		<nav class="bottom-nav glass-nav">
			<!-- Home -->
			<a
				class="nav-link {currentPath === '/home' ? 'nav-link-active nav-item-active' : 'nav-link-inactive'}"
				href="/home"
			>
				<span class="material-symbols-outlined nav-icon" style="font-variation-settings: 'FILL' {currentPath === '/home' ? '1' : '0'};">home</span>
			</a>
			<!-- Walking (Active state) -->
			<a
				class="nav-link {currentPath === '/home/walking' ? 'nav-link-active nav-item-active' : 'nav-link-inactive'}"
				href="/home/walking"
			>
				<span class="material-symbols-outlined nav-icon" style="font-variation-settings: 'FILL' {currentPath === '/home/walking' ? '1' : '0'};">directions_walk</span>
			</a>
			<!-- History -->
			<a
				class="nav-link {currentPath === '/history' ? 'nav-link-active nav-item-active' : 'nav-link-inactive'}"
				href="/history"
			>
				<span class="material-symbols-outlined nav-icon" style="font-variation-settings: 'FILL' {currentPath === '/history' ? '1' : '0'};">history</span>
			</a>
		</nav>
	{/if}
</div>

<style>
	.app-layout {
		position: relative;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background-color: var(--color-background);
	}

	.content-container {
		flex: 1 0 auto;
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
	}

	/* Centered Header styles */
	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 50;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24px 32px;
		pointer-events: none; /* Let user tap elements behind label if needed */
	}

	.logo-text {
		color: var(--color-on-surface);
		letter-spacing: 0.25em;
		font-weight: 600;
		transition: opacity 0.3s ease;
	}

	.header-blocked .logo-text {
		opacity: 0.3;
	}

	/* Bottom Navigation bar */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: 50;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 16px 32px 16px 32px;
	}

	.nav-link {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
		min-height: 48px;
		min-width: 48px;
	}

	.nav-link:active {
		transform: scale(0.9);
	}

	.nav-link-active {
		color: var(--color-primary);
	}

	.nav-link-inactive {
		color: var(--color-on-surface-variant);
		opacity: 0.4;
	}

	.nav-link-inactive:hover {
		opacity: 1;
	}

	.nav-icon {
		font-size: 24px;
	}
</style>
