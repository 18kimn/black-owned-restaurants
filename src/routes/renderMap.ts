import mb from 'mapbox-gl';

/* I know it sounds ridiculous, but it is fine (necessary) to have this in client-facing code */
mb.accessToken =
	'pk.eyJ1IjoiMThraW1uIiwiYSI6ImNsYTF0bjU5dTAxeHEzcG93bjEwMGFkZ2IifQ.wQhDX1OYsN69KH0x4pb0-g';

type Options = {
	bounds: mb.LngLatBounds;
	display_name: string;
	popup: (d: any) => string;
};

const opts: { [name in 'detroit' | 'la']: Options } = {
	detroit: {
		bounds: new mb.LngLatBounds(
			new mb.LngLat(-83.392191, 42.165329),
			new mb.LngLat(-82.747285, 42.509457)
		),
		display_name: 'Detroit',
		popup: (d) => `<h1>${d.name}</h1>
    ${Math.floor(d.review_count)} reviews
    <br />
    Rating: ${d.rating || ''}
    <br />
    ${d.price || ''}
    `
	},
	la: {
		bounds: new mb.LngLatBounds(new mb.LngLat(-118.651, 33.605), new mb.LngLat(-117.922, 34.383)),
		display_name: 'Los Angeles',
		popup: (d) => `<h1>${d.name}</h1>
    ${d.description || ''}
    <br />
    <a href="${d.website}" rel="noreferrer" target="_blank">
    See more on their website
    </a>
    `
	}
};

export function renderMap(city: 'detroit' | 'la') {
	const map = new mb.Map({
		container: 'map',
		style: 'mapbox://styles/18kimn/clgx6olcc00k901qn204v12oj',
		maxBounds: opts[city].bounds,
		center: opts[city].bounds.getCenter()
	});

	map.on('load', async () => {
		map.addSource(city, {
			type: 'geojson',
			data: await fetch(`/${city}.json`).then((res) => res.json()),
			cluster: true,
			clusterMaxZoom: 16,
			clusterRadius: 50
		});

		map.addLayer({
			id: `clusters-${city}`,
			type: 'circle',
			source: city,
			filter: ['has', 'point_count'],
			paint: {
				'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 15, '#f1f075', 30, '#f28cb1'],
				'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
			}
		});

		map.addLayer({
			id: `cluster-count-${city}`,
			type: 'symbol',
			source: city,
			filter: ['has', 'point_count'],
			layout: {
				'text-field': ['get', 'point_count_abbreviated'],
				'text-font': ['Alternate Gothic No3 D Regular'],
				'text-size': 12
			}
		});

		map.addLayer({
			id: `unclustered-point-${city}`,
			type: 'circle',
			source: city,
			filter: ['!', ['has', 'point_count']],
			paint: {
				'circle-color': '#11b4da',
				'circle-radius': 10,
				'circle-stroke-width': 1,
				'circle-stroke-color': '#fff'
			}
		});

		map.on('click', `clusters-${city}`, (e) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: [`clusters-${city}`]
			});
			const clusterId = features[0].properties?.cluster_id;
			(map.getSource(city) as mb.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
				if (err) return;
				console.log(features);
				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom
				});
			});
		});

		map.on('mouseenter', `clusters-${city}`, () => {
			map.getCanvas().style.cursor = 'pointer';
		});
		map.on('mouseleave', `clusters-${city}`, () => {
			map.getCanvas().style.cursor = '';
		});
		map.on('mouseenter', `unclustered-point-${city}`, () => {
			map.getCanvas().style.cursor = 'pointer';
		});
		map.on('mouseleave', `unclustered-point-${city}`, () => {
			map.getCanvas().style.cursor = '';
		});

		map.on('click', `unclustered-point-${city}`, (e) => {
			if (!e.features) return;
			const props = e.features[0].properties;
			if (!props) return;
			const coords = new mb.LngLat(props.longitude_truncated, props.latitude_truncated);

			const t = new mb.Popup().setLngLat(coords).setHTML(opts[city].popup(props)).addTo(map);

			(t._container as HTMLElement).style.opacity = '1';
		});
	});
	return map;
}
