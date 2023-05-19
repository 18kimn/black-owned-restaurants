library(tidyverse)
library(sf)
get_data <- function(){
  detroit <- read_csv("https://github.com/amychiv/yelp_data_scraping/raw/main/restaurant%20csv%20files/Updated%204:20/detroit_restaurants.csv"
                      ) |> 
    select(-id, -latitude_truncated, -longitude_truncated) |> 
    mutate(lon_copy = longitude,
           lat_copy = latitude) |>  
    drop_na(longitude, latitude) 
  
  black_owned <- detroit |> filter(is_black_owned == 1)
  file.remove("static/black_owned.json")
  st_as_sf(black_owned, coords = c("longitude", "latitude")) |> 
    st_write(driver ="GeoJSON", "static/black_owned.json")
  
  not_black_owned <- detroit |> filter(is_black_owned == 0)
  file.remove("static/not_black_owned.json")
  st_as_sf(not_black_owned, coords = c("longitude", "latitude")) |> 
    st_write(driver ="GeoJSON", "static/not_black_owned.json")
  
}

get_data()
