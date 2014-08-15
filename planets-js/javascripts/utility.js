function NormalizeScreenCoord(x, y, w, h) {
    return new THREE.Vector3(2 * (x / w) - 1, 1 - 2 * (y / h));
}