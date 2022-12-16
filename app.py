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

to_read = list()
skipped = list() # data, skipped, number
with open("task.csv", "r") as task:
    reader = csv.reader(task, delimiter=',')
    head = reader.__next__()
    for i, elem in enumerate(reader):
        to_read.append([elem, False])  # data, already_read



@app.route("/index")
def page_after_auth():
    # app.logger.warning(to_read)
    for i, el in enumerate(to_read):
        # app.logger.warning(el)
        if not el[1]:
            return render_template("index.html", title="testt", text=el[0][0], task=el[0][1], n=i)


    return render_template('index.html', title='task', text="Заданий больше нет", task=None, n=-1)


@app.route("/", methods=["GET"])
def main():
    return redirect(url_for("auth"))  # redirect(...)


@app.route("/recording", methods=["POST"])
def get_file():
    if request.method == "POST":
        app.logger.warning('log begin')
        # app.logger.warning(dir(request), request.form.get('author'))
        file = request.files.get('voice')
        author = request.form.get('author')
        cur_task = request.form.get('cur_task')
        is_skipped = request.form.get('skip')

        app.logger.warning(cur_task, is_skipped)

        if is_skipped is True: # handling text skipping
            to_read[int(cur_task)][1] = True
            skipped.append([to_read[int(cur_task)][0]], int(cur_task))
        elif cur_task != '-1':
            filename = secure_filename(file.filename) + f'{datetime.now()}_{author}_{cur_task}' + '.wav'
            to_read[int(cur_task)][1] = True
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        # with connection:
        #     cursor.execute("UPDATE users SET ")
        # app.logger.warning(to_read)
        return redirect(url_for("page_after_auth"))


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
