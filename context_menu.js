export function centerMap (e) {
    mymap.panTo(e.latlng);
}

export function zoomIn (e) {
    mymap.zoomIn();
}

export function zoomOut (e) {
    mymap.zoomOut();
}