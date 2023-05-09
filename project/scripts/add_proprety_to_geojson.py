
import json
import pandas as pd
import numpy  as np

def total_by_country(data):
    countries = data["Country"]
    df = countries.value_counts()
    df = df.to_frame().squeeze()
    return [(country, df[country]) for country in countries.unique()] 

def updateGeoJson(data):
    with open("./../src/data/countries.geojson") as f:
        gj = json.load(f)

    properties_list = total_by_country(data)

    for feat in gj['features']:
        for i in range(len(properties_list)):
            feat['properties']['Total'] = 0

    for feat in gj['features']:
        for i in range(len(properties_list)):
            if(feat['properties']['ADMIN'] == properties_list[i][0]):
                feat['properties']['Total'] = properties_list[i][1]

    def convert(o):
        if isinstance(o, np.int64): return int(o)  
        raise TypeError

    with open('./../src/data/countries.geojson', 'w') as f:
        json.dump(gj, f, default=convert, indent=2)

if __name__ == "__main__":
    data = pd.read_csv('./../src/data/database.csv')
    updateGeoJson(data)
