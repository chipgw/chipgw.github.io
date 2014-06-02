var camera, controls, renderer, universe;

function initFileUI(dropTarget) {
    document.getElementById("loadFile").addEventListener("change", function(e) {
        universe.loadFile(e.target.files[0]);
        document.getElementById("loadFileForm").reset();
    }, false);

    document.getElementById("menuOpenFile").addEventListener("click", function(e) {
        document.getElementById("loadFile").click();
    }, false);

    dropTarget.addEventListener("dragenter", function(e) {
        e.stopPropagation();
        e.preventDefault();
    }, false);

    dropTarget.addEventListener("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    }, false);

    dropTarget.addEventListener("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            universe.loadFile(e.dataTransfer.files[0]);
        }
    }, false);
}

function initMenu() {
    document.getElementById("menuClear").addEventListener("click", function(e) {
        var clear = confirm("Are you sure you want to destroy the universe?")

        if (clear) {
        universe.clear();
        }
    }, false);

    document.getElementById("menuCenter").addEventListener("click", function(e) {
        universe.center();
    }, false);
}

function initPopup(name, visible) {
    var popup = document.getElementById(name);
    var style = popup.children[1].style;

    popup.children[0].addEventListener("click", function(e) {
        if (style.display == "table") {
            style.display = "none";
        } else {
            style.display = "table";
        }
    }, false);

    if(visible) {
        style.display = "table";
    } else {
        style.display = "none";
    }
}

function initCreatePlanetPopup() {
    initPopup("createPlanetPopup");

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
}

function initSpeedPopup() {
    initPopup("speedPopup", true);

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
}

function initViewSettings() {
    initPopup("viewPopup");

    document.getElementById("pathLength").addEventListener("change", function(e) {
        pathLength = parseFloat(e.target.value);
    }, false);
}

function init() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x040406);
    var canvas = document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.z = 64;

    window.onresize = function(event) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix();
    };

    controls = new THREE.OrbitControls(camera, canvas);

    universe = new Universe();

    initFileUI(canvas);
    initMenu();
    initCreatePlanetPopup();
    initSpeedPopup();
    initViewSettings();

    try {
        universe.loadUrl("systems/default.xml");
    } catch (e) { }

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

    requestAnimationFrame(animate);
}

init();

