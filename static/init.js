export function addControlPlaceholders(map) {
    var corners = map._controlCorners,
        l = 'leaflet-',
        container = map._controlContainer;

    function createCorner(vSide, hSide) {
        var className = l + vSide + ' ' + l + hSide;

        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
    }

    createCorner('top', 'horizontalmiddle');
}

// Change the position of the Zoom Control to a newly created placeholder.
// map.zoomControl.setPosition('verticalcenterright');

// You can also put other controls in the same placeholder.
// L.control.scale({position: 'verticalcenterright'}).addTo(map);