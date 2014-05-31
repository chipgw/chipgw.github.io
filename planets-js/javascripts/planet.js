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
        if(this.path == undefined) {
            this.resetPath();
        } else if(this.path.vertices.length != pathLength){
            this.resizePath();
        }
        if(pathLength > 0 && this.mesh.position.distanceToSquared(this.path.vertices[0]) > pathRecordDistance) {
            this.path.vertices.pop();
            this.path.vertices.unshift(this.mesh.position.clone());
            this.path.verticesNeedUpdate = true;
        }
    }

    this.mesh = new THREE.Mesh(universe.sphere, universe.planetMaterial);
    this.mesh.position.copy(pos);
    universe.scene.add(this.mesh);
    universe.planets.push(this);

    this.resetPath = function() {
        this.path = new THREE.Geometry();
        while(this.path.vertices.length < pathLength) {
            this.path.vertices.push(this.mesh.position.clone());
        }
        this.path.dynamic = true;

        if(this.line != null) {
            universe.scene.remove(this.line);
        }

        this.line = new THREE.Line(this.path, universe.lineMaterial);
        universe.scene.add(this.line);
    }

    this.resizePath = function() {
        var oldPath = this.path;

        this.path = new THREE.Geometry();

        this.path.vertices = oldPath.vertices;

        if(this.path.vertices.length > pathLength) {
            this.path.vertices.splice(pathLength, this.path.vertices.length - pathLength);
        }
        while(this.path.vertices.length < pathLength) {
            this.path.vertices.unshift(this.mesh.position.clone());
        }
        this.path.dynamic = true;

        if(this.line != null) {
            universe.scene.remove(this.line);
        }

        this.line = new THREE.Line(this.path, universe.lineMaterial);
        universe.scene.add(this.line);
    }

    this.updateRadius();
}
