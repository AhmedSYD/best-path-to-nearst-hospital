# from models_orm import *
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask import Flask, render_template, request,jsonify,session, redirect,url_for
from flask_session import Session
from flask_socketio import SocketIO, emit
import requests
from flask_jsglue import JSGlue


app=Flask(__name__)
jsglue = JSGlue(app)
# app.config["SQLALCHEMY_DATABASE_URI"]='postgres://mfnkrcrnelvvuw:59d18586b37964ae48eae31dff37910036faeca7b91bc0946390383ce1f56d82@ec2-54-145-249-177.compute-1.amazonaws.com:5432/dcmdr8nduf9duf'
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False
app.config["SESSION_PERMANENT"]=False
app.config["SESSION_TYPE"]="filesystem"
Session(app)
app.config["SECRET_KEY"]=os.getenv("SECRET_KEY")
socketio=SocketIO(app)

engine= create_engine('postgres://mfnkrcrnelvvuw:59d18586b37964ae48eae31dff37910036faeca7b91bc0946390383ce1f56d82@ec2-54-145-249-177.compute-1.amazonaws.com:5432/dcmdr8nduf9duf')
db = scoped_session(sessionmaker(bind=engine))


# db.init_app(app) ##tigh database to flask

@app.route("/")
def login_page():
    print("in login")
    return render_template("login_page.html")

@app.route("/register")
def register():
    return render_template("registration.html")

@app.route("/register/validity", methods=["POST"])
def check_registration():
    
    username=request.form.get("username_register")
    password=request.form.get("password_register")
    firstName=request.form.get("firstName")
    lastName=request.form.get("lastName")
    print(f"first name={firstName}")
    print(f"last name={lastName}")
    print(f"username={username}")
    print(f"password name={password}")
    if username=="" or password=="" or firstName=="" or lastName=="":
        return render_template("error.html", message="one or more fields of the registration is/are empty. please, return again and correct your faults.", type_error="registration")
    ##check if there  same username in database or not
    if db.execute("select * from users_geo where username=:username",{"username":username}).rowcount>0:  ##this username exists in database
        return render_template("error.html", message="This username already exists. please, add a new username or return back to login page to sign in", type_error="registration")
    

    ##then add it to database if it doesn't exist
    db.execute("INSERT INTO users_geo (username, password, firstName, lastName) values (:username, :password, :firstName, :lastName)",\
              {"username":username, "password":password, "firstName":firstName, "lastName":lastName})

    ##finally, return that the registration is submitted successfully.
    db.commit()
    return render_template("success_submit.html", submit_type="register")

@app.route("/map",methods=["POST","GET"])
def mapping():
    if request.method=="POST":
        username=request.form.get("username_login")
        password=request.form.get("password_login")
        ##only for testing error page. you should comment the next lines after you finish your task.
        if username=="" or password=="":
            return render_template("error.html", message="Your password or username field is empty. please, return again and correct your faults.", type_error="login")
        ###########################
        ##check if it exists in database or not
        out_id=db.execute("select id from users_geo where username=:username and password=:password",{"username":username,"password":password})
        if out_id.rowcount==0:  ## username or password is not exist in database
            return render_template("error.html", message="Your password or username is not correct or may be you don't have an account. please, return back and correct your faults.", type_error="login")
        ##if valid render the book search page
        if(not("user_id" in session)):
            session["user_id"]=[]
            print("add new data to session")
        if(not("username" in session)):
            session["username"]=[]
        new_id=out_id.fetchone()[0]
        # print("session['user_id']=",session["user_id"])

        ## add new id to session if and only if the id is not used before to avoid repeating
        if ((len(session["user_id"])>0 and new_id!=session["user_id"][-1]) or (len(session["user_id"])==0)):
            session["user_id"].append(new_id)
        print(f"session now ={session['user_id']}")
        if ((len(session["username"])>0 and username!=session["username"][-1]) or (len(session["username"])==0)):
            session["username"].append(username)
        db.commit()

    # return render_template("search_for_nearest_hospital.html")
    return render_template("search_for_nearest_hospital.html", username=session["username"][-1])


@app.route("/direction/<loc_1>/<loc_2>",methods=["GET"])
def direction(loc_1, loc_2):
    print('in directions')
    print(loc_1)
    print(loc_2)
    url = "http://router.project-osrm.org/route/v1/driving/{};{}?overview=full&steps=true&alternatives=3".format(loc_1, loc_2)
    print(url)
    response = requests.get(url)
    print(response.json())
    return jsonify(response.json())



@socketio.on("read_data")
def read_json_data():
    hospitals_clinics_res = requests.get("https://data.calgary.ca/resource/x34e-bcjz.geojson",\
                            params={"$where":"type='PHS Clinic' or type='Hospital'"})
    print(hospitals_clinics_res)

    if hospitals_clinics_res.status_code==200:
        hospitals_clinics_json=hospitals_clinics_res.json()
    else:
        hospitals_clinics_json= {}

    traffics_res = requests.get("https://data.calgary.ca/resource/qr97-4jvx.geojson")
    if traffics_res.status_code==200:
        traffics_json=traffics_res.json()
    else:
        traffics_json= {}

    outData={
        "traffics":traffics_json,
        "hospitals_clinics":hospitals_clinics_json
    }
    # print("outdata:",outData)
    emit("map_data",outData,broadcast=True)

@app.route("/map/details/<code>",methods=['GET', 'POST'])
def hospital_clinic_details(code):
    print("hospital or clinic comm_code=",code)
    # if(not("hospital_clinic_name" in session)):
    #     session["hospital_clinic_name"]=[]
    # session["hospital_clinic_name"].append(name)
    hospitals_clinics_data=db.execute("select * from hospitals_clinics where comm_code=:comm_code",{"comm_code":code})
    print("hospital_clinics_data=",hospitals_clinics_data)
    if(hospitals_clinics_data.rowcount==0):
        return render_template("error.html", message="There is no information about this book currently.",\
                    type_error="map")
    hospital_clinic_item=hospitals_clinics_data.fetchone()
    print("hospital item=",hospital_clinic_item)
    if(not("hospital_clinic_id_code" in session)):
        session["hospital_clinic_id_code"]=[]
    session["hospital_clinic_id_code"].append([hospital_clinic_item[0],hospital_clinic_item[4]])
    ##check reviews for the book-id and user-id
    
    review_data=db.execute("select users_geo.username, reviews_geo.rate, reviews_geo.comment from reviews_geo join users_geo on reviews_geo.user_id=users_geo.id where hospital_clinic_id=:hospital_clinic_id",\
                    {"hospital_clinic_id":hospital_clinic_item[0]})
    
    print("review_data:",review_data)

    if review_data.rowcount==0:
        flag_review=0
        reviews=[]
    else:
        flag_review=1
        reviews=review_data.fetchall()
    db.commit()
    return render_template("hospital_clinic_details.html",hospital_clinic_item=hospital_clinic_item,flag_review=flag_review,reviews=reviews)
    # return "hello world"

@app.route("/books/details/submit-review", methods=["POST"])
def submit_book_review():
    rating=request.form.get("rating")
    comment=request.form.get("comment")
    if rating is None:
        return render_template("error.html", message="Please, rate your book. It is a mandatory field",\
                type_error="hospital_detail",code=session["hospital_clinic_id_code"][-1][1])
    review_data=db.execute("select * from reviews_geo where hospital_clinic_id=:hospital_clinic_id and user_id=:user_id",\
            {"hospital_clinic_id":session["hospital_clinic_id_code"][-1][0], "user_id":session["user_id"][-1]})
    if review_data.rowcount>0:
        return render_template("error.html", message="You already submitted a review for this hospital/clinic. You can't submit another review for it",\
                type_error="hospital_detail",code=session["hospital_clinic_id_code"][-1][1])
    
    db.execute("insert into reviews_geo (rate, comment, user_id, hospital_clinic_id) values (:rate,:comment,:user_id,:hospital_clinic_id)",\
              {"rate":rating,"comment":comment,"user_id":session["user_id"][-1],"hospital_clinic_id":session["hospital_clinic_id_code"][-1][0]})

    db.commit()

    return render_template("success_submit.html",submit_type="review", code=session["hospital_clinic_id_code"][-1][1])

# @app.route("/books", methods=["POST","GET"])
# def book_search():
#     if request.method=="POST":
#         username=request.form.get("username_login")
#         password=request.form.get("password_login")
#         ##only for testing error page. you should comment the next lines after you finish your task.
#         if username=="" or password=="":
#             return render_template("error.html", message="Your password or username field is empty. please, return again and correct your faults.", type_error="login")
#         ###########################
#         ##check if it exists in database or not
#         out_id=db.execute("select id from users where username=:username and password=:password",{"username":username,"password":password})
#         if out_id.rowcount==0:  ## username or password is not exist in database
#             return render_template("error.html", message="Your password or username is not correct or may be you don't have an account. please, return back and correct your faults.", type_error="login")
#         ##if valid render the book search page
#         if(not("user_id" in session)):
#             session["user_id"]=[]
#             print("add new data to session")
#         new_id=out_id.fetchone()[0]
#         # print("session['user_id']=",session["user_id"])

#         if ((len(session["user_id"])>0 and new_id!=session["user_id"][-1]) or (len(session["user_id"])==0)):
#             session["user_id"].append(new_id)
#         print(f"session now ={session['user_id']}")
#         db.commit()
#     return render_template("book_search_page.html",search_flag=0,books_list=[])


# @app.route("/books/search", methods=["POST","GET"])
# def after_searching():
#     if request.method=="POST":
#         search_name=request.form.get("search")
#         filterType=request.form.get("filterType")
#         print("search=", search_name)
#         print("filterType=",filterType)
#         if(filterType=="title"):
#             out_result=db.execute("select * from books where title ILIKE :searchText", {"searchText":"%"+search_name+"%"})
#         elif(filterType=="author"):
#             out_result=db.execute("select * from books where author ILIKE :searchText", {"searchText":"%"+search_name+"%"})
#         else:
#             out_result=db.execute("select * from books where isbn ILIKE :searchText", {"searchText":"%"+search_name+"%"})
#         out_data=out_result.fetchall()
#         print("out_data=",out_data)
#         db.commit()
#     return render_template("book_search_page.html",search_flag=1, books_list=out_data)
#     ###

# @app.route("/books/search/<int:book_id>")
# def book_details(book_id):
#     if(not("book_id" in session)):
#         session["book_id"]=[]
#     session["book_id"].append(book_id)
#     book_data=db.execute("select * from books where id=:book_id",{"book_id":book_id})
#     print("book_data=",book_data)
#     if(book_data.rowcount==0):
#         return render_template("error.html", message="There is no information about this book currently.",\
#                      type_error="book_search")
#     book_item=book_data.fetchone()
#     print("bookitem=",book_item)

#     res = requests.get("https://www.googleapis.com/books/v1/volumes", params={"q": "isbn:"+book_item[1]})
#     print(f"status code: {res.status_code}")
#     if res.status_code !=200:
#         average_rating="Null"
#         rating_count="Null"
#     else:
#         json_api_data=res.json()
#         if not("items" in json_api_data) or not("volumeInfo" in json_api_data["items"][0]):
#             average_rating="Null"
#             rating_count="Null"
#         else:
#             average_rating=json_api_data["items"][0]["volumeInfo"]["averageRating"] if ("averageRating" in json_api_data["items"][0]["volumeInfo"]) else "Null"
#             rating_count=json_api_data["items"][0]["volumeInfo"]["ratingsCount"] if ("ratingsCount" in json_api_data["items"][0]["volumeInfo"]) else "Null"  
#             print(f"average rating={average_rating} and ranting count={rating_count}")
#     ##check reviews for the book-id and user-id
#     review_data=db.execute("select users.username, reviews.rate, reviews.comment from reviews join users on reviews.user_id=users.id where book_id=:book_id",\
#                     {"book_id":book_id})

#     if review_data.rowcount==0:
#         flag_review=0
#         reviews=[]
#     else:
#         flag_review=1
#         reviews=review_data.fetchall()

#     db.commit()
#     return render_template("book_details.html",book_item=book_item,average_rating=average_rating,\
#         rating_count=rating_count,flag_review=flag_review,reviews=reviews)


# @app.route("/books/search/submit-review", methods=["POST"])
# def submit_book_review():
#     rating=request.form.get("rating")
#     comment=request.form.get("comment")
#     if rating is None:
#         return render_template("error.html", message="Please, rate your book. It is a mandatory field",\
#                 type_error="book_detail",book_id=session["book_id"][-1])

#     review_data=db.execute("select * from reviews where book_id=:book_id and user_id=:user_id",\
#             {"book_id":session["book_id"][-1], "user_id":session["user_id"][-1]})
#     if review_data.rowcount>0:
#         return render_template("error.html", message="You already submitted a review for this book. You can't submit another review for this book",\
#                 type_error="book_detail",book_id=session["book_id"][-1])
    
#     db.execute("insert into reviews (rate, comment, user_id, book_id) values (:rate,:comment,:user_id,:book_id)",\
#               {"rate":rating,"comment":comment,"user_id":session["user_id"][-1],"book_id":session["book_id"][-1]})

#     db.commit()

#     return render_template("success_submit.html",submit_type="review", book_id=session["book_id"][-1])



# @app.route("/api/<string:isbn>")  
# def request_json_api(isbn):
#     isbn_data=db.execute("select * from books where isbn=:isbn",{"isbn":isbn})
#     if(isbn_data.rowcount==0):
#         # return render_template("error.html",message="404 Not found")
#         return jsonify({"error":"not found", "message":"invalid ISBN"}),404
#     book_item=isbn_data.fetchone()

#     res = requests.get("https://www.googleapis.com/books/v1/volumes", params={"q": "isbn:"+isbn})
#     print(f"status code: {res.status_code}")
#     if (res.status_code !=200):
#         average_rating="Null"
#         rating_count="Null"
#         published_date="Null" 
#         isbn_10="Null"
#         isbn_13="Null"
#     else:
#         json_api_data=res.json()
#         if not("items" in json_api_data) or not("volumeInfo" in json_api_data["items"][0]):
#             average_rating="Null"
#             rating_count="Null"
#             published_date="Null" 
#             isbn_10="Null"
#             isbn_13="Null"
#         else:
#             average_rating=json_api_data["items"][0]["volumeInfo"]["averageRating"] if ("averageRating" in json_api_data["items"][0]["volumeInfo"]) else "Null"
#             rating_count=json_api_data["items"][0]["volumeInfo"]["ratingsCount"] if ("ratingsCount" in json_api_data["items"][0]["volumeInfo"]) else "Null"  
#             published_date=json_api_data["items"][0]["volumeInfo"]["publishedDate"] if ("publishedDate" in json_api_data["items"][0]["volumeInfo"]) else "Null"
#             isbn_10="Null"
#             isbn_13="Null"
#             if "industryIdentifiers" in json_api_data["items"][0]["volumeInfo"]:
#                 for isbn_dict in json_api_data["items"][0]["volumeInfo"]["industryIdentifiers"]:
#                     if(isbn_dict["type"]=="ISBN_10"):
#                         isbn_10=isbn_dict["identifier"]

#                     if(isbn_dict["type"]=="ISBN_13"):
#                         isbn_13=isbn_dict["identifier"]

    
#     return jsonify({"title":book_item[2],\
#                 "author":book_item[3],\
#                 "publishedDate":published_date,\
#                 "ISBN_10":isbn_10,\
#                 "ISBN_13":isbn_13,\
#                 "reviewCount":rating_count,\
#                 "averageRating":average_rating \
#                 })





    
# @app.route("/register/success")
# def success():
#     return render_template("success_submit.html")

if __name__== "__main__" :
    # with app.app_context(): ##to run this flask application
    #     main()
    app.run(debug=True)
