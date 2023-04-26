library(tidyverse)
library(sf)
get_data <- function(){
  la <- read_csv(
    "https://github.com/cmoy11/yelp_review_scraping/raw/main/los-angeles/Black-Owned_Businesses_in_Los_Angeles.csv"
    ) |> 
    select(name = display_name, website, description,
           longitude, latitude) |> 
    mutate(
      lon_copy = longitude,
      lat_copy = latitude
    ) |> 
    drop_na(longitude, latitude)
  
  file.remove("static/la.json")
  st_as_sf(la, coords = c("longitude", "latitude")) |> 
    st_write(driver = "GeoJSON", "static/la.json") 
  
  detroit <- read_csv("https://github.com/amychiv/yelp_data_scraping/raw/main/restaurant%20csv%20files/Updated%204:20/detroit_restaurants.csv"
                      ) |> 
    select(-id, -latitude_truncated, -longitude_truncated) |> 
    mutate(lon_copy = longitude,
           lat_copy = latitude) |> 
    drop_na(longitude, latitude) |> 
    filter(is_black_owned == 1)
  
  file.remove("static/detroit.json")
  st_as_sf(detroit, coords = c("longitude", "latitude")) |> 
    st_write(driver ="GeoJSON", "static/detroit.json", append = FALSE)
}

get_data()