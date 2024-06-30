from flask import Flask
from flask import render_template

app = Flask("123")
# app = Flask("123", template_folder = '/var/www/html/OSM_frontend/templates', static_folder = '/var/www/html/OSM_frontend/static/')

@app.route('/', methods=["GET"])
def main_page():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=False, host='192.168.100.108', port=5000)
#     app.run()