# Mapping Black-owned restaurants in Detroit and Chicago

This is the codebase for a website of maps to accompany a research project on datafication and
restaurants in several cities across the United States. Data from Yelp on Black-owned restaurants in
Detroit comes from [@amychiv](https://github.com/amychiv/yelp_data_scraping). Google Maps data and the
code in this repository come from myself, Nathan Kim. The project as a whole is led by Matthew Bui.

## Data

Data from Yelp is scraped by @amychiv and can be viewed
[here](https://github.com/amychiv/yelp_data_scraping).

Data from Google Maps was obtained through the Places Text Search API. For each city in the scope of
this website, I split the city into a 50x50 grid and queried Google Maps' Text Search API with the
query "restaurants" once for each unit area. I then repeated the process with the query "Black-owned
restaurants" and a 10x10 grid. Once a list was established, I used shapefiles for each city to clip
the result set to only include restaurants within city boundaries, and exported them for mapping.

To replicate or extend:

1. Create a project, link a billing account, and enable the Places API on Google Cloud Platform.
   Once you enable the Places API, you should receive an API key.
   - You must link a valid credit card, but as long as you only run the scraper linked in here once,
     it will not be charged. Google gives $200 worth of Maps API access for free every month, which
     comes out to around 6,500 queries. Our scraper consumes about 5,200 queries.
   - It is a good idea to restrict the API key to only the Places API. If you start a new repository
     following this methodology, please make sure to store files like `.env` or `.Renviron` in your
     `.gitignore` before you commit anything.
2. Locate a shapefile representing the city/cities you'd like to obtain restaurant data for. These
   can be in any format, so long as it can be imported into R and as a simple features object via
   `st_read`.
   - A custom shapefile for each city must be used because, to my knowledge, no dataset exists that
     comprehensively tracks city boundaries. I saw that the Census Bureau keeps track of municipal
     areas, but these can be a fair amount larger than cities.
   - I recommend that you place the data in `static/` to keep things tidy, but they can be anywhere
     as long as they are within the repository.
3. Adjust the `config` object at the beginning of `data/get_googlemap.R` to include your new city,
   following the format of the existing entries.
4. (Optional) Adjust logic for the scraper. The scraper is split into roughly three functions, one
   to perform a single query, one to scrape data for an entire city using the first function, and
   one to combine and clean results from that function into one result object. Whatever you do, you
   should export two `FeatureCollection`s of points for each city into the `static/` folder, one
   dealing with specificalyl Black-owned restaurants and one covering non-Black-owned restaurants.

## Maps

The maps here were created through Mapbox's toolkit, firstly through generating a custom theme on
Mapbox Studio and then using the Mapbox GL JS library to manipulate and present data on the basemap.
I used Mapbox's [clustering](https://docs.mapbox.com/mapbox-gl-js/example/cluster/) functions to
group data together. The restaurant icon comes from
[Material Design](https://fonts.google.com/icons?icon.query=restaurant).

The website itself was scaffolded through the Svelte framework for building UIs in JavaScript. I
acknowledge it's a bit niche and not the best choice for collaborative projects, but it's by far the
fastest for me in terms of development time.

Each page on the site passes an object of options to the `renderMap` function located at
`src/components/renderMap.ts`. You can manipulate values here, as shown in
`src/routes/yelp/+page.svelte`, to override defaults and insert custom presentation. For Yelp data,
I only pass in one city (Detroit), and change the popup rendering function to account for properties
named differently.

To add a new city, you should place GeoJSON files labeled `{city}_non_black_owned.json` and
`{city}_black_owned.json` in a subdirectory in `static/`. Then, create a new page in `routes/` by
creating a folder, and follow the Yelp example to pass as the `path_prefix` parameter in the
`Options` object the name of the folder you created in `static/`.

Of course, you can always just ask me to do it or to assist. The logic is a bit idiosyncratic and
can be finnicky to figure out.
