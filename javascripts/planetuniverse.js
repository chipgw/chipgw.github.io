function Universe(){
    const GRAVITY_CONST = 6.67e-11;
    this.scene = new THREE.Scene();

    this.sphere = new THREE.SphereGeometry(1, 64, 32);
    this.wireframeSphere = new THREE.SphereGeometry(1.05, 16, 8);

    this.planetMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("images/planet.png") } );
    this.wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

//     this.selectedHighlight = new THREE.Mesh(this.wireframeSphere, this.wireframeMaterial);
//     this.scene.add(this.selectedHighlight);

    this.planets = [];

    this.advance = function(time) {
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
}
