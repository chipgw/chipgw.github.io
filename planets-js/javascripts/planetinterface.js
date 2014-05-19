var camera, controls, renderer;
var universe;

function init() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x010204);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.z = 64;

    controls = new THREE.OrbitControls(camera, renderer.domElement);

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

/* Start Create Planet Popup Controls */

document.getElementById("menuCreatePlanet").addEventListener("click", function(e) {
    var style = document.getElementById("createPlanetPopup").style;
    if (style.display == "block") {
        style.display = "none";
    } else {
        style.display = "block";
    }
}, false);

document.getElementById("createPlanetButton").addEventListener("click", function(e) {
    var positionX = parseFloat(document.getElementById("createPositionX").value);
    var positionY = parseFloat(document.getElementById("createPositionZ").value);
    var positionZ = parseFloat(document.getElementById("createPositionY").value);
    var velocityX = parseFloat(document.getElementById("createVelocityX").value) * VELOCITY_UI_FACTOR;
    var velocityY = parseFloat(document.getElementById("createVelocityZ").value) * VELOCITY_UI_FACTOR;
    var velocityZ = parseFloat(document.getElementById("createVelocityY").value) * VELOCITY_UI_FACTOR;
    var mass = parseFloat(document.getElementById("createMass").value);
    new Planet(universe, new THREE.Vector3(positionX, positionY, positionZ), new THREE.Vector3(velocityX, velocityY, velocityZ), mass);
}, false);

document.getElementById("createPlanetClose").addEventListener("click", function(e) {
    document.getElementById("createPlanetPopup").style.display = "none";
}, false);

/* End Create Planet Popup Controls */

/* Start Speed Popup Controls */

document.getElementById("menuSpeedControl").addEventListener("click", function(e) {
    var style = document.getElementById("speedPopup").style;
    if (style.display == "block") {
        style.display = "none";
    } else {
        style.display = "block";
    }
}, false);

document.getElementById("speedPopup").style.display = "block";

document.getElementById("speedPopupClose").addEventListener("click", function(e) {
    document.getElementById("speedPopup").style.display = "none";
}, false);

document.getElementById("speedRange").addEventListener("input", function(e) {
    universe.speed = parseFloat(e.target.value);
}, false);

document.getElementById("speedPauseResume").addEventListener("click", function(e) {
    var range = document.getElementById("speedRange");
    if (range.value == 0) {
        /* TODO - store previous value toresume to. */
        range.value = 1000;
        e.target.value = "Pause";
    } else {
        range.value = 0;
        e.target.value = "Resume";
    }
    universe.speed = parseFloat(range.value);
}, false);

document.getElementById("speedFastForward").addEventListener("click", function(e) {
    var range = document.getElementById("speedRange");
    if (range.value == 0 || range.value == range.max) {
        /* TODO - store previous value toresume to. */
        range.value = 1000;
    } else {
        range.value = range.value * 2;
    }
    document.getElementById("speedPauseResume").value = "Pause";
    universe.speed = parseFloat(range.value);
}, false);

/* End Speed Popup Controls */
