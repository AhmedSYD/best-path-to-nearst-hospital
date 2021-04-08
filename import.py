from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import csv

engine= create_engine('postgres://mfnkrcrnelvvuw:59d18586b37964ae48eae31dff37910036faeca7b91bc0946390383ce1f56d82@ec2-54-145-249-177.compute-1.amazonaws.com:5432/dcmdr8nduf9duf')
db = scoped_session(sessionmaker(bind=engine))

def main():
    db.execute("CREATE TABLE users_geo (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, password VARCHAR NOT NULL, firstName VARCHAR NOT NULL, lastName VARCHAR NOT NULL)")
    db.commit()

if __name__=="__main__":
    main()