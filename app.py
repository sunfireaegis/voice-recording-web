from flask import Flask, render_template, request

# from OpenSSL import SSL
# context = SSL.Context(SSL.PR)
# context.use_privatekey_file('server.key')
# context.use_certificate_file('server.crt')

app = Flask("voice_recorder")


@app.route("/")
def index():
    return render_template("index.html", title="testt")


@app.route("/recording", methods=["POST"])
def get_file():
    if request.method == "POST":
        return render_template("index.html", success=True)


if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True, ssl_context="adhoc")
