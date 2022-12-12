from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import csv
# from OpenSSL import SSL
# context = SSL.Context(SSL.PR)
# context.use_privatekey_file('server.key')
# context.use_certificate_file('server.crt')

app = Flask("voice_recorder")


app.config['UPLOAD_FOLDER'] = 'files/'

folder = "/home/main/projects/voice-recording-web"
@app.route("/")
def index():
    with open('text.txt') as text:
        f1 = text.read()
    with open('task.txt') as task:
        f2 = task.read()
    return render_template("index.html", title="testt", text=f1, task=f2)


@app.route("/recording", methods=["POST"])
def get_file():
    if request.method == "POST":
        app.logger.warning('log begin')
        app.logger.warning(request.files.get('voice'))
        file = request.files.get('voice')
        filename = secure_filename(file.filename) + f'{datetime.now()}' +'.wav'

        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        app.logger.warning('log end')
        return render_template("index.html", title="testt")



if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True, ssl_context="adhoc")
