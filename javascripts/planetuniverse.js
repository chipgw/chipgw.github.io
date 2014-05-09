function Universe(){
    this.scene = new THREE.Scene();
    this.sphere = new THREE.SphereGeometry(1, 64, 32);
    this.wireframeSphere = new THREE.SphereGeometry(1, 32, 16);
    this.planetMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("images/planet.png") } );
    this.wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    this.selectedHighlight = new THREE.Mesh(this.wireframeSphere, this.wireframeMaterial);
    this.scene.add(this.selectedHighlight);

    this.planets = [];
}
