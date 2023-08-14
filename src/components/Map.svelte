
<script lang="ts">
	import { onMount } from 'svelte';
	import { renderMap } from './renderMap';
	import { titleCase } from '../utils/string';
    import type { Options } from './mapOptions';
	
	export let mapOptions: Options

	let city = 'detroit';

	onMount(() => {
		Object.keys(mapOptions.cities).map(city => renderMap(city, mapOptions));
	});
</script>

<div>
	<div class="overlay">
		<div class="legend">
			<div class="black-owned">
				<div class="icon" style="background: #9d0b22;" />
				<span> Black-owned restaurants </span>
			</div>
			<div class="non-black-owned">
				<div class="icon" style="background: #2677b8;"/>
				<span> Non-Black-owned restaurants </span>
			</div>
		</div>
		<div class="switcher">
			{#each Object.keys(mapOptions.cities) as option}
				<button
					class:selected={city === option}
					on:click={() => {
						city = city == option ? Object.keys(mapOptions.cities).filter((opt) => opt !== option)[0] : option;
					}}
				>
					{titleCase(option)}
				</button>
			{/each}
		</div>
	</div>
	{#each Object.keys(mapOptions.cities) as option}
		<div id={option} class:selected-map={city === option} />
	{/each}
</div>

<style>
	:global(#detroit),
	:global(#chicago) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		transition: opacity ease-in-out 200ms;
		opacity: 0;
		pointer-events: none;
	}

	.overlay {
		z-index: 1;
		position: relative;
		display: flex;
		flex-direction: column;
		width: fit-content;
		margin: 1rem;
	}

	.legend {
		font-size: 1.5rem;
		display: flex;
		flex-direction: column;
		background: #efefef;
		border: solid 1px black;
		padding: 0.5rem;
		margin: 1rem 0;
	}
	.legend span {
		justify-self: flex-start;
	}

	.black-owned,
	.non-black-owned {
		display: grid;
		grid-template-columns: 1rem auto;
		place-items: center;
		gap: 0.5rem;
		font-family: var(--title-font);
	}

	.icon {
		width: 1rem;
		height: 1rem;
	}

	.switcher button {
		font-size: 2rem;
		font-family: var(--title-font);
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
