import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js';
import 'https://unpkg.com/leaflet-contextmenu@1.4.0/dist/leaflet.contextmenu.js';
import 'https://unpkg.com/leaflet-path-drag@1.9.5/dist/index.js';

import {centerMap, zoomIn, zoomOut} from './context_menu.js'

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
        SendButton.innerHTML = 'Отправить';
        L.DomEvent.on(SendButton, 'click', function() {
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
    center = coord_to_pix(center)
    let point1 = [center[0] - width/2, center[1] - height/2]
    let point2 = [center[0] + width/2, center[1] - height/2]
    let point3 = [center[0] + width/2, center[1] + height/2]
    let point4 = [center[0] - width/2, center[1] + height/2]

    return [pix_to_coord(point1), pix_to_coord(point2), pix_to_coord(point3), pix_to_coord(point4)]
}

var Req = 6378160

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function radToDeg(rad) {
    return rad / (Math.PI / 180);
}

function coord_to_pix(coord) {
    let lon = degToRad(coord["lng"])
    let lat = degToRad(coord["lat"])
    let x = Req * lon
    let y = Req * Math.log(Math.tan(Math.PI/4 + lat/2))
    return [x,y]
}

function pix_to_coord(pix) {
    let lon = pix[0]/Req
    let lat = 2 * Math.atan(Math.exp(pix[1]/Req)) - Math.PI/2
    console.log(pix)
    console.log(lon)
    console.log(lat)
    return [radToDeg(lat), radToDeg(lon)]
}

function remove_polygon(poly) {
    if (poly != null) {
        poly.remove();
    }
}

function sendPoly() {

}

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

mymap.addControl(new SizePolygonControl());
mymap.addControl(new sendPolygonControl());
