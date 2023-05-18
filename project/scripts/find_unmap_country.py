import pycountry
import json
import pandas as pd



def find_unmaped_countries_in_dataset():
    with open("./src/data/countries.geojson") as f:
        gj = json.load(f)

    data = pd.read_csv('./src/data/database.csv')
    dataset_countries = data["Country"].unique()
    geojson_countries = set([feature["properties"]["ADMIN"] for feature in gj['features']])
    print(dataset_countries)
    non_mapped = []
    for country in dataset_countries:
        if country in geojson_countries:
            continue
        non_mapped.append(country)
    print(non_mapped)
    


if __name__ == "__main__":
    find_unmaped_countries_in_dataset()
