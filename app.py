import sqlite3

from flask import Flask, render_template, request, redirect, url_for, make_response
from datetime import datetime
import os
import csv
import logging

if not os.path.exists('log.txt'):
    os.system('touch log.txt')

flaskLogger = logging.getLogger('werkzeug')
flaskLogger.setLevel(logging.CRITICAL)  # suppressing some unnecesary logs
logging.basicConfig(filename='log', level=logging.DEBUG)

connection = sqlite3.connect("database.db", check_same_thread=False)
cursor = connection.cursor()

app = Flask("voice_recorder")

if not os.path.exists('files/'):
    os.mkdir('files')
    os.system('touch files/written.txt')

app.config['UPLOAD_FOLDER'] = 'files/'

# folder = "/home/main/projects/voice-recording-web"

file_list = os.listdir('csv/')

to_read = dict()
num_list = set()


def read_file(name):
    with open(f"csv/{name}", "r", encoding="utf-8") as task:
        reader = csv.reader(task, delimiter=',')
        head = reader.__next__()
        for i, elem in enumerate(reader):
            num_list.add(f'{elem[2]}\n')
            to_read.update({elem[2]: [elem[:2], False, None,
                                      set(), elem[3], elem[4]]})  # tasl_id: data{text, task}, already_read, taken, skipped_by{uname}


read_file('task.csv')
used = set()
used.add('task.csv')

ix = 0


@app.route("/index", methods=['POST'])
def page_after_auth():
    uname = request.args['uname']
    for el in to_read:
        cur = to_read[el]
        if not cur[1] and not (uname in cur[3]) and cur[2] is None:  # if text is free yet
            to_read[el][2] = uname
            return render_template("index.html", title="testt", text=cur[0][0],
             task=cur[0][1], n=el, uname=uname, min_l=cur[4], max_l=cur[5])
        elif cur[2] == uname:  # if you reloaded page (state of 'taken' arg is the same)
            return render_template("index.html", title="testt", text=cur[0][0],
             task=cur[0][1], n=el, uname=uname, min_l=cur[4], max_l=cur[5])

    fnames = set(os.listdir('csv'))
    for i in fnames - used:
        read_file(i)
        used.add(i)
        return redirect(url_for("page_after_auth", uname=uname), code=307)

    return render_template('index.html', title='task', text="?????????????? ???????????? ??????", task="???????????? ???????? ????????????????!", n=-1, uname=uname)


@app.route("/", methods=["GET"])
def main():
    return redirect(url_for("auth"))  # redirect to auth page


@app.route("/recording", methods=["POST"])
def get_file():
    if request.method == "POST":
        file = request.files.get('voice')
        author = request.form.get('author')
        cur_task = request.form.get('cur_task')
        is_skipped = request.form.get('skip')

        try:
            to_read[cur_task][2] = False  # current text broke free
        except KeyError:
            app.logger.warning('Unable to save EOF')

        if is_skipped == 'true':  # handling text skipping
            logging.warning(f'Task {cur_task} Skipped')
            try:
                to_read[cur_task][3].add(author)
            except KeyError:
                app.logger.warning('Unable to save EOF')
        elif cur_task != '-1':  # else saving file
            try:
                to_read[cur_task][1] = True  # setting that handled text is already read
            except KeyError:
                app.logger.warning('Unable to save EOF')

            filename = f'id_{cur_task}_{author}_{datetime.now()}' + '.wav'

            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # with open('files/written.txt', 'r+') as prefix:
            #     prefix.write(f'{cur_task}')
            #     print(set([line for line in prefix.readlines()]))
            #
            to_read.pop(cur_task, None)

            logging.info(f'file {filename} is written correctly')
        to_read[cur_task][2] = None
        return redirect(url_for("page_after_auth", uname=author), code=307)


@app.route("/reg", methods=["POST", "GET"])
def reg():
    if request.method == "POST":
        login = request.form.get("uname")
        password = request.form.get("psw")
        password_access = (password == request.form.get("psw2"))
        print(password_access)

        with connection:
            possible_user = cursor.execute("SELECT login FROM users WHERE login=?", (login,)).fetchall()
            if not bool(len(possible_user)):
                cursor.execute("INSERT INTO users (login, password) VALUES (?, ?)", (login, password,))
                logging.info(f'user {login} registrated succesfully')
                if not password_access:
                    return render_template("reg.html", password_different=True)

                return redirect(url_for("page_after_auth", uname=login), code=307)
            return render_template("reg.html", userExists=True)
    return render_template("reg.html")


@app.route("/auth", methods=["GET", "POST"])
def auth():
    if request.method == "POST":

        login = request.form.get("uname")
        password = request.form.get("psw")

        with connection:
            successful_auth = bool(
                len(cursor.execute("SELECT * FROM users WHERE login=? and password=?", (login, password,)).fetchall()))
            app.logger.warning(successful_auth)
        if successful_auth:
            # return redirect(url_for("page_after_auth"), )\
            logging.info(f'user {login} authorized succesfully')
            return redirect(url_for("page_after_auth", uname=login), code=307)
        logging.error(f'failure authorize {login}: possibly may not exist')
        return render_template("auth.html", error=True)
    return render_template("auth.html")


@app.route("/reset", methods=["POST"])
def reset_texts():
    uname = request.form.get('author')
    for el in to_read:
        to_read[el][3].discard(uname)
    return redirect(url_for("page_after_auth", uname=uname), code=307)


if __name__ == '__main__':
    logging.info(f'server started at {datetime.now()}')
    app.run(host="localhost", port=5000, ssl_context="adhoc")
