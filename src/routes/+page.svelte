<script lang="ts">
	import { onMount } from 'svelte';
	import { renderMap } from './renderMap';

	onMount(() => {
		renderMap();
	});
</script>

<div id="detroit" />

<style>
	:global(#detroit),
	:global(#la) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		transition: opacity ease-in-out 200ms;
	}

	:global(.mapboxgl-popup) {
		/* Turned to 1 by logic in ./renderMap.ts */
		opacity: 0;
		transition: opacity ease-in-out 200ms;
	}
	:global(.mapboxgl-popup-content) {
		font-family: var(--body-font);
		padding: 1rem;
	}

	:global(.mapboxgl-popup h1) {
		font-family: var(--title-font);
		font-size: 1.5rem;
		text-transform: uppercase;
		color: var(--blue);
		margin: 0 1rem 0 0;
	}
</style>
