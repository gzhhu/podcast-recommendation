# GuidePod

## DESCRIPTION

GuidePod is a dynamic podcast recommendation engine, which includes a web application featuring interactive visualizations. This package includes the necessary code for running the GuidePod web application, as well as the relevant code for building it from scratch. 

This package scrapes Apple Podcast Show descriptions, episode descriptions, and listener reviews through Apple's API and the show's individual RSS feeds. Then it cleans, lemmatize, and vectorizes the text into Bag-of-Words. Words are then weighted through TD-IDF. The final recommendation engine is a kNN model based on the pair-wise cosine similarities between podcasts.

The web application can be run without performing all of the scraping, preprocessing, and modeling steps, as the relevant final data is already provided. The web application features several interactive visualizations, done through HTML, CSS, JS, and D3.js. Users can search for podcasts on the HTML interface with a browser client and explore recommendations.

## INSTALLATION

To install this project, enter the following in your command line to clone this repository:

`$ git clone https://github.com/gzhhu/podcast-recommendation.git`

### Scraping, data processing, and modeling (optional)

If you would like to run the web scraping, data processing, and modeling processes, run the below Jupyter Notebooks in the provided order. Note that the complete run-time for all of these notebooks will be approximately 6-7 hours on most machines. Running these notebooks is an optional step, as all of the data needed to run this web applicaton is already provided in this repository.

First, navigate to the project directory and enter the following in your command line to install all of the Python dependencies: 

`$ python pip install -r requirements.txt `

Then, running the notebooks below in the following order. These notebooks will produce various data file output, which will populate in the `Data` directory, or the `5 - Visualizations\data` directory.

Script | Description | Output
:----- | :---- | :------
1 - Scraping/get_podcast_names.ipynb   | Scrape the top 200 podcast IDs of each genre. | `podcast_ID_list.csv`
1 - Scraping/get_podcast_reviews.ipynb   | Scrape the first 500 reviews for each podcast in `podcast_ID_list.csv`. | `GuidePod.sqlite`
1 - Scraping/get_podcast_feedinfo.ipynb   | Scrape feed information for each podcast in `podcast_ID_list.csv`. | `GuidePod.sqlite`
1 - Scraping/get_podcast_episodes.ipynb   | Scrape episode data for each podcast in `podcast_ID_list.csv`. | `GuidePod.sqlite`
2 - Cleaning/cleaning.ipynb   | Clean `GuidePod.sqlite` and join tables. | `GuidePod_clean.sqlite`
3 - Modeling + Data Prep/preprocessing.ipynb   | Feature engineering and selection. | `podcast.csv`
3 - Modeling + Data Prep/recommendations.ipynb   | Build the recommendation model. | `recommendations_top10.json`
3 - Modeling + Data Prep/word counts.ipynb   | Identify the most frequently used words. | `top100_words.json`

## EXECUTION - Running the web application

Set up local testing server via python by running the following:

`$ python3 -m http.server`

Then open up a web broswer (Chrome or Firefox), and navigate to the folder through localhost:/8000:

`localhost:8000/../podcast-recomendation/`

Navigate to the `5 - Visualizations` folder and open up `podcast.html`.

Then search for the podcast of your choice.
