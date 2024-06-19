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