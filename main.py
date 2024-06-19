from flask import Flask
from flask import render_template

app = Flask("123")

@app.route('/', methods=["GET"])
def main_page():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=False)