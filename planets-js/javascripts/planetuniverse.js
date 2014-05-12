function parseVector3(node) {
    /* Z is up in files, Y is up in three.js, so we switch them. */
    return new THREE.Vector3(parseFloat(node.getAttribute("x")), parseFloat(node.getAttribute("z")), parseFloat(node.getAttribute("y")));
}

function Universe(){
    const GRAVITY_CONST = 6.67e-11;
    const VELOCITY_UI_FACTOR = 1.0e-5;

    this.scene = new THREE.Scene();

    this.sphere = new THREE.SphereGeometry(1, 64, 32);
    this.wireframeSphere = new THREE.SphereGeometry(1.05, 16, 8);

    this.planetMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("images/planet.png") } );
    this.wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

    this.speed = 1000.0;

//     this.selectedHighlight = new THREE.Mesh(this.wireframeSphere, this.wireframeMaterial);
//     this.scene.add(this.selectedHighlight);

    this.planets = [];

    this.advance = function(time) {
        time *= this.speed;
        for(var i = 0; i < this.planets.length; ++i) {
            var planet = this.planets[i];
            for(var o = i + 1; o < this.planets.length; ++o) {
                var other = this.planets[o];

                var direction = new THREE.Vector3();
                direction.subVectors(other.mesh.position, planet.mesh.position);
                var distancesqr = direction.lengthSq();

                if(distancesqr < Math.pow(planet.radius + other.radius, 2)){
                    planet.mesh.position.addVectors(other.mesh.position.multiplyScalar(other.mass), planet.mesh.position.multiplyScalar(planet.mass));
                    planet.velocity.addVectors(other.velocity.multiplyScalar(other.mass), planet.velocity.multiplyScalar(planet.mass));
                    planet.mass += other.mass;
                    planet.updateRadius();
                    planet.mesh.position.divideScalar(planet.mass);
                    planet.velocity.divideScalar(planet.mass);
                    this.remove(o);
                }else{
                    direction.setLength(GRAVITY_CONST * ((other.mass * planet.mass) / distancesqr) * time);

                    planet.velocity.add(direction.clone().divideScalar(planet.mass));
                    other.velocity.sub(direction.clone().divideScalar(other.mass));
                }
            }

            planet.mesh.position.add(planet.velocity.clone().multiplyScalar(time));
            //planet.updatePath();
        }
    }

    this.remove = function(index) {
        if(index < this.planets.length) {
            this.scene.remove(this.planets[index].mesh);
            this.planets.splice(index, 1);
        }
    }

    this.clear = function() {
        while(this.planets.length != 0) {
            this.remove(0);
        }
    }

    this.loadFile = function(filename) {
        var universe = this;
        var reader = new FileReader();

        reader.onload = function() {
            universe.loadString(this.result);
        };
        reader.readAsText(filename);
    }

    this.loadString = function(data) {
        var parsed = new DOMParser().parseFromString(data, "text/xml");
        var planetsXML = parsed.getElementsByTagName("planet");

        if(planetsXML.length == 0){
            alert("Error loading simulation: no planets found!\nIs the file a valid universe file?");
            return;
        }

        this.clear();

        for(var i = 0; i < planetsXML.length; ++i) {
            var planetXML = planetsXML[i];

            var position = parseVector3(planetXML.getElementsByTagName("position")[0]);
            var velocity = parseVector3(planetXML.getElementsByTagName("velocity")[0]);
            var mass = parseFloat(planetXML.getAttribute("mass"));

            var planet = new Planet(this, position, velocity.multiplyScalar(VELOCITY_UI_FACTOR), mass);
        }

        console.log("loaded " + planetsXML.length + " planets.");
    }
}
