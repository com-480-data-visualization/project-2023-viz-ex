import pandas as pd
from itertools import groupby


def getYear(data):
    dates = data["Date"]
    print(dates)
    return [date.split("/")[-1] for date in dates] 

def toFloat(data):
    return [float(x) for x in data["Magnitude"]]

def get_mean_max_per_country_per_year(data):
    data = data.assign(Year=lambda x: getYear(x))
    data = data.assign(Magnitude=lambda x:toFloat(x))
    df = pd.DataFrame(data[2:], columns=['Date','Time','Latitude','Longitude','Type','Depth','Depth Error','Depth Seismic Stations','Magnitude','Magnitude Type','Magnitude Error','Magnitude Seismic Stations','Azimuthal Gap','Horizontal Distance','Horizontal Error','Root Mean Square','ID','Source','Location Source','Magnitude Source','Status','Country', 'Year'])
    
    groupByCountry = df.groupby(['Country', 'Year']).groups

    meanMaxByYear = df.groupby(['Country', 'Year']).agg({'Magnitude': ['mean', 'min', 'max']})

    return meanMaxByYear

if __name__ == "__main__":
    data = pd.read_csv('./../src/data/database.csv')
    newData = get_mean_max_per_country_per_year(data)
    newData.to_csv('./../src/data/earthquake_magnitudes.csv')

