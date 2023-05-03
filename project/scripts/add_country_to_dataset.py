import reverse_geocoder as rg
import pycountry
import pandas as pd

def coords_to_country(x):
    lats = list(x['Latitude'])
    longs = list(x['Longitude'])
    coords = [coord for coord in zip(lats, longs)]
    countries = rg.search(coords)
    return [pycountry.countries.get(alpha_2=country['cc']).name if country['cc'] != 'XK' else 'Kosovo' for country in countries]

if __name__ == "__main__":
    data = pd.read_csv('./../data/database.csv')
    data = data.assign(Country=lambda x: coords_to_country(x))
    data.to_csv('./src/data/database.csv')
