from flask import Flask, render_template, request

app = Flask("voice_recorder")


@app.route("/")
def index():
    return render_template("index.html", title="testt")


@app.route("/recording")
def get_file():
    print(request.method)
    if request.method == "POST":
        print("Post Method")
    else:
        print("GEt method")
        return "Some Text"


if __name__ == '__main__':
    app.run(host="localhost", port=5000)
