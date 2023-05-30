import pandas as pd

if __name__ == "__main__":
    data = pd.read_csv('./src/data/database.csv')
    max_mag = data.Magnitude.max()
    print(max_mag)
    max_eq = data[data.Magnitude == data.Magnitude.max()]
    
    print(max_eq[["Country", "Magnitude", "Date"]])
