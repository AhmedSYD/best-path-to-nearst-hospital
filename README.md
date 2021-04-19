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
You can find the libraries in the `requirements.txt` and install them by running this command `pip3 install -r requirements.txt` in the terminal window.

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
  -  Run this website in your local server by installing all libraries required in your environment and run application.py in any IDE you like. Then, you will find a        line in the console `Running on <server link>` where `<server link>` is the link of the server of the flask where is working on. In my case, the server link is        `http://127.0.0.1:5000/`. After that, copy and paste it in the link box of any browser you like to surf the website.
-  The first page of the website is the login page, as you see in the image below. Type your username and password to surf the map page. 
 
![login](https://user-images.githubusercontent.com/26576895/115163248-6555be00-a0a8-11eb-8a58-12261aebdc49.JPG)

-  If you don't have an account, click **Don't have account?** link to go to the registration page where you can write your (first name, last name, username, and password), then click on submit.

![registration](https://user-images.githubusercontent.com/26576895/115163295-a6e66900-a0a8-11eb-851b-4494921dcb85.JPG)

- Go back again to the login page and write your username and password and click on login.
- After logining in, you will get the map page as you see below
![Map](https://user-images.githubusercontent.com/26576895/115163364-fdec3e00-a0a8-11eb-992b-5d9bbaf3aaca.JPG)
- On the map page, if you'd like to check the favorite hospitals, click on `Favorite Hospitals/Clinics` to see them on a collapsible side panel. Then, click on any one of them to get its location on the map, it will be highlighted by blue circle, see the image below. 

![favorite](https://user-images.githubusercontent.com/26576895/115165585-c08aaf00-a0ae-11eb-82ad-5d1108a75552.png)

- Specify your location by drawing marker on the map as you see below.

![draw marker](https://user-images.githubusercontent.com/26576895/115165740-a69d9c00-a0af-11eb-95c1-a90fcc1512a2.png)

- If you hover over any hospital/clinic, you will get the name of it and a link another page, namely **View/Add Review**ز

![view_add_review](https://user-images.githubusercontent.com/26576895/115166522-f2eadb00-a0b3-11eb-9c5f-2759fdce4981.JPG)

- Once you click on the **View/Add Review** link, a new page is opened which has the information of the hospital/clinic, see the image below. Also, you can see other users' reviews and submit your review. If you'd like to return back to the map page, click on **Return back to map page** button.

![review_page](https://user-images.githubusercontent.com/26576895/115167112-87eed380-a0b6-11eb-96c9-04dca2724b18.JPG)

- You can get multiple types of paths from a marker to a hospital/clinic:<br>
  1- The shortest path between a marker and nearest hospital to the marker along with alternative routes paths (if exist) --where the shortest is highlighted in red,     but others in grey-- by clicking on `Shortest Path` dropdown on the navbar and choose `To Nearest Hospital/Clinic`.
  
  ![shortest to nearest](https://user-images.githubusercontent.com/26576895/115218451-dc21a400-a106-11eb-9a76-43bb94ee76fe.JPG)

  2- Shortest path with the alternative route between a marker and any hospital/clinic you select on the map by choosing `To Selected Hospital/Clinic`under the           `Shortest Path` dropdown. Any hospital/clinic is selected by double-clicking on it. To remove a selection, double click on it again. 
  
  ![shortest to selected](https://user-images.githubusercontent.com/26576895/115218515-eba0ed00-a106-11eb-96ed-46cdef90a2e3.JPG)
  
  3- The path that has the least number of traffic control signals from a marker to the nearest hospital by clicking on `Least Traffic Path` dropdown on the navbar and   choose `To Nearest Hospital/Clinic`, where the least traffic one is highlighted by green color and the other alternative routes (if exist) by grey color.
  
  ![less traffic to nearest](https://user-images.githubusercontent.com/26576895/115218576-fc516300-a106-11eb-8a67-772ef2b9208d.JPG)

  4- The same path that is mentioned in `3`, but between a marker and selected hospital/clinic. This is created by choosing `To Selected Hospital/Clinic`under the       `Least Traffic Path` dropdown. 
  
  ![less traffic to selected](https://user-images.githubusercontent.com/26576895/115218667-168b4100-a107-11eb-8152-24fc6093e065.JPG)
