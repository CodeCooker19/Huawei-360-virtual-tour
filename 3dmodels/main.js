import * as THREE from './build/three.module.js';

import Stats from './jsm/libs/stats.module.js';

import {
    GLTFLoader
} from './jsm/loaders/GLTFLoader.js';

import {
    OrbitControls
} from './jsm/controls/OrbitControls.js';


var camera, scene, renderer, dirLight, hemiLight;
var stats;

var annotations = [];

var clock = new THREE.Clock();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
const M = window.M;
const $ = window.$;

var overlay;
var locationOverlay;

var baseFov = 45;

init();
animate();

console.log('owner: ' + parent.document);

function init() {

    var container = document.getElementById('container');

    overlay = document.getElementById('overlayName');

    locationOverlay = document.getElementById('locationOverlay');

    var fov = baseFov / (window.innerWidth / window.innerHeight);

    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 60;

    scene = new THREE.Scene();
    //scene.background = new THREE.Color().setHSL(0.6, 1, 1);
    //scene.fog = new THREE.Fog(scene.background, 1, 5000);

    // LIGHTS

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);


    //

    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    var d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;


    // GROUND

    var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
    var groundMat = new THREE.MeshLambertMaterial({
        color: 0xffffff
    });
    //groundMat.color.setHSL(0.095, 1, 0.75);

    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -33;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    //scene.add(ground);

    // SKYDOME

    var vertexShader = document.getElementById('vertexShader').textContent;
    var fragmentShader = document.getElementById('fragmentShader').textContent;
    var uniforms = {
        "topColor": {
            value: new THREE.Color(0x0077ff)
        },
        "bottomColor": {
            value: new THREE.Color(0xffffff)
        },
        "offset": {
            value: 33
        },
        "exponent": {
            value: 0.6
        }
    };
    uniforms["topColor"].value.copy(hemiLight.color);

    //scene.fog.color.copy(uniforms["bottomColor"].value);

    var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    });

    var sky = new THREE.Mesh(skyGeo, skyMat);
    //scene.add(sky);

    // LOADING MODEL

    var loader = new GLTFLoader();

    loader.load('models/gltf/HW_AILAB_05.gltf', function (gltf) {


        var shadowmap = new THREE.TextureLoader().load('models/gltf/shadow.png');
        gltf.scene.traverse(mesh => {
            if (mesh instanceof THREE.Mesh) {
                if (mesh.material.name == 'red') {
                    var map = mesh.material.map;

                    // ASSIGNED NEW MATERIAL FOR EACH ANNOTATION CIRCLE TO APPLY DIFFERENT COLORS FOR EACH CIRCLE

                    mesh.material = new THREE.MeshBasicMaterial({
                        color: 0x6FCCF9,
                        map: map,
                        transparent: true
                    });
                    mesh.renderOrder = -1;
                    annotations.push(mesh);

                }
                if (mesh.material.name == 'carpet.003') {
                    mesh.material = new THREE.MeshBasicMaterial({
                        map: shadowmap
                    });
                    shadowmap.flipY = false;
                }
                if (mesh.name == 'OVERALL_FLOOR_PLAN_008' || mesh.name == 'carpet') {
                    mesh.visible = false;
                }

                if (mesh.material.name == 'greay') {
                    mesh.material.transparent = true;
                    mesh.material.opacity = .5;
                    mesh.material.color = new THREE.Color('white');
                }
            }

        });

        console.log('Loading complete! Test: ' + parent.isTesting);

        if (!parent.isTesting) {
            if (parent.isMinimapLoaded == false) {
                parent.isMinimapLoaded = true;
                parent.HideLoadingPage();

                $('#5g-button', window.parent.document).click();   
            }
        }


        scene.add(gltf.scene);
    });

    // RENDERER

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0); // the default


    // STATS

    stats = new Stats();
    //container.appendChild(stats.dom);

    //ADDING EVENT LISTENERS

    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('mousemove', onMouseMove, false);

    window.addEventListener('mousedown', onMouseDown, false);


    //ORBIT CONTROLS 
    var orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.maxPolarAngle = Math.PI / 3;
    orbitControls.minPolarAngle = Math.PI / 4.5;

    orbitControls.update();

    orbitControls.setPan(-75, 0);

    orbitControls.setPolarAngle(orbitControls.minPolarAngle);
    orbitControls.setAzimuthalAngle(-0.2);

    // orbitControls.setAzimuthalAngle(-0.4328708040436869), orbitControls.setPolarAngle(0.44280608618847284);
    orbitControls.enableKeys = false;
    orbitControls.enablePan = false;
    orbitControls.enableRotate = false;
    orbitControls.enableZoom = false;

    // orbitControls.setAzimuthalAngle(-0.4328708040436869); orbitControls.setPolarAngle(0.44280608618847284);

}
// GET SCREEN POSITION (HTML) FROM 3D OBJECT POSITION

function getScreenPos(vector) {
    vector.project(camera);
    vector.x = (vector.x + 1) * window.innerWidth / 2;
    vector.y = -(vector.y - 1) * window.innerHeight / 2;
    vector.z = 0;
    return vector;
}

var isPopUp = false;



function onMouseDown(event) {

    if (intersect != null) {

        //M.toast({ html: 'You have clicked on ' + intersect.name.replace('_', ' ') });
        console.log("you have clicked on: " + intersect.name.replace('_', ' '));

        $("#theme-name", parent.document).text(intersect.name.replace('_', ' '));

        if (selectedTheme == "MINIMAP") {
            console.log("Minimap: " + intersect.name);

            var formattedName = intersect.name.replace('_', ' ');


            // Zone 1
            if (formattedName == "Main Hall") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[2]);
            }

            // Zone 2
            if (formattedName == "Zone 2") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[3]);
            }

            // Zone 3
            if (formattedName == "Zone 3") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[4]);
            }

            // Zone 4
            if (formattedName == "Main Hall2") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[5]);
            }

            // Zone 5
            if (formattedName == "Service Demo_Zone") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[6]);
            }

            // Zone 5
            if (formattedName == "Zone 10") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[7]);
            }

            // Zone 9
            if (formattedName == "Developer Zone") {
                parent.HideIFrameContainer();
                parent.DestroyInteractivesAfterTime();
                parent.LoadScene(parent.scenes[8]);
            }
        }
    }



    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}


function onMouseMove(event) {

    // Don't allow hover when no theme is selected
    if (selectedTheme == 'none') {
        return;
    }

    if (intersect != null) {

        isPopUp = true;

        var v1 = new THREE.Vector3().copy(intersect.getWorldPosition());

        v1 = getScreenPos(v1);

        overlay.textContent = intersect.name.replace('_', ' ');

        var formattedName = intersect.name.replace('_', ' ');

        var X = v1.x + (overlay.clientWidth / 4);
        var Y = v1.y - (overlay.clientHeight);

        HandleZoneContent(overlay, formattedName);

        //ANIMATE POPUPS
        //$(overlay).fadeIn();
        //overlay.style.transition = "transform 0s";
        //overlay.style.transform = "translate3d(" + X + "px," + Y + "px,0) ";

        /*
        setTimeout(() => {
            overlay.style.transition = "transform 2s";
            Y -= 30;
            overlay.style.transform = "translate3d(" + X + "px," + Y + "px,0) ";
 
        }, 100);
        */

    } else if (intersect == null) {
        isPopUp = false;
        $(overlay).fadeOut(0);

    }

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

var selectedTheme = 'none';

function SelectTheme(theme) {
    selectedTheme = theme;

    console.log('selected theme: ' + selectedTheme);

    ShowZoneNames();
}

$('#5g-button', window.parent.document).on('click', function () {
    SelectTheme('5G');
});

$('#ai-button', window.parent.document).on('click', function () {
    SelectTheme('AI');
});

$('#cloud-button', window.parent.document).on('click', function () {
    SelectTheme('CLOUD');
});

$('#minimap-btn', window.parent.document).on('click', function () {
    //SelectTheme('MINIMAP');
    selectedTheme = "MINIMAP";

    HandleLocation();
});


function HideZoneNames() {
    for (let index = 0; index < annotations.length; index++) {
        var currentOverlay = document.getElementById('overlay-' + (index + 1));


        if (selectedTheme == "none") {
            $(currentOverlay).fadeOut();
            continue;
        }
    }

}

function ShowZoneNames() {
    for (let index = 0; index < annotations.length; index++) {
        const element = annotations[index];

        var currentOverlay = document.getElementById('overlay-' + (index + 1));


        if (selectedTheme == "none") {
            element.visible = false;
            $(currentOverlay).fadeOut();
            continue;
        }

        element.visible = true;


        if (selectedTheme == "5G") {

            // Not showing developer zone
            if (index == 3) {
                element.visible = false;
                $(currentOverlay).fadeOut();

                continue;
            }
        }

        if (selectedTheme == "AI") {}

        if (selectedTheme == "CLOUD") {
            // Test
        }


        var v1 = new THREE.Vector3().copy(element.getWorldPosition());

        v1 = getScreenPos(v1);

        //currentOverlay.textContent = element.name.replace('_', ' ');

        var formattedName = element.name.replace('_', ' ');

        HandleZoneContent(currentOverlay, formattedName);


        //ANIMATE POPUPS
        $(currentOverlay).fadeIn();
        //overlay.style.transition = "transform 1s";

        var X = v1.x; // - (currentOverlay.clientWidth / 2);
        var Y = v1.y - (currentOverlay.clientHeight * 1.5);

        if (formattedName == "Zone 2") {
            Y -= currentOverlay.clientHeight / 2;
        }

        currentOverlay.style.transform = "translate3d(" + X + "px," + Y + "px,0) ";
    }
}

var selectedElement = -1;

function HandleLocation() {
    console.log("Current scene: " + parent.currentScene);

    var X;
    var Y;

    // Main Hall
    // Main Hall 2
    // Service Demo_Zone
    // Developer_Zone
    // Zone 2
    // Zone 3
    // Zone 10
    var element;

    if (parent.currentScene == "Zone 1") {
        element = annotations[0];
        selectedElement = 0;
    }

    if (parent.currentScene == "Zone 2") {
        element = annotations[4];
        selectedElement = 4;
    }

    if (parent.currentScene == "Zone 3") {
        element = annotations[5];
        selectedElement = 5;
    }

    if (parent.currentScene == "Zone 4") {
        element = annotations[1];
        selectedElement = 1;
    }

    if (parent.currentScene == "Zone 5") {
        element = annotations[2];
        selectedElement = 2;
    }

    if (parent.currentScene == "Zone 9") {
        element = annotations[3];
        selectedElement = 3;
    }

    if (parent.currentScene == "Zone 10") {
        element = annotations[6];
        selectedElement = 6;
    }

    if (element == null) {
        console.log("Not a valid scene: " + parent.currentScene);

        return;
    } else {
        element.material.color.set(0xFF0000);
    }
    /*
    var v1 = new THREE.Vector3().copy(element.getWorldPosition());

    v1 = getScreenPos(v1);

    X = v1.x; // - (currentOverlay.clientWidth / 2);
    Y = v1.y;

    if (locationOverlay != null) {
        $(locationOverlay).fadeIn();
        locationOverlay.style.transform = "translate3d(" + (X - locationOverlay.clientWidth/2) + "px," + (Y - locationOverlay.clientHeight * 1.5) + "px,0) ";   
    }
    */
}

function HandleZoneContent(currentOverlay, formattedName) {
    if (selectedTheme == "5G") {
        $("#overlay-text-1").text("Media & Entertainment");
        $("#overlay-text-2").text("Education & Health");
        $("#overlay-text-3").text("5G Knowledge");
        $("#overlay-text-4").text("Education & Health");
        $("#overlay-text-5").text("Logistics & Transportation");
        $("#overlay-text-6").text("Industry 4.0");
        $("#overlay-text-7").text("Virtual Academy");
    } else if (selectedTheme == "AI") {
        $("#overlay-text-1").text("AI Introduction"); // Zone 1 - Main_Hall - overlay-text-1
        $("#overlay-text-2").text("Co-Partner Solutions"); // Zone 4 - Main_Hall2 - overlay-text-2
        $("#overlay-text-3").text("Institute of Higher Learning"); // Zone 5 - Service_Demo_Zone - overlay-text-3
        $("#overlay-text-4").text("Online Developer Zone"); // Developer Zone - Developer_Zone - overlay-text-4
        $("#overlay-text-5").text("Intelligent Metropolis"); // Zone 2 - Zone_2 - overlay-text-5
        $("#overlay-text-6").text("Economy Transformations"); // Zone 3 - Zone_3 - overlay-text-6
        $("#overlay-text-7").text("Virtual Academy"); // Zone 10 - Zone_10 - overlay-text-7
    } else if (selectedTheme == "CLOUD") {
        $("#overlay-text-1").text("Grow With Intelligence");
        $("#overlay-text-2").text("Logistics + Retail");
        $("#overlay-text-3").text("EI Healthcare + Education");
        $("#overlay-text-4").text("Online Developer Zone");
        $("#overlay-text-5").text("Smart City");
        $("#overlay-text-6").text("Environment Development");
        $("#overlay-text-7").text("Virtual Academy");
    }

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight *1.1;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    //camera.fov = baseFov / (window.innerWidth / window.innerHeight);

    console.log("Resizing");

    ShowZoneNames();

}


//
function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

var intersect;

function HandleOverlayNameHighlight(name) {
    console.log("Highlighting : " + name);

    // Zone 1 - Main_Hall - overlay-text-1
    // Zone 2 - Zone_2 - overlay-text-5
    // Zone 3 - Zone_3 - overlay-text-6
    // Zone 4 - Main_Hall2 - overlay-text-2
    // Zone 5 - Service_Demo_Zone - overlay-text-3
    // Developer Zone - Developer_Zone - overlay-text-4
    // Zone 10 - Zone_10 - overlay-text-7

    if (name == "Main_Hall") {
        $("#overlay-text-1").addClass("selectedOverlay");
        $("#overlay-bar-1").addClass("overlayBarExpand");
    }
    if (name == "Zone_2") {
        $("#overlay-text-5").addClass("selectedOverlay");
        $("#overlay-bar-5").addClass("overlayBarExpand");
    }
    if (name == "Zone_3") {
        $("#overlay-text-6").addClass("selectedOverlay");
        $("#overlay-bar-6").addClass("overlayBarExpand");
    }
    if (name == "Main_Hall2") {
        $("#overlay-text-2").addClass("selectedOverlay");
        $("#overlay-bar-2").addClass("overlayBarExpand");
    }
    if (name == "Service_Demo_Zone") {
        $("#overlay-text-3").addClass("selectedOverlay");
        $("#overlay-bar-3").addClass("overlayBarExpand");
    }
    if (name == "Developer_Zone") {
        $("#overlay-text-4").addClass("selectedOverlay");
        $("#overlay-bar-4").addClass("overlayBarExpand");
    }
    if (name == "Zone_10") {
        $("#overlay-text-7").addClass("selectedOverlay");
        $("#overlay-bar-7").addClass("overlayBarExpand");
    }
}

function ResetOverlayHighlights() {
    
    $("#overlay-text-1").removeClass("selectedOverlay");
    $("#overlay-text-2").removeClass("selectedOverlay");
    $("#overlay-text-3").removeClass("selectedOverlay");
    $("#overlay-text-4").removeClass("selectedOverlay");
    $("#overlay-text-5").removeClass("selectedOverlay");
    $("#overlay-text-6").removeClass("selectedOverlay");
    $("#overlay-text-7").removeClass("selectedOverlay");
    
    $("#overlay-bar-1").removeClass("overlayBarExpand");
    $("#overlay-bar-2").removeClass("overlayBarExpand");
    $("#overlay-bar-3").removeClass("overlayBarExpand");
    $("#overlay-bar-4").removeClass("overlayBarExpand");
    $("#overlay-bar-5").removeClass("overlayBarExpand");
    $("#overlay-bar-6").removeClass("overlayBarExpand");
    $("#overlay-bar-7").removeClass("overlayBarExpand");
}

function render() {

    camera.fov = baseFov / (window.innerWidth / window.innerHeight);

    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(annotations);

    for (let index = 0; index < annotations.length; index++) {
        const element = annotations[index];

        if (index != selectedElement) {

            // RESET ANNOTATIONS CIRCLE COLOR
            element.material.color.set(0x6FCCF9);

        }

    }
    if (intersects.length > 0) {


        // OBJECT DETAILS OF INTERSECTED WITH MOUSE
        intersect = intersects[0].object;

        HandleOverlayNameHighlight(intersect.name);

        if (intersect != annotations[selectedElement]) {

            intersect.material.color.set(0x4BFF4E);
        }

    } else {
        intersect = null;
        ResetOverlayHighlights();
    }

    var delta = clock.getDelta();

    renderer.render(scene, camera);

}
