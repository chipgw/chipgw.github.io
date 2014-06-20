function Planet(pos, vel, m) {
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
        if(this.path == undefined) {
            this.initPath();
        } else if(this.path.vertices.length != universe.pathLength){
            this.resizePath();
        }
        if(universe.pathLength > 1 && this.mesh.position.distanceToSquared(this.path.vertices[1]) > universe.pathRecordDistance) {
            this.path.vertices.pop();
            this.path.vertices.splice(1, 0, this.mesh.position.clone());
        }
        this.path.verticesNeedUpdate = true;
    }

    this.mesh = new THREE.Mesh(universe.sphere, universe.planetMaterial);
    this.mesh.position.copy(pos);
    universe.scene.add(this.mesh);
    universe.planets.push(this);

    this.initPath = function() {
        this.path = new THREE.Geometry();

        while(this.path.vertices.length < universe.pathLength) {
            this.path.vertices.push(this.mesh.position.clone());
        }

        if(universe.pathLength > 0) {
            /* this is a reference to the current position, making the first vertex stay exactly where the planet currently is. */
            this.path.vertices[0] = this.mesh.position;
        }

        this.path.dynamic = true;

        if(this.line != null) {
            universe.scene.remove(this.line);
        }

        this.line = new THREE.Line(this.path, universe.lineMaterial);
        universe.scene.add(this.line);
    }

    this.resizePath = function() {
        var oldPath = this.path.vertices;
        if(oldPath.length > 0) {
            /* removes the reference to the current position */
            oldPath.shift();
        }

        this.path = new THREE.Geometry();

        this.path.vertices = oldPath;

        if(this.path.vertices.length > universe.pathLength) {
            this.path.vertices.splice(universe.pathLength, this.path.vertices.length - universe.pathLength);
        } else while(this.path.vertices.length < universe.pathLength) {
            this.path.vertices.unshift(this.mesh.position.clone());
        }

        if(universe.pathLength > 0) {
            /* this is a reference to the current position, making the first vertex stay exactly where the planet currently is. */
            this.path.vertices[0] = this.mesh.position;
        }

        this.path.dynamic = true;

        universe.scene.remove(this.line);

        this.line = new THREE.Line(this.path, universe.lineMaterial);
        universe.scene.add(this.line);
    }

    this.updateRadius();
}
