var camera, renderer;
var universe;

function init() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x010204);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.z = 32;

    universe = new Universe();

    new Planet(universe, new THREE.Vector3(), new THREE.Vector3(), 128);
    new Planet(universe, new THREE.Vector3(16,0,0), new THREE.Vector3(), 64);
}

var lastTime = new Date().getTime();

function animate(time) {
    requestAnimationFrame(animate);

    var delta = time - lastTime;
    lastTime = time;

    //mesh.rotation.x += delta * 0.00005;
    //mesh.rotation.y += delta * 0.0001;

    renderer.render(universe.scene, camera);
}

init();
animate(new Date().getTime());

window.onresize = function(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
};
