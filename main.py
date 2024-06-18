from flask import Flask, request, jsonify
from flask import render_template
import subprocess

app = Flask("123")

@app.route('/')
def main_page():
    return render_template("index.html")

@app.route('/send', methods=["POST"])
def get_polygon():
    response = {'result': 'success'}
    if request.is_json:
        content = request.get_json()
        tl = content["tl"]
        dr = content["dr"]
        minlat = min(tl["lat"], dr["lat"])
        minlon = min(tl["lon"], dr["lon"])
        maxlat = max(tl["lat"], dr["lat"])
        maxlon = max(tl["lon"], dr["lon"])
        subprocess.run(f'python3 /home/anton/Desktop/OSM_roads_parser/get_osm.py {minlat} {minlon} {maxlat} {maxlon} test.osm', shell=True)
        subprocess.run(f'python3 /home/anton/Desktop/OSM_roads_parser/main.py test.osm test.png', shell=True)
    else:
        response['result'] = 'failed_get_json'

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=False)