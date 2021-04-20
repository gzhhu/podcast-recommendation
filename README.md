# GuidePod

Description of the project

## Installation

To install this package, use the following:

`$ python -m pip install git+https://github.com/gzhhu/podcast-recommendation.git`

Then install the dependencies: 

`$ python pip install -r requirements.txt `

## Execution

Script | Description | Output
:----- | :---- | :------
get_podcast_names.ipynb   | Scrape the top 200 podcasts of each genre. | podcast_ID_list.csv
get_podcast_reviews.ipynb   | Scrape the first 500 reviews for each podcast in `podcast_ID_list.csv` | podcastReviews.csv
