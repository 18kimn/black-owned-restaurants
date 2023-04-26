library(tidyverse)
library(sf)
get_data <- function(){
  la <- read_csv(
    "https://github.com/cmoy11/yelp_review_scraping/raw/main/los-angeles/Black-Owned_Businesses_in_Los_Angeles.csv"
    ) |> 
    select(name = display_name, website, description,
           longitude, latitude) |> 
    drop_na(longitude, latitude)
  
  st_as_sf(la, coords = c("longitude", "latitude")) |> 
    st_write(driver = "GeoJSON", "static/la.json") 
  
  detroit <- read_csv("https://github.com/amychiv/yelp_data_scraping/raw/main/restaurant%20csv%20files/detroit_restaurants.csv"
                      ) |> 
    select(-id) |> 
    drop_na(longitude, latitude)
  
  st_as_sf(detroit, coords = c("longitude", "latitude")) |> 
    st_write(driver ="GeoJSON", "static/detroit.json")
}

get_data()