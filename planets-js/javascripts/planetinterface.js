var camera, controls, renderer;
var universe;

function init() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x010204);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.z = 64;

    controls = new THREE.OrbitControls(camera);

    universe = new Universe();

    new Planet(universe, new THREE.Vector3(-16), new THREE.Vector3(0, -0.000005), 256);
    new Planet(universe, new THREE.Vector3(16), new THREE.Vector3(0, 0.00002), 64);
}

var lastTime = null;

function animate(time) {
    if(lastTime == null){
        lastTime = time;
    }
    var delta = Math.min(time - lastTime, 10.0);
    lastTime = time;

    universe.advance(delta);

    controls.update();

    renderer.render(universe.scene, camera);

    requestAnimationFrame(animate);
}

init();
requestAnimationFrame(animate);

window.onresize = function(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
};

document.getElementById("loadFile").addEventListener("change", function(e) {
    universe.loadFile(e.target.files[0]);
    document.getElementById("loadFileForm").reset();
}, false);

document.getElementById("menuOpenFile").addEventListener("click", function(e) {
    document.getElementById("loadFile").click();
}, false);
