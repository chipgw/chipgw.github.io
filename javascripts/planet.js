function Planet(universe, pos, vel, m){
    this.velocity = vel;
    this.mass = m;
    this.radius = 0.0;

    this.updateRadius = function(){
        /* TODO - calculate radius based on reverse volume of a sphere function. */
        radius = Math.pow((3.0 * this.mass / 4.0) * Math.PI, 1.0 / 3.0);
        this.mesh.scale.x =  radius;
        this.mesh.scale.y =  radius;
        this.mesh.scale.z =  radius;
    }

    this.mesh = new THREE.Mesh(universe.sphere, universe.planetMaterial);
    universe.scene.add(this.mesh);

    this.mesh.position = pos;

    this.updateRadius();
}
