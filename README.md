# GuidePod

Description of the project

## Installation

To install this package, use the following:

`$ python -m pip install git+https://github.com/gzhhu/podcast-recommendation.git`

Then navigate to the project directory and install the dependencies: 

`$ python pip install -r requirements.txt `

## Scraping, data processing, and modeling

Script | Description | Output
:----- | :---- | :------
1 - Scraping/get_podcast_names.ipynb   | Scrape the top 200 podcast IDs of each genre. | podcast_ID_list.csv
1 - Scraping/get_podcast_reviews.ipynb   | Scrape the first 500 reviews for each podcast in `podcast_ID_list.csv`. | GuidePod.sqlite
1 - Scraping/get_podcast_info.ipynb   | Scrape feed information for each podcast in `podcast_ID_list.csv` including titles, descriptions, and artist names. | GuidePod.sqlite
1 - Scraping/get_podcast_episodes.ipynb   | Scrape episode data for each podcast in `podcast_ID_list.csv`. | GuidePod.sqlite

## Running the web application

...
