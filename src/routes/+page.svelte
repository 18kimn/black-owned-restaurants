<script lang="ts">
	import { onMount } from 'svelte';
	import { opts, renderMap } from './renderMap';

	let city: keyof typeof opts = 'la';

	onMount(() => {
		(Object.keys(opts) as (typeof city)[]).forEach(renderMap);
	});
</script>

<div>
	<div class="switcher">
		{#each Object.keys(opts) as option}
			<button
				class:selected={city === option}
				on:click={() => {
					city = city == option ? Object.keys(opts).filter((opt) => opt !== option)[0] : option;
				}}
			>
				{opts[option].display_name}
			</button>
		{/each}
	</div>
	{#each Object.keys(opts) as option}
		<div id={option} class:selected-map={city === option} />
	{/each}
</div>

<style>
	:global(#detroit),
	:global(#la) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		opacity: 0;
		pointer-events: none;
		transition: opacity ease-in-out 200ms;
	}

	.switcher {
		z-index: 1;
		position: relative;
		display: flex;
		flex-direction: column;
		width: fit-content;
		margin: 1rem;
	}

	.switcher button {
		font-family: var(--title-font);
		font-size: 3rem;
		text-transform: uppercase;
		color: var(--blue);
		transition: all ease-in-out 400ms;
	}

	.selected {
		background: black;
		color: var(--yellow) !important;
	}

	/* has t obe a better way to do this;*/
	.selected-map {
		opacity: 1 !important;
		pointer-events: all !important;
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
