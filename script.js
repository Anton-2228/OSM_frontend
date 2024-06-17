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

export var customControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        var firstSizeButton = L.DomUtil.create('button', '', container);
        firstSizeButton.innerHTML = '1 фигура';
        L.DomEvent.on(firstSizeButton, 'click', function() {
            let height = 0.1;
            let width = 0.05;
            poly = create_polygon(height, width)
        });

        var secondSizeButton = L.DomUtil.create('button', '', container);
        secondSizeButton.innerHTML = '2 фигура';
        L.DomEvent.on(secondSizeButton, 'click', function() {
            let height = 0.2;
            let width = 0.1;
            poly = create_polygon(height, width)
        });

        var thirdSizeButton = L.DomUtil.create('button', '', container);
        thirdSizeButton.innerHTML = '3 фигура';
        L.DomEvent.on(thirdSizeButton, 'click', function() {
            let height = 0.3;
            let width = 0.15;
            poly = create_polygon(height, width)
        });

        var fourthSizeButton = L.DomUtil.create('button', '', container);
        fourthSizeButton.innerHTML = '4 фигура';
        L.DomEvent.on(fourthSizeButton, 'click', function() {
            let height = 0.4;
            let width = 0.2;
            poly = create_polygon(height, width)
        });

        return container;
    }
});

function create_polygon(height, width) {
    remove_polygon(poly);
    height /= 2;
    width /= 2;
    let lat = mymap.getCenter()["lat"];
    let lon = mymap.getCenter()[["lng"]];
    poly = new L.Polygon([[lat-height, lon-width], [lat-height, lon+width], [lat+height, lon+width], [lat+height, lon-width]],
        {
            color: '#810541',
            fillColor: '#D462FF',
            fillOpacity: 0.5,
            draggable: true
        }).addTo(mymap)
    return poly
}

function remove_polygon(poly) {
    if (poly != null) {
        poly.remove();
    }
}

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

mymap.addControl(new customControl());
