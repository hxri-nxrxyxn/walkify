<script>
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Walkify — Blocked</title>
</svelte:head>

<main>
	<h1>hey man, you can't open it, else go for a walk</h1>
	<p>Your doomscroll minutes have run out. You need to walk more to earn more time.</p>
	<button onclick={() => goto('/home')}>Go back to Walkify</button>
</main>
