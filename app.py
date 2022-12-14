import sqlite3

from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
from datetime import datetime
import os

connection = sqlite3.connect("database.db", check_same_thread=False)
cursor = connection.cursor()

# from OpenSSL import SSL
# context = SSL.Context(SSL.PR)
# context.use_privatekey_file('server.key')
# context.use_certificate_file('server.crt')

app = Flask("voice_recorder")

app.config['UPLOAD_FOLDER'] = 'files/'

folder = "/home/main/projects/voice-recording-web"


@app.route("/index")
def page_after_auth():
    with open('text.txt') as text:
        f1 = text.read()
    with open('task.txt') as task:
        f2 = task.read()
    return render_template("index.html", title="testt", text=f1, task=f2)


@app.route("/", methods=["GET"])
def main():
    return redirect(url_for("auth"))  # redirect(...)


@app.route("/recording", methods=["POST"])
def get_file():
    if request.method == "POST":
        app.logger.warning('log begin')
        app.logger.warning(request.files.get('voice'))
        file = request.files.get('voice')
        filename = secure_filename(file.filename) + f'{datetime.now()}' + '.wav'

        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        app.logger.warning('log end')

        with connection:
            cursor.execute("UPDATE users SET ")

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
        app.logger.warning("teststastdsta")

        login = request.form.get("uname")
        password = request.form.get("psw")

        with connection:
            successful_auth = bool(len(cursor.execute("SELECT * FROM users WHERE login=? and password=?", (login, password,)).fetchall()))
            app.logger.warning(successful_auth)
        if successful_auth:
            return redirect(url_for("page_after_auth"))
        return render_template("auth.html", error=True)
    return render_template("auth.html")


if __name__ == '__main__':
    app.run(host="localhost", port=5000, ssl_context="adhoc")
