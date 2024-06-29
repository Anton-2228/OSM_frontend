// import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js';
import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
import 'https://unpkg.com/leaflet-contextmenu@1.4.0/dist/leaflet.contextmenu.js';
// import 'https://unpkg.com/leaflet-path-drag@1.9.5/dist/index.js';
// import './test_drag.js'
// import "https://unpkg.com/leaflet-truesize";
// import "https://unpkg.com/leaflet-truesize@3.1.0/dist/Leaflet.TrueSize.umd.js";
// import './leaflet/truesize.js'

import {centerMap, zoomIn, zoomOut} from './context_menu.js'
import * as utils from './utils.js'

(function() {
    L.Map.mergeOptions({
        touchExtend: true
    });

    L.Map.TouchExtend = L.Handler.extend({
        initialize: function(map) {
            this._map = map;
            this._container = map._container;
            return this._pane = map._panes.overlayPane;
        },
        addHooks: function() {
            L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
            L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
            return L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);
        },
        removeHooks: function() {
            L.DomEvent.off(this._container, 'touchstart', this._onTouchStart);
            L.DomEvent.off(this._container, 'touchend', this._onTouchEnd);
            return L.DomEvent.off(this._container, 'touchmove', this._onTouchMove);
        },
        _onTouchEvent: function(e, type) {
            var containerPoint, latlng, layerPoint, touch;
            if (!this._map._loaded) {
                return;
            }
            touch = e.touches[0];
            containerPoint = L.point(touch.clientX, touch.clientY);
            layerPoint = this._map.containerPointToLayerPoint(containerPoint);
            latlng = this._map.layerPointToLatLng(layerPoint);
            return this._map.fire(type, {
                latlng: latlng,
                layerPoint: layerPoint,
                containerPoint: containerPoint,
                originalEvent: e
            });
        },
        _onTouchStart: function(e) {
            return this._onTouchEvent(e, 'touchstart');
        },
        _onTouchEnd: function(e) {
            if (!this._map._loaded) {
                return;
            }
            return this._map.fire('touchend', {
                originalEvent: e
            });
        },
        _onTouchMove: function(e) {
            return this._onTouchEvent(e, 'touchmove');
        }
    });

    L.Map.addInitHook('addHandler', 'touchExtend', L.Map.TouchExtend);

}).call(this);

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

mymap.dragging.disable();

var poly;

var width = 1;
var height = Math.sqrt(2);

var TeleportPolygonControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        var teleportButton = L.DomUtil.create('button', '', container);
        teleportButton.innerHTML = "Переместить область к вам";
        L.DomEvent.on(teleportButton, 'click', function() {
              teleport_polygon();
        });

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    }
});

var SizePolygonControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        var slider = L.DomUtil.create('input', '', container);
        slider.type = 'range';
        slider.min = '1000';
        slider.max = '80000';
        slider.value = '10000';
        slider.step = '1';

        poly = create_polygon(mymap.getCenter(), height * slider.value, width * slider.value);

        L.DomEvent.on(slider, 'input', function() {
            let k = slider.value;
            poly = create_polygon(poly.getCenter(), height*k, width*k);
        });

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

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

function teleport_polygon() {
    let tl = {lat: poly.getBounds().getNorthWest()["lat"],
                        lng: poly.getBounds().getNorthWest()["lng"]};
    let dr = {lat: poly.getBounds().getSouthEast()["lat"],
        lng: poly.getBounds().getSouthEast()["lng"]};

    tl = utils.coord_to_pix(tl);
    dr = utils.coord_to_pix(dr);

    let height = tl[1] - dr[1];
    let width = dr[0] - tl[0];

    poly = create_polygon(mymap.getCenter(), height, width);
    return poly
}

function create_polygon(center, height, width) {
    remove_polygon(poly);
    let coord = get_coord_poly(center, height, width)
    poly = new L.Rectangle(coord,
        {
            color: '#810541',
            fillColor: '#D462FF',
            fillOpacity: 0.5
        }).addTo(mymap);

    utils.set_on_events(poly, mymap);
    return poly
}

function get_coord_poly(center, height, width) {
    center = utils.coord_to_pix(center)
    let point1 = [center[0] - width/2, center[1] - height/2]
    let point2 = [center[0] + width/2, center[1] - height/2]
    let point3 = [center[0] + width/2, center[1] + height/2]
    let point4 = [center[0] - width/2, center[1] + height/2]

    return [utils.pix_to_coord(point1), utils.pix_to_coord(point2), utils.pix_to_coord(point3), utils.pix_to_coord(point4)]
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
    if (data["status"] === "outdated_page") {
        alert("Оййййй, кажется страничка устарела, cry about it")
    }
    let SendButton = document.getElementById("send_button")
    SendButton.innerHTML = 'Отправить';
    SendButton.disabled = false;
}

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

mymap.addControl(new TeleportPolygonControl());
mymap.addControl(new SizePolygonControl());
mymap.addControl(new sendPolygonControl());