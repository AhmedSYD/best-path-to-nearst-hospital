from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import csv
import requests

engine= create_engine('postgres://mfnkrcrnelvvuw:59d18586b37964ae48eae31dff37910036faeca7b91bc0946390383ce1f56d82@ec2-54-145-249-177.compute-1.amazonaws.com:5432/dcmdr8nduf9duf')
db = scoped_session(sessionmaker(bind=engine))

def main():
    db.execute("CREATE TABLE users_geo (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, password VARCHAR NOT NULL, firstName VARCHAR NOT NULL, lastName VARCHAR NOT NULL)")
    db.execute("CREATE TABLE hospitals_clinics (id SERIAL PRIMARY KEY, name VARCHAR NOT NULL, type VARCHAR NOT NULL, address VARCHAR NOT NULL, comm_code VARCHAR NOT NULL)")
    hospitals_clinics_res = requests.get("https://data.calgary.ca/resource/x34e-bcjz.geojson",\
                            params={"$where":"type='PHS Clinic' or type='Hospital'"})
    print(hospitals_clinics_res)

    if hospitals_clinics_res.status_code==200:
        hospitals_clinics_json=hospitals_clinics_res.json()
    else:
        hospitals_clinics_json= {}
    print("hospitals_clinics_json=",hospitals_clinics_json)
    if (("features" in hospitals_clinics_json) and (len(hospitals_clinics_json["features"])>0)):
        print("there are features in this dataset")
        for feature in hospitals_clinics_json["features"]:
            print("name=",feature["properties"]["name"])
            print("type=",feature["properties"]["type"])
            print("address=",feature["properties"]["address"])
            print("comm code=",feature["properties"]["comm_code"])
            print("#####################")
            db.execute("INSERT INTO hospitals_clinics (name, type,address,comm_code) VALUES (:name, :type,:address,:comm_code)",\
                      {"name":feature["properties"]["name"],"type":feature["properties"]["type"],"address":feature["properties"]["address"],"comm_code":feature["properties"]["comm_code"]})

    #create reviews table
    db.execute("CREATE TABLE reviews_geo(id SERIAL PRIMARY KEY, rate INTEGER NOT NULL, comment VARCHAR NOT NULL, user_id INTEGER REFERENCES users_geo(id), hospital_clinic_id INTEGER REFERENCES hospitals_clinics(id))")
    # names=db.execute("SELECT name FROM hospitals_clinics")
    # print(names.fetchall())

    db.commit()

if __name__=="__main__":
    main()