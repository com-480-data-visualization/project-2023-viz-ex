import pandas as pd
import find_unmap_country

def update_country(x):
    country_map = {
        'South Georgia and the South Sandwich Islands': 'South Georgia and South Sandwich Islands',
        'Russian Federation': 'Russia',
        'French Guiana': 'France',
        'United States': 'United States of America',
        'Timor-Leste': 'East Timor',
        'Taiwan, Province of China': 'Taiwan',
        'Micronesia, Federated States of': 'Federated States of Micronesia',
        'Iran, Islamic Republic of': 'Iran',
        'Saint Helena, Ascension and Tristan da Cunha': 'Saint Helena',
        'Bolivia, Plurinational State of': 'Bolivia',
        'Pitcairn': 'Pitcairn Islands',
        'French Southern Territories': 'French Southern and Antarctic Lands',
        'Venezuela, Bolivarian Republic of': 'Venezuela',
        'Svalbard and Jan Mayen': 'Norway',
        'Guadeloupe': 'France',
        'Falkland Islands (Malvinas)': 'Falkland Islands',
        'Virgin Islands, U.S.': 'United States Virgin Islands',
        "Côte d'Ivoire": 'Ivory Coast',
        'Cabo Verde': 'Cape Verde',
        "Korea, Democratic People's Republic of": 'South Korea',
        'Réunion': 'France',
        'Cocos (Keeling) Islands': 'Indian Ocean Territories',
        'Martinique': 'France',
        'Korea, Republic of': 'North Korea',
        'Tanzania, United Republic of': 'United Republic of Tanzania',
        'Congo, The Democratic Republic of the': 'Democratic Republic of the Congo',
        'Christmas Island': 'Indian Ocean Territories',
        'Viet Nam': 'Vietnam',
        "Lao People's Democratic Republic": 'Laos',
        'Virgin Islands, British': 'British Virgin Islands',
        'North Macedonia': 'Macedonia',
        'Congo': 'Republic of Congo',
        'Syrian Arab Republic': 'Syria', 
        'Serbia': 'Republic of Serbia'
    }
    countries = x['Country']
    return [country_map.get(country) if country in country_map else country for country in countries]


if __name__ == "__main__":
    find_unmap_country.find_unmaped_countries_in_dataset()
    data = pd.read_csv('./src/data/database.csv')
    data = data.assign(Country=lambda x: update_country(x))
    data.to_csv('./src/data/database.csv')
    find_unmap_country.find_unmaped_countries_in_dataset()
