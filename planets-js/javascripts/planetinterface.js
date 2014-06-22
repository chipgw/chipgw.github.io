var universe;

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
        if (confirm("Are you sure you want to destroy the universe?")) {
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

    var toggleButton = document.createElement("input");
    toggleButton.setAttribute("type", "button");
    toggleButton.setAttribute("class", "popupToggle");
    popup.appendChild(toggleButton);

    function toggle(e) {
        if (style.display == "table") {
            style.display = "none";
            toggleButton.setAttribute("value", "\u25BC");
        } else {
            style.display = "table";
            toggleButton.setAttribute("value", "\u25B2");
        }
    }

    popup.children[0].addEventListener("dblclick", toggle, false);
    toggleButton.addEventListener("click", toggle, false);

    if(visible) {
        style.display = "table";
        toggleButton.setAttribute("value", "\u25B2");
    } else {
        style.display = "none";
        toggleButton.setAttribute("value", "\u25BC");
    }
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
        universe.pathLength = parseFloat(e.target.value);
    }, false);

    document.getElementById("pathDistance").addEventListener("change", function(e) {
        universe.pathRecordDistance = parseFloat(e.target.value);
        universe.pathRecordDistance *= universe.pathRecordDistance;
    }, false);
}

function initCreatePlanetPopup() {
    initPopup("createPlanetPopup");

    document.getElementById("createPlanetButton").addEventListener("click", function(e) {
        var positionX = parseFloat(document.getElementById("createPositionX").value);
        var positionY = parseFloat(document.getElementById("createPositionY").value);
        var positionZ = parseFloat(document.getElementById("createPositionZ").value);
        var velocityX = parseFloat(document.getElementById("createVelocityX").value) * VELOCITY_UI_FACTOR;
        var velocityY = parseFloat(document.getElementById("createVelocityY").value) * VELOCITY_UI_FACTOR;
        var velocityZ = parseFloat(document.getElementById("createVelocityZ").value) * VELOCITY_UI_FACTOR;
        var mass = parseFloat(document.getElementById("createMass").value);
        new Planet(new THREE.Vector3(positionX, positionY, positionZ), new THREE.Vector3(velocityX, velocityY, velocityZ), mass);
    }, false);
}

function initRandomPopup() {
    initPopup("randomPopup");

    document.getElementById("randomGenerateButton").addEventListener("click", function(e) {
        var amount = Math.min(parseInt(document.getElementById("randomAmount").value), 50);
        var range = parseFloat(document.getElementById("randomRange").value);
        var maxSpeed = parseFloat(document.getElementById("randomSpeed").value) * VELOCITY_UI_FACTOR;
        var maxMass = parseFloat(document.getElementById("randomMass").value);

        function rand() {
            return Math.random() * 2.0 - 1.0;
        }

        for(var i = 0; i < amount; ++i) {
            var position = new THREE.Vector3(rand() * range, rand() * range, rand() * range);
            var velocity = new THREE.Vector3(rand(), rand(), rand());
            velocity.normalize();
            velocity.multiplyScalar(rand() * maxSpeed);
            var mass = Math.random() * maxMass;
            new Planet(position, velocity, mass)
        }
    }, false);
}

function init() {
    try {
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x040406);
        var canvas = document.body.appendChild(renderer.domElement);
    } catch (e) {
        document.body.innerHTML = "<h1>Sorry, you don't appear to have WebGL.</h1>" +
                                  "You can try updating your graphics drivers or your browser.";
        return;
    }

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.y = 64;
    camera.up.set(0, 0, 1);

    window.onresize = function(e) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix();
    };

    var controls = new THREE.OrbitControls(camera, canvas);

    universe = new Universe();

    initFileUI(canvas);
    initMenu();
    initSpeedPopup();
    initViewSettings();
    initCreatePlanetPopup();
    initRandomPopup();

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

