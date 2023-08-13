library(httr)
library(tidyverse)
library(sf)
library(tigris)

config <- list(
  "Detroit" = st_read("static/shapefiles/detroit") |> select(),
  "Chicago" = st_read("static/shapefiles/chicago") |>
    select() |> 
    st_transform(st_crs(detroit))
)

search_googlemap <- function(point, query, radius){
  Sys.sleep(0.1)
  response <- GET("https://maps.googleapis.com", path = "/maps/api/place/textsearch/json",
      query = list(
        input = query,
        radius = radius,
        location = paste0(point[2], ",", point[1]),
        key = Sys.getenv("MAPS_KEY")
      )
  ) |> 
    content(as = "parsed")
  
  if(response$status == "ZERO_RESULTS"){
    return(tibble(querypoint = point))
  }

  # and otherwise extract the correct response
  map_dfr(response$results, \(item){
    return(tibble(
      address = item$formatted_address,
      lat = item$geometry$location$lat,
      lng = item$geometry$location$lng,
      name = item$name,
      rating = item$rating,
      n_ratings = item$user_ratings_total
    ))
  })
}

get_geography_restaurants <- function(shape, city, query, n){
  shape <- shape |> 
    st_make_grid(n = n, what = "centers")
  shape_meters <- shape |> st_transform(26918) 
  cellsize <- c(diff(st_bbox(shape_meters)[c(1, 3)]),
                diff(st_bbox(shape_meters)[c(2, 4)]))/n
  radius <- sqrt((cellsize[1]/2)^2 + (cellsize[2]/2)^2)
  
  results <- map_dfr(shape, search_googlemap,
                     query, radius, .progress = TRUE) |>
    mutate(city = city) |> 
    distinct()
  return(results)
}

# Wraps the above
get_googlemap <- function(){
  boundaries <- bind_rows(config)
  all_restaurants <- imap_dfr(config,
                      get_geography_restaurants, "restaurants", 50)
  black_owned <- imap_dfr(config,
                      get_geography_restaurants, "black-owned restaurants", 10) |> 
    mutate(black_owned = TRUE)
  all_results <- bind_rows(all_restaurants, black_owned)
  saveRDS(all_results, "static/all_results.RDS")
  
  # Clip to city bounds
  results_clipped <- all_results |> 
    st_as_sf(coords = c("lng", "lat")) |> 
    st_set_crs(st_crs(boundaries)) |> 
    st_join(boundaries, left = FALSE)
  
  # Deduplicate black_owned restaurants which appear in both result sets
  results_filtered <- results_clipped |> 
    group_by(pick(everything(), -black_owned)) |> 
    # Keep if unique (unduplicated) or if Black-owned
    filter(n() == 1 | black_owned) |> 
    ungroup() |> 
    mutate(black_owned = !is.na(black_owned))
  
  # splitting by city and black-owned
  walk(names(config),
        function(city_name){
          walk(c(TRUE, FALSE), \(is_black_owned){
            data_subset <- results_filtered |> 
              filter(city == city_name, black_owned == is_black_owned)
            message(nrow(data_subset))
            filename <- paste0("static/", tolower(city), ifelse(is_black_owned, "_non", ""),
                               "_black_owned.json")
            file.remove(filename)
            st_write(data_subset, filename, driver = "GeoJSON")
            })
          })

  return(results_clipped)
}

results <- get_googlemap()
