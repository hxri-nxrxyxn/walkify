<script>
	import { onMount } from 'svelte';
	import { resolveStartRoute } from '$lib/router.js';

	onMount(resolveStartRoute);
</script>

<svelte:head>
	<title>MOTION</title>
	<meta name="description" content="Earn your scroll time." />
</svelte:head>

<main class="loader-container">
	<div class="loader-content reveal">
		<span class="font-label-caps loader-logo">MOTION</span>
		<div class="loader-bar">
			<div class="loader-bar-fill"></div>
		</div>
	</div>
</main>

<style>
	.loader-container {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #000000;
	}
	.loader-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
	.loader-logo {
		color: #ffffff;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.3em;
	}
	.loader-bar {
		width: 60px;
		height: 2px;
		background-color: rgba(255, 255, 255, 0.1);
		overflow: hidden;
		position: relative;
	}
	.loader-bar-fill {
		width: 30px;
		height: 100%;
		background-color: var(--color-primary-container);
		position: absolute;
		animation: loading 1.5s infinite ease-in-out;
	}
	@keyframes loading {
		0% { left: -30px; }
		50% { left: 60px; }
		100% { left: -30px; }
	}
</style>
