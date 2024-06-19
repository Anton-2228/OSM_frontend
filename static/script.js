import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js';
import 'https://unpkg.com/leaflet-contextmenu@1.4.0/dist/leaflet.contextmenu.js';
import 'https://unpkg.com/leaflet-path-drag@1.9.5/dist/index.js';

import {centerMap, zoomIn, zoomOut} from './context_menu.js'
import {coord_to_pix, pix_to_coord} from './utils.js'

var mymap = L.map('mapid', {
    contextmenu: true,
    contextmenuWidth: 140,
    contextmenuItems: [{
        text: 'Center map here',
        callback: centerMap
    }, '-', {
        text: 'Zoom in',
        callback: zoomIn
    }, {
        text: 'Zoom out',
        callback: zoomOut
    }]
}).setView([55.7522, 37.6156], 13);

var poly;

var width = 1;
var height = Math.sqrt(2)

var SizePolygonControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        var firstSizeButton = L.DomUtil.create('button', '', container);
        firstSizeButton.innerHTML = '1 фигура';
        L.DomEvent.on(firstSizeButton, 'click', function() {
            let k = 10000;
            poly = create_polygon(height*k, width*k)
        });

        var secondSizeButton = L.DomUtil.create('button', '', container);
        secondSizeButton.innerHTML = '2 фигура';
        L.DomEvent.on(secondSizeButton, 'click', function() {
            let k = 50000;
            poly = create_polygon(height*k, width*k)
        });

        var thirdSizeButton = L.DomUtil.create('button', '', container);
        thirdSizeButton.innerHTML = '3 фигура';
        L.DomEvent.on(thirdSizeButton, 'click', function() {
            let k = 100000;
            poly = create_polygon(height*k, width*k)
        });

        var fourthSizeButton = L.DomUtil.create('button', '', container);
        fourthSizeButton.innerHTML = '4 фигура';
        L.DomEvent.on(fourthSizeButton, 'click', function() {
            let k = 200000;
            poly = create_polygon(height*k, width*k)
        });

        return container;
    }
});

var sendPolygonControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom-separate');

        // Кнопка с вашей логикой
        var SendButton = L.DomUtil.create('button', '', container);
        SendButton.setAttribute("id", "send_button")
        SendButton.innerHTML = 'Отправить';
        L.DomEvent.on(SendButton, 'click', function() {
            SendButton.innerHTML = 'Ожидайте';
            SendButton.disabled = true;
            sendPoly();
        });

        return container;
    }
});

function create_polygon(height, width) {
    remove_polygon(poly);
    let coord = get_coord_poly(mymap.getCenter(), height, width)
    poly = new L.Polygon(coord,
        {
            color: '#810541',
            fillColor: '#D462FF',
            fillOpacity: 0.5,
            draggable: true
        }).addTo(mymap)
    return poly
}

function get_coord_poly(center, height, width) {
    console.log(center);
    center = coord_to_pix(center)
    let point1 = [center[0] - width/2, center[1] - height/2]
    let point2 = [center[0] + width/2, center[1] - height/2]
    let point3 = [center[0] + width/2, center[1] + height/2]
    let point4 = [center[0] - width/2, center[1] + height/2]

    return [pix_to_coord(point1), pix_to_coord(point2), pix_to_coord(point3), pix_to_coord(point4)]
}

function remove_polygon(poly) {
    if (poly != null) {
        poly.remove();
    }
}

function sendPoly() {
    let tl = {lat: poly.getBounds().getNorthWest()["lat"],
                        lon: poly.getBounds().getNorthWest()["lng"]};
    let dr = {lat: poly.getBounds().getSouthEast()["lat"],
        lon: poly.getBounds().getSouthEast()["lng"]};

    const urlParams = new URLSearchParams(window.location.search);
    let hash_id = urlParams.get('hash');

    const data = { tl: tl,
                        dr: dr,
                        hash_id: hash_id};

    fetch('http://127.0.0.1:8000/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => check_send_poly_response(data))
    .catch((error) => {
        console.error('Error:', error);
    });
}

function check_send_poly_response(data) {
    console.log(data)
    if (data["status"] === "outdated_page") {
        alert("Оййййй, кажется страничка устарела, cry about it")
    }
    let SendButton = document.getElementById("send_button")
    SendButton.innerHTML = 'Отправить';
    SendButton.disabled = false;
}

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

mymap.addControl(new SizePolygonControl());
mymap.addControl(new sendPolygonControl());
