import mb, { Map } from 'mapbox-gl';

/* I know it sounds ridiculous, but it is fine (necessary) to have this in client-facing code */
mb.accessToken =
	'pk.eyJ1IjoiMThraW1uIiwiYSI6ImNsYTF0bjU5dTAxeHEzcG93bjEwMGFkZ2IifQ.wQhDX1OYsN69KH0x4pb0-g';

type Options = {
	bounds: mb.LngLatBounds;
	display_name: string;
	popup: (d: any) => string;
	starting_zoom: number;
	starting_center?: mb.LngLat;
};

export const opts: Options = {
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
    `,
	starting_zoom: 14,
	starting_center: new mb.LngLat(-83.04398567464219, 42.33125764477208)
};

/* 
	la: {
		bounds: new mb.LngLatBounds(new mb.LngLat(-118.651, 33.605), new mb.LngLat(-117.922, 34.383)),
		display_name: 'Los Angeles',
		popup: (d) => `<h1>${d.name}</h1>
    ${d.description || ''}
    <br />
    <a href="${d.website}" rel="noreferrer" target="_blank">
    See more on their website
    </a>
    `,
		starting_zoom: 10
	}
   */

function addClusters(map: Map, source: string, color: string) {
	map.addLayer({
		id: `clusters-${source}`,
		type: 'circle',
		source,
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': color,
			'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
		}
	});

	map.addLayer({
		id: `cluster-count-${source}`,
		type: 'symbol',
		source,
		filter: ['has', 'point_count'],
		layout: {
			'text-field': ['get', 'point_count_abbreviated'],
			'text-font': ['Alternate Gothic No3 D Regular'],
			'text-size': 20,
			'text-offset': [0, 0.4]
		},
		paint: {
			'text-color': 'white'
		}
	});

	map.addLayer({
		id: `unclustered-point-${source}`,
		type: 'symbol',
		source: source,
		filter: ['!', ['has', 'point_count']],
		layout: {
			'icon-image': 'customRestaurant',
			'icon-size': 2
		},
		paint: {
			'icon-color': color
		}
	});

	map.on('click', `clusters-${source}`, (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: [`clusters-${source}`]
		});
		const clusterId = features[0].properties?.cluster_id;
		(map.getSource(source) as mb.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
			if (err) return;
			map.easeTo({
				center: features[0].geometry.coordinates,
				zoom: zoom
			});
		});
	});

	map.on('mouseenter', `clusters-${source}`, () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', `clusters-${source}`, () => {
		map.getCanvas().style.cursor = '';
	});
	map.on('mouseenter', `unclustered-point-${source}`, () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', `unclustered-point-${source}`, () => {
		map.getCanvas().style.cursor = '';
	});

	map.on('click', `unclustered-point-${source}`, (e) => {
		if (!e.features) return;
		const props = e.features[0].properties;

		if (!props) return;
		const coords = new mb.LngLat(props.lon_copy, props.lat_copy);

		const t = new mb.Popup().setLngLat(coords).setHTML(opts.popup(props)).addTo(map);

		(t._container as HTMLElement).style.opacity = '1';
	});
}

export function renderMap() {
	const map = new mb.Map({
		container: 'detroit',
		style: 'mapbox://styles/18kimn/clgx6olcc00k901qn204v12oj',
		maxBounds: opts.bounds,
		center: opts.starting_center || opts.bounds.getCenter(),
		zoom: opts.starting_zoom
	});

	map.on('load', async () => {
		map.addSource('black_owned', {
			type: 'geojson',
			data: await fetch(`/black_owned.json`).then((res) => res.json()),
			cluster: true,
			clusterMaxZoom: 16,
			clusterRadius: 50
		});
		map.addSource('not_black_owned', {
			type: 'geojson',
			data: await fetch(`/not_black_owned.json`).then((res) => res.json()),
			cluster: true,
			clusterMaxZoom: 16,
			clusterRadius: 50
		});

		addClusters(map, 'black_owned', '#9d0b22');
		addClusters(map, 'not_black_owned', '#2677b8');
	});

	return map;
}
