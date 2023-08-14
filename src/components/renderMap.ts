import type { Feature, Point } from 'geojson';
import mb, { Map } from 'mapbox-gl';
import type { Options } from './mapOptions';

/* I know it sounds ridiculous, but it is fine (necessary) to have this in client-facing code */
mb.accessToken =
	'pk.eyJ1IjoiMThraW1uIiwiYSI6ImNsYTF0bjU5dTAxeHEzcG93bjEwMGFkZ2IifQ.wQhDX1OYsN69KH0x4pb0-g';

function addClusters(map: Map, popup: (e: any) => string, source: string, color: string) {
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
			'icon-image': 'customRestaurant2',
			'icon-allow-overlap': true,
			'icon-size': 1
		},
		paint: {
			'icon-color': color
		}
	});

	map.on('click', `clusters-${source}`, (e) => {
		// If there are unclustered points clicked, skip
		const hasUnclusteredPoints = map.queryRenderedFeatures(e.point)
			.filter(feature => feature.layer.id.match(/^unclustered/))
			.length > 0
		if(hasUnclusteredPoints) return
		
		const features = map.queryRenderedFeatures(e.point, {
			layers: [`clusters-${source}`]
		}) as Feature<Point>[];
		const clusterId = features[0].properties?.cluster_id;
		(map.getSource(source) as mb.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
			if (err) return;
			map.easeTo({
				center: features[0].geometry.coordinates as [number, number],
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
		const feature = e.features[0] as Feature<Point>
		const coords = feature.geometry.coordinates as [number, number]

		const t = new mb.Popup().setLngLat(coords)
		.setHTML(popup(feature.properties)).addTo(map);

		(t._container as HTMLElement).style.opacity = '1';
	});
}

export function renderMap(city: string, opts: Options) {
	const map = new mb.Map({
		container: city,
		style: 'mapbox://styles/18kimn/clgx6olcc00k901qn204v12oj',
		maxBounds: opts.cities[city].bounds,
		center: opts.cities[city].starting_center || opts.cities[city].bounds.getCenter(),
		zoom: opts.cities[city].starting_zoom
	});

	map.on('load', async () => {
		const prefix = opts.cities[city].path_prefix || ''
		map.addSource(`${city}_black_owned`, {
			type: 'geojson',
			data: await fetch(`/${prefix}${city}_black_owned.json`).then((res) => res.json()),
			cluster: true,
			clusterMaxZoom: 16,
			clusterRadius: 50
		});
		map.addSource(`${city}_non_black_owned`, {
			type: 'geojson',
			data: await fetch(`/${prefix}${city}_non_black_owned.json`).then((res) => res.json()),
			cluster: true,
			clusterMaxZoom: 16,
			clusterRadius: 50
		});
		map.loadImage('./restaurant.png', (err, image) => {
			if (err) throw err;
			if (!image) return;
			map.addImage('customRestaurant2', image, { sdf: true });
			addClusters(map, opts.cities[city].popup, `${city}_non_black_owned`, opts.colors.non_black_owned);
			addClusters(map, opts.cities[city].popup, `${city}_black_owned`, opts.colors.black_owned);
		});
	});
	return map;
}
