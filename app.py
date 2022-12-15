import sqlite3

from flask import Flask, render_template, request, redirect, url_for, make_response
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import csv

connection = sqlite3.connect("database.db", check_same_thread=False)
cursor = connection.cursor()

app = Flask("voice_recorder")

app.config['UPLOAD_FOLDER'] = 'files/'

folder = "/home/main/projects/voice-recording-web"


@app.route("/index")
def page_after_auth():
    with open("task.csv", "r") as task:
            reader = csv.reader(task, delimiter=',')
            head = reader.__next__()
            tmp = reader.__next__()
            return render_template("index.html", title="testt", text=tmp[0], task=tmp[1])


@app.route("/", methods=["GET"])
def main():
    return redirect(url_for("auth"))  # redirect(...)


@app.route("/recording", methods=["POST"])
def get_file():
    if request.method == "POST":
        app.logger.warning('log begin')
        app.logger.warning(dir(request), request.form.get('author'))
        file = request.files.get('voice')
        author = request.files.get('author')
        filename = secure_filename(file.filename) + f'{datetime.now()}_{author}' + '.wav'

        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        app.logger.warning('log end')

        # with connection:
        #     cursor.execute("UPDATE users SET ")

        return render_template("index.html", title="testt")


@app.route("/reg", methods=["POST", "GET"])
def reg():
    if request.method == "POST":
        login = request.form.get("uname")
        password = request.form.get("psw")

        with connection:
            successful_auth = cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", (login, password,))
            print(successful_auth)

        return redirect(url_for("page_after_auth"))
    return render_template("reg.html")


@app.route("/auth", methods=["GET", "POST"])
def auth():
    if request.method == "POST":
        # app.logger.warning("teststastdsta")

        login = request.form.get("uname")
        password = request.form.get("psw")

        with connection:
            successful_auth = bool(len(cursor.execute("SELECT * FROM users WHERE login=? and password=?", (login, password,)).fetchall()))
            app.logger.warning(successful_auth)
        if successful_auth:
            # return redirect(url_for("page_after_auth"), )\
            response = make_response(redirect(url_for("page_after_auth")))
            response.set_cookie('uname', login)
            return response
        return render_template("auth.html", error=True)
    return render_template("auth.html")


if __name__ == '__main__':
    app.run(host="localhost", port=5000, ssl_context="adhoc")
