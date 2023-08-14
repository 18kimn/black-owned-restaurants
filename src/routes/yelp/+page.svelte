<script lang="ts">
    import Map from "../../components/Map.svelte";
    import mapOptions from "../../components/mapOptions";
    import type {Options} from '../../components/mapOptions'
    import mb from 'mapbox-gl'
    
    const yelpOptions: Options = {...mapOptions, cities: {
		detroit: {
			bounds: new mb.LngLatBounds(
				new mb.LngLat(-83.392191, 42.165329),
				new mb.LngLat(-82.747285, 42.509457)
			),
			popup: (d) => `<h1>${d.name}</h1>
			${d.is_black_owned ? '<em>Black-owned restaurant</em><br/>': ''}
			Rating: ${d.rating || ''}
			<br />
			${Math.floor(d.review_count)} reviews
			<br />
			${d.price || ''}
    `,
			starting_zoom: 12,
			starting_center: new mb.LngLat(-83.04398567464219, 42.33125764477208),
            path_prefix: 'yelp/'
		},
    }}
</script>

<Map mapOptions={yelpOptions} />