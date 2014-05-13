function Planet(universe, pos, vel, m) {
    this.velocity = vel.clone();
    this.mass = m;
    this.radius = 0.0;

    this.updateRadius = function() {
        this.radius = Math.pow((3.0 * this.mass / 4.0) * Math.PI, 1.0 / 3.0);
        this.mesh.scale.x =  this.radius;
        this.mesh.scale.y =  this.radius;
        this.mesh.scale.z =  this.radius;
    }

    this.mesh = new THREE.Mesh(universe.sphere, universe.planetMaterial);
    this.mesh.position.copy(pos);
    universe.scene.add(this.mesh);
    universe.planets.push(this);


    this.updateRadius();
}
