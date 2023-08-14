import mb from 'mapbox-gl';

/* These options are (potentially) modified by 
* individual map pages and then processed by renderMap()
* to create a map
*/
export type Options = {
	colors: {
		black_owned: string;
		non_black_owned: string;
	};
	cities: {
		[city: string]: {
			bounds: mb.LngLatBounds;
			popup: (d: any) => string;
			starting_zoom: number;
			starting_center?: mb.LngLat;
			path_prefix?: string;
		};
	};
};


const mapOptions: Options = {
	colors: {
		black_owned: '#9d0b22',
		non_black_owned: '#2677b8'
	},
	cities: {
		detroit: {
			bounds: new mb.LngLatBounds(
				new mb.LngLat(-83.392191, 42.165329),
				new mb.LngLat(-82.747285, 42.509457)
			),
			popup: (d) => `<h1>${d.name}</h1>
			${d.black_owned ? '<em>Black-owned restaurant</em><br/>': ''}
			${d.address}
			<br />
			Rating: ${d.rating || ''}
			<br />
			${Math.floor(d.n_ratings)} reviews
			<br />
			${d.price || ''}
    `,
			starting_zoom: 12,
			starting_center: new mb.LngLat(-83.04398567464219, 42.33125764477208)
		},
		chicago: {
			bounds: new mb.LngLatBounds(
				new mb.LngLat(-88.3858, 41.4622),
				new mb.LngLat(-87.0646, 42.276)
			),
			popup: (d) => `<h1>${d.name}</h1>
		${d.address}`,
			starting_zoom: 9
		}
	}
};

export default mapOptions