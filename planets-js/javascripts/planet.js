/* TODO - make it so changing this actually works... */
var pathLength = 256;
var pathRecordDistance = 1.0;

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

    this.updatePath = function() {
        if(this.mesh.position.distanceToSquared(this.path.vertices[0]) > pathRecordDistance) {
            this.path.vertices.pop();
            this.path.vertices.unshift(this.mesh.position.clone());
            this.path.verticesNeedUpdate = true;
        }
    }

    this.mesh = new THREE.Mesh(universe.sphere, universe.planetMaterial);
    this.mesh.position.copy(pos);
    universe.scene.add(this.mesh);
    universe.planets.push(this);

    this.path = new THREE.Geometry();
    while(this.path.vertices.length < pathLength) {
        this.path.vertices.push(pos.clone());
    }
    this.path.dynamic = true;

    this.line = new THREE.Line(this.path, universe.lineMaterial);
    universe.scene.add(this.line);

    this.updateRadius();
}
