import pandas as pd
from itertools import groupby
import json
from datetime import datetime
import time


def getYear(data):
    dates = data["Date"]
    return [date.split("/")[-1] for date in dates] 

def toFloat(data):
    return [float(x) for x in data["Magnitude"]]

def get_magnitudes_per_country_per_year(data):
    data = data.assign(Year=lambda x: getYear(x))
    data = data.assign(Magnitude=lambda x:toFloat(x))
    countries = sorted(data["Country"].unique())
    years = data["Year"].unique()
    df = pd.DataFrame(data, columns=['Date','Time','Latitude','Longitude','Type','Depth','Depth Error','Depth Seismic Stations','Magnitude','Magnitude Type','Magnitude Error','Magnitude Seismic Stations','Azimuthal Gap','Horizontal Distance','Horizontal Error','Root Mean Square','ID','Source','Location Source','Magnitude Source','Status','Country', 'Year'])
    meanMaxByYear = (df.groupby(['Year','Country'])["Magnitude"].apply(list)).to_dict()
    newDict = {}
    for year in years:
        newDict.update({year:{}})
        for country in countries:
            newDict[year].update({country: [0]})

    for tuple_key, value in meanMaxByYear.items():
        (year, country) = tuple_key
        if(newDict.get(year) != None):
            newDict[year].update({country: value})
        else :
            newDict.update({year:{country: value}})
        
    with open('./../src/data/earthquake_magnitudes.json', 'w', encoding='utf-8') as jsonf: 
        json.dump(newDict,jsonf, indent=4)
    

if __name__ == "__main__":
    data = pd.read_csv('./../src/data/database.csv')
    get_magnitudes_per_country_per_year(data)