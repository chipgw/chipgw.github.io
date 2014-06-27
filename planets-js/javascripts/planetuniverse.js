function parseVector3(node) {
    return new THREE.Vector3(parseFloat(node.getAttribute("x")), parseFloat(node.getAttribute("y")), parseFloat(node.getAttribute("z")));
}

/* for changing Y-up meshes to Z-up. */
function swapYZ(verts) {
    for(var i = 0; i < verts.length; ++i) {
        var z = verts[i].y;
        verts[i].y = -verts[i].z;
        verts[i].z = z;
    }
}

const GRAVITY_CONST = 6.67e-11;
const VELOCITY_UI_FACTOR = 1.0e-5;

function Universe() {
    this.scene = new THREE.Scene();

    this.sphere = new THREE.SphereGeometry(1, 64, 32);
    swapYZ(this.sphere.vertices);
    this.wireframeSphere = new THREE.SphereGeometry(1.05, 16, 8);
    swapYZ(this.wireframeSphere.vertices);

    this.planetMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("images/planet.png") } );
    this.wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    this.pathLength = 256;
    this.pathRecordDistance = 1.0;

    this.speed = 1000.0;

    this.selectedHighlight = new THREE.Mesh(this.wireframeSphere, this.wireframeMaterial);
    this.scene.add(this.selectedHighlight);

    this.selected = null;

    this.planets = [];

    this.advance = function(time) {
        var steps = Math.ceil(this.speed / 1000.0);
        time *= this.speed / steps;
        for(var step = 0; step < steps; step++) {
            for(var i = 0; i < this.planets.length; ++i) {
                var planet = this.planets[i];
                for(var o = i + 1; o < this.planets.length; ++o) {
                    var other = this.planets[o];

                    var direction = other.mesh.position.clone().sub(planet.mesh.position);
                    var distancesqr = direction.lengthSq();

                    if(distancesqr < Math.pow(planet.radius + other.radius, 2)) {
                        planet.mesh.position.addVectors(other.mesh.position.multiplyScalar(other.mass),
                                                        planet.mesh.position.multiplyScalar(planet.mass));
                        planet.velocity.addVectors(other.velocity.multiplyScalar(other.mass),
                                                   planet.velocity.multiplyScalar(planet.mass));
                        planet.mass += other.mass;
                        planet.updateRadius();
                        planet.mesh.position.divideScalar(planet.mass);
                        planet.velocity.divideScalar(planet.mass);
                        planet.initPath();
                        this.remove(o);
                    } else {
                        direction.setLength(GRAVITY_CONST * ((other.mass * planet.mass) / distancesqr) * time);

                        planet.velocity.add(direction.clone().divideScalar(planet.mass));
                        other.velocity.sub(direction.clone().divideScalar(other.mass));
                    }
                }

                planet.mesh.position.add(planet.velocity.clone().multiplyScalar(time));
                planet.updatePath();
            }
        }

        if(this.selected !== null) {
            this.selectedHighlight.position = this.selected.mesh.position;
            this.selectedHighlight.scale.set(this.selected.radius, this.selected.radius, this.selected.radius);
            this.selectedHighlight.visible = true;
        } else {
            this.selectedHighlight.visible = false;
        }
    }

    this.remove = function(target) {
        var index = -1;

        if(typeof target === 'number') {
            index = target;
        } else {
            index = this.planets.indexOf(target);
        }

        if(index > -1 && index < this.planets.length) {
            this.scene.remove(this.planets[index].mesh);
            this.scene.remove(this.planets[index].line);

            if(this.selected === this.planets[index]) {
                this.selected = null;
            }

            this.planets.splice(index, 1);
        }
    }

    this.clear = function() {
        while(this.planets.length !== 0) {
            this.remove(0);
        }
    }

    this.center = function() {
        var averagePosition = new THREE.Vector3(0.0, 0.0, 0.0);
        var averageVelocity = new THREE.Vector3(0.0, 0.0, 0.0);
        var totalMass = 0.0;

        for(var i = 0; i < this.planets.length; ++i) {
            var planet = this.planets[i];

            averagePosition.add(planet.mesh.position.clone().multiplyScalar(planet.mass));
            averageVelocity.add(planet.velocity.clone().multiplyScalar(planet.mass));
            totalMass += planet.mass;
        }

        averagePosition.divideScalar(totalMass);
        averageVelocity.divideScalar(totalMass);

        for(var i = 0; i < this.planets.length; ++i) {
            var planet = this.planets[i];

            planet.mesh.position.sub(averagePosition);
            planet.velocity.sub(averageVelocity);
            planet.initPath();
        }
    }

    this.loadFile = function(filename) {
        var universe = this;
        var reader = new FileReader();

        reader.onload = function() {
            universe.loadDOM(new DOMParser().parseFromString(this.result, "text/xml"));
        };
        reader.readAsText(filename);
    }

    this.loadUrl = function(url) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        this.loadDOM(xmlHttp.responseXML);
    }

    this.loadDOM = function(parsed) {
        var planetsXML = parsed.getElementsByTagName("planet");

        if(planetsXML.length === 0){
            alert("Error loading simulation: no planets found!\nIs the file a valid universe file?");
            return;
        }

        this.clear();

        for(var i = 0; i < planetsXML.length; ++i) {
            var planetXML = planetsXML[i];

            var position = parseVector3(planetXML.getElementsByTagName("position")[0]);
            var velocity = parseVector3(planetXML.getElementsByTagName("velocity")[0]);
            var mass = parseFloat(planetXML.getAttribute("mass"));

            var planet = new Planet(position, velocity.multiplyScalar(VELOCITY_UI_FACTOR), mass);
        }

        console.log("loaded " + planetsXML.length + " planets.");
    }

    this.selectUnder = function(x, y, w, h, camera) {
        this.selected = null;

        var mouse = new THREE.Vector3(2 * (x / w) - 1, 1 - 2 * (y / h));

        var ray = (new THREE.Projector()).pickingRay(mouse.clone(), camera).ray;

        var nearest = Infinity;

        for(var i = 0; i < this.planets.length; ++i) {
            var planet = this.planets[i];

            var sphere = new THREE.Sphere(planet.mesh.position, planet.radius);
            var dist = planet.mesh.position.distanceToSquared(ray.origin);

            if(ray.isIntersectionSphere(sphere) && dist < nearest) {
                nearest = dist;
                this.selected = planet;
            }
        }
    }
}
