var Req = 6378160

export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

export function radToDeg(rad) {
    return rad / (Math.PI / 180);
}

export function coord_to_pix(coord) {
    let lon = degToRad(coord["lng"])
    let lat = degToRad(coord["lat"])
    let x = Req * lon
    let y = Req * Math.log(Math.tan(Math.PI/4 + lat/2))
    return [x,y]
}

export function pix_to_coord(pix) {
    let lon = pix[0]/Req
    let lat = 2 * Math.atan(Math.exp(pix[1]/Req)) - Math.PI/2
    return [radToDeg(lat), radToDeg(lon)]
}

function isPointInRectangle(latlng, rectangle) {
    let bounds = rectangle.getBounds();
    return bounds.contains(latlng);
}

export function set_on_events(poly, mymap) {
    var isDragging = false;
    var startLatLng = 0;
    mymap.on('touchstart', function(e) {
        let latlng = e.latlng;
        if (isPointInRectangle(latlng, poly)) {
            isDragging = true;
            startLatLng = latlng;
            mymap.dragging.disable();
        }
    });

    mymap.on('touchmove', function(e) {
        if (isDragging) {
            // var latlng = e.touches ? map.mouseEventToLatLng(e.touches[0]) : e.latlng;
            let latlng = e.latlng;
            let offset = L.latLng(
                latlng.lat - startLatLng.lat,
                latlng.lng - startLatLng.lng
            );
            let b = poly.getBounds();

            let newBounds = [
                [b.getSouthWest()["lat"] + offset.lat, b.getSouthWest()["lng"] + offset.lng],
                [b.getNorthEast()["lat"] + offset.lat, b.getNorthEast()["lng"] + offset.lng]
            ];

            poly.setBounds(newBounds);
            startLatLng = latlng;
        }
    });

    mymap.on('touchend', function() {
        if (isDragging) {
            isDragging = false;
            mymap.dragging.enable();
        }
    });

    poly.on('mousedown', function(e) {
        isDragging = true;
        startLatLng = e.latlng;
        mymap.dragging.disable();
    });

    mymap.on('mousemove', function(e) {
        if (isDragging) {
            let latlng = e.latlng;
            let offset = L.latLng(
                latlng.lat - startLatLng.lat,
                latlng.lng - startLatLng.lng
            );

            let b = poly.getBounds();
            let newBounds = [
                [b.getSouthWest()["lat"] + offset.lat, b.getSouthWest()["lng"] + offset.lng],
                [b.getNorthEast()["lat"] + offset.lat, b.getNorthEast()["lng"] + offset.lng]
            ];

            poly.setBounds(newBounds);
            startLatLng = latlng;
        }
    });

    mymap.on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            mymap.dragging.enable();
        }
    });
}
