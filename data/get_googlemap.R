library(httr)
library(tidyverse)
library(sf)
library(tigris)
search_googlemap <- function(point, radius){
  Sys.sleep(0.1)
  response <- GET("https://maps.googleapis.com", path = "/maps/api/place/findplacefromtext/json",
      query = list(
        input = "restaurants",
        inputtype = "textquery",
        locationbias = paste0("circle:", radius, "@", point[2], ",", point[1]),
        fields = "formatted_address,name,geometry",
        key = Sys.getenv("MAPS_KEY")
      )
  ) |> 
    content(as = "parsed")
  
  if(response$status == "ZERO_RESULTS"){
    return(tibble(querypoint = point))
  }
  
  # and otherwise extract the correct response
  map_dfr(response$candidates, \(item){
    return(tibble(
      address = item$formattted_address,
      lat = item$geometry$location$lat,
      lng = item$geometry$location$lng,
      name = item$name,
      query_lng = point[1],
      query_lat = point[2],
    ))
  })
}

# Wraps the above
get_googlemap <- function(){
  n <- 50
  detroit <- metro_divisions(2020) |> 
    filter(str_detect(NAMELSAD, "Detroit")) |> 
    st_make_grid(n = n, what = "centers")
  detroit_meters <- detroit |> st_transform(26918) 
  cellsize <- c(diff(st_bbox(detroit_meters)[c(1, 3)]),
                diff(st_bbox(detroit_meters)[c(2, 4)]))/n
  radius <- sqrt((cellsize[1]/2)^2 + (cellsize[2]/2)^2)
  
  results <- map_dfr(detroit, search_googlemap, radius)
  
  return(results)
}
