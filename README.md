# Project: Best Path to Hospital/Clinic

ENGO 651 - Adv. Topics on Geospatial Technologies

## Overview:
This website is the project for the (Adv. Topics on Geospatial Technologies) course. The website is specified in providing the best path, either the shortest path or has the least number of traffic signals, to a hospital or clinic. Moreover, you can find the favorite Hospitals/Clinics in Calgary, if a user clicks on any one of the favorites, the system will locate it on the map of Calgary. Furthermore, users' reviews of each hospital are included in the website, which exists on the pop-up message of each hospital/clinic, and you can add your review for any hospital you like. 

## System requirement:
- Any platform you like such as Windows, Linux, and so on. 
- Use any browsers (Firefox, Google Chrome,...) to display the html pages. 
- Python 3.6 or higher

## Libraries required to install:
- psycopg2==2.8.5
- psycopg2-binary==2.8.6
- SQLAlchemy==1.3.19
- Flask==1.1.2
- requests==2.24.0
- Flask_SocketIO==5.0.1
- Flask_JSGlue==0.3.1
- Flask-Session==0.3.2
- click==7.1.2
- click-plugins==1.1.1
- Jinja2==2.11.2
- gunicorn==20.1.0 <br>
You can find both libraries in the `requirements.txt` and install them by running this command `pip3 install -r requirements.txt` in the terminal window.

## Tools and Resources are used:
- HTML 5
- CSS
- Python Flask 
- Javascript
- [Leaflet](https://leafletjs.com/)
- [GeoJSON](https://leafletjs.com/examples/geojson/)
- [Turf.js](https://turfjs.org/)
- [Leaflet.GeometryUtil](https://makinacorpus.github.io/Leaflet.GeometryUtil/)
- [Location of hospitals and clinics in Calgary dataset](https://data.calgary.ca/Services-and-Amenities/Calgary-Health-Clinics-and-Hospitals/pp67-7mf4)
- [Location of traffic](https://data.calgary.ca/Health-and-Safety/Map-of-Traffic-Control-Signals/vspk-q7t7?fbclid=IwAR3qDZp7X27YP8nSQsXSs399_H4xoZ7eNdrnOJca7HqUvQK9qosuu84Z_8A)

## How to use the webpage:
- You can open the website by two methods:
  - Because the website is deployed on public domain in [heroku](https://www.heroku.com), you can open the website by clicking on the link below 
    `https://path2hospital.herokuapp.com` 
  -  Run this website in your local server by installing all libraries required in your environment and run application.py in any IDE you like. Then, you will find a        line in the console `Running on <server link>` where `<server link>` is the link of the server of the flask where is working on. In my case, the server link is        `http://127.0.0.1:5000/`. After tha, copy and paste it in the link box of any browser you like to surf the website.
-  The first page of the website is the login page, as you see in the image below. Type your username and password to surf the map page. 
-  
![login](https://user-images.githubusercontent.com/26576895/115163248-6555be00-a0a8-11eb-8a58-12261aebdc49.JPG)

-  If you don't have account, click **Don't have account?** link to go to the registration page where you can write your (first name, last name, username, and password), then click on submit.

![registration](https://user-images.githubusercontent.com/26576895/115163295-a6e66900-a0a8-11eb-851b-4494921dcb85.JPG)

- Go back again to the login page and write your username and password and click on login.
- After logining, you will the map page as you see below
![Map](https://user-images.githubusercontent.com/26576895/115163364-fdec3e00-a0a8-11eb-992b-5d9bbaf3aaca.JPG)
- 
