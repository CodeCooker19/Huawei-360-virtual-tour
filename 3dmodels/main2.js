import * as THREE from './build/three.module.js';

import Stats from './jsm/libs/stats.module.js';

import {
    GLTFLoader
} from './jsm/loaders/GLTFLoader.js';

import {
    OrbitControls
} from './jsm/controls/OrbitControls.js';

import {
    TTFLoader
} from './jsm/loaders/TTFLoader.js';

var camera, scene, renderer, dirLight;
var stats;

var displayMaterial;

var clock = new THREE.Clock();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var fruits = [];

const M = window.M;

var weighingPose;

var prevPose;

var startTex;

var scanVideoTex;

var scanVideoElement;


init();
animate();

var baseFov = 35;

var atlasText = "Atlas +";
var cloudText = "Cloud AI";

var cloudDesc = "Please refer to Online Developer Area -\nCloud Model Arts Platform";
var atlasDesc = "Please refer to Intelligent Computing Area -\nAtlas Product Introduction";

var scannerVideoPlayer = videojs('vid1', {
    controlBar: {
        pictureInPictureToggle: false
    }
});

console.log('video player: ' + scannerVideoPlayer);

window.PlayVideo = function() {
    scannerVideoPlayer.currentTime(0);
    playVideo();
}

window.PauseVideo = function() {
    pauseVideo();
}

function playVideo(){
    scannerVideoPlayer.play();
}

function pauseVideo(){
    scannerVideoPlayer.pause();
}


function init() {

    var container = document.getElementById('container');
    
    var fov = baseFov / (window.innerWidth / window.innerHeight);

    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 2;
    camera.position.y = 3;

    //camera.fov = fov;

    scene = new THREE.Scene();


    var texLoader = new THREE.TextureLoader();

    scanVideoElement = document.getElementById('scan_video');

    scanVideoTex = new THREE.VideoTexture(scanVideoElement);
    scanVideoTex.flipY = false;


    // SCENE BACKGROUND LOAD....
    texLoader.load('models/old_depot.jpg', texture => {

        var pmremGenerator = new THREE.PMREMGenerator(renderer);
        var envMap = pmremGenerator.fromEquirectangular(texture).texture;

        //scene.background = envMap;
        scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();


    });

    //dir light 
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

    /*
    var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
    var groundMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    groundMat.color.setHSL(0.095, 1, 0.75);

    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    */

    // MODEL

    var loader = new GLTFLoader();


    // LOADING MODEL
    loader.load('models/gltf/weighing machine.gltf', function (gltf) {

        gltf.scene.traverse(mesh => {
            if (mesh instanceof THREE.Mesh) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                if (mesh.material.name.toLowerCase().includes('apple') || mesh.material.name.toLowerCase().includes('banana') || mesh.material.name.toLowerCase().includes('orange')) {

                    //ASSIGN NEW MATERIAL FOR BAGS TO APPLY DIFFERENT COLOR FOR EACH BAG ON  HOVER
                    mesh.material = mesh.material.clone();
                    fruits.push(mesh);

                }
                if (mesh.material.name == 'plastic') {
                    mesh.material.transparent = true;
                    mesh.material.opacity = .5;
                }
                if (mesh.name == 'weighingPose') {
                    weighingPose = mesh.position;
                }
                if (mesh.material.name == 'display') {
                    displayMaterial = mesh.material;

                    // STORE DISPLAY RESET TEXTURE IN VARIABLE TO REUSE
                    startTex = displayMaterial.map;
                }

            }
        })

        scene.add(gltf.scene);
        
        $("#loading-screen").fadeOut();
        console.log("loaded");

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
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0); // the default

    // Sphere


    var sphereGeometry = new THREE.SphereGeometry(0.025, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
    var sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x63BF56
    });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = -0.14;
    sphere.position.y = 0.48;
    sphere.position.z = -0.19;
    sphere.name = 'camera';

    fruits.push(sphere);

    scene.add(sphere);


    // TEXT LOADER
    var material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        flatShading: true
    });

    var cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        flatShading: true
    });


    var cameraMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
        emissive: 0xffffff,
        emissiveIntensity: 2.0
        
    });

    group = new THREE.Group();
    group.position.y = 0;

    scene.add(group);

    var loader = new TTFLoader();

    loader.load('fonts/Exo-Regular.ttf', function (json) {

        font = new THREE.Font(json);
        createText(atlasText, 0, 0.02, -0.03, 0.4, -0.15, 4, 0.001, 0, material);
        createText(cloudText, 0, 0.02, -0.04, 0.375, -0.12, 4, 0.001, 0, cloudMaterial);
        createText("Camera", 0, 0.025, -0.25, 0.42, -0.15, 4, 0.001, 0, cameraMaterial);
        
        createText(atlasDesc, 0, 0.025, 0.125, 0.35, -0.15, 4, 0.001, 0, cameraMaterial);
        createText(cloudDesc, 0, 0.025, 0.125, 0.35, -0.15, 4, 0.001, 0, cameraMaterial);
        

        fruits.push(atlasTextMesh);
        fruits.push(cloudTextMesh);

    });
    // STATS


    stats = new Stats();
    //container.appendChild(stats.dom);

    // EVENT LISTENERS

    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('mousemove', onMouseMove, false);

    window.addEventListener('mousedown', onMouseDown, false);


    //orbit controls
    var orbitControls = new OrbitControls(camera, renderer.domElement);

    orbitControls.maxAzimuthAngle = Math.PI / 6;
    orbitControls.minAzimuthAngle = -Math.PI / 6;
    orbitControls.maxPolarAngle = Math.PI / 2.5;
    orbitControls.minPolarAngle = Math.PI / 2.5;
    //orbitControls.minPolarAngle = Math.PI / 2;

    orbitControls.setPan(-100, 275);
    orbitControls.setPolarAngle(orbitControls.maxPolarAngle);

    // orbitControls.setAzimuthalAngle(-0.4328708040436869), orbitControls.setPolarAngle(0.44280608618847284);
    orbitControls.enableKeys = false;
    orbitControls.enablePan = false;
    orbitControls.enableRotate = false;
    orbitControls.enableZoom = false;
}


var group, textMesh2;
var firstLetter = true;

var text = 'Atlas\nInside',
    height = 0,
    size = 0.025,
    hover = 0.4,
    curveSegments = 4,
    bevelThickness = 0.001,
    bevelSize = 0,
    xAxis = 0.06,
    zAxis = -0.15;

var font = null;
var mirror = false;
var cameraText;
var atlasTextMesh;
var cloudTextMesh;

var atlasDetailsTextMesh;
var cloudDetailsTextMesh;

function createText(text, height, size, x, y, z, curveSegments, bevelThickness, bevelSize, material, mirror = false) {

    var textGeo = new THREE.TextBufferGeometry(text, {

        font: font,

        size: size,
        height: height,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: true

    });

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    var textMesh = new THREE.Mesh(textGeo, material);

    textMesh.position.x = x;
    textMesh.position.y = y;
    textMesh.position.z = z;

    textMesh.rotation.x = 270;
    textMesh.rotation.y = 0; //Math.PI * 2;

    group.add(textMesh);

    if (mirror) {

        textMesh2 = new THREE.Mesh(textGeo, material);

        textMesh2.position.x = centerOffset;
        textMesh2.position.y = -hover;
        textMesh2.position.z = height;

        textMesh2.rotation.x = Math.PI;
        textMesh2.rotation.y = Math.PI * 2;

        group.add(textMesh2);

    }

    textMesh.name = text;

    if (text == "Camera") {
        cameraText = textMesh;
    }

    if (text == atlasText) {
        atlasTextMesh = textMesh;
    }
    
    if (text == cloudText) {
        cloudTextMesh = textMesh;
    }
    
    if (text == atlasDesc) {
        atlasDetailsTextMesh = textMesh;
    }
    
    if (text == cloudDesc) {
        cloudDetailsTextMesh = textMesh;
    }

}


var price = 0.42;
var weight = 200;
var currentBag;
var bagChecked = false;
var isBagReset = true;

function onMouseDown(event) {

    if (intersect != null && currentBag != intersect && !bagChecked && isBagReset) {
        if (intersect.name == 'camera' || intersect.name == atlasText || intersect.name == cloudText) {
            return;
        }
        
        currentBag = intersect;
        bagChecked = true;
        isBagReset = false;
        scanVideoTex.currentTime = 0;
        scanVideoElement.play();
        displayMaterial.map = scanVideoTex;
        displayMaterial.map.needsUpdate = true;

        // RETRIVE SELECTED BAG INFORMATION
        //M.toast({ html: 'Your added ' + intersect.name });
        
        var minWeight = 75;
        var maxWeight = 175;
        
        var minCost = 0.4;
        var maxCost = 0.95;
        
        var randWeight = Math.random() * (maxWeight - minWeight) + minWeight;
        var randCost = Math.random() * (maxCost - minCost) + minCost;


        document.getElementById('weight').textContent = randWeight.toFixed(2) + ' G';
        document.getElementById('price').textContent = '$ ' + randCost.toFixed(2);


        // STORE ACTUAL POSITION OF BAG
        prevPose = new THREE.Vector3().copy(intersect.position);


        intersect.position.copy(weighingPose);
        if (intersect.name.toLowerCase().includes('banana')) {
            intersect.rotation.set(Math.PI / 2, 0, 0);
            intersect.position.y += 0.01;
            document.getElementById('fruit').textContent = "Banana";

        }
        if (intersect.name.toLowerCase().includes('apple')) {
            intersect.rotation.set(Math.PI / 2, 0, 0);
            intersect.position.y += 0.04;
            document.getElementById('fruit').textContent = "Apple";

        }
        if (intersect.name.toLowerCase().includes('orange')) {
            intersect.rotation.set(Math.PI, 0, 0);
            intersect.position.y += 0.04;
            document.getElementById('fruit').textContent = "Orange";

        }


        setTimeout(() => {
            $('#scanning').fadeOut(0);
            $('#digital-meter').css('display', 'flex');

            $('#fruit-details').fadeIn();
            setTimeout(() => {
                updateDisplayTex();

                bagChecked = false;
            }, 1000);
        }, 1000);

    } else

    if (currentBag && currentBag == intersect && !bagChecked) {

        // RELOCATE BAG AT ORIGINAL POSITION
        currentBag.position.copy(prevPose);

        isBagReset = true;

        $('#scanning').fadeIn();
        $('#fruit-details').fadeOut();


        currentBag = null;
        prevPose = null;
    }

}

// CONVERT HTML ELEMENT TO CANVAS -> TEXTURE 
function updateDisplayTex() {

    var meter = document.getElementById('digital-meter');
    window.html2canvas(meter).then(canvas => {
        var tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false;

        //APPLY TEXTURE TO DISPLAY
        displayMaterial.map = tex;
        displayMaterial.map.needsUpdate = true;
    });
}


var isPopUp = false;

var isTouchingButton = false;
var isTouchingAtlasButton = false;
var isTouchingCloudButton = false;

function onMouseMove(event) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    if (intersect != null && !isPopUp) {
        //M.toast({ html: intersect.name });
        isPopUp = true;
    }
    if (intersect == null) {
        isPopUp = false;
    }



}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


//

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

var intersect;

function render() {



    camera.fov = (baseFov * 1.1) / (window.innerWidth / window.innerHeight);

    // RESET DISPLAY IF NO BAG IS SCANNING && SELECTED
    if (displayMaterial && displayMaterial.map != startTex && currentBag === null) {
        displayMaterial.map = startTex;
        displayMaterial.map.needsUpdate = true;
    }
    raycaster.setFromCamera(mouse, camera);

    if (bagChecked) {
        displayMaterial.map.needsUpdate = true;
    }

    if (cameraText != null) {
        if (isTouchingButton) {
            cameraText.visible = true;
        } else {
            cameraText.visible = false;
        }
    }
    
    if (atlasDetailsTextMesh != null) {
        if (isTouchingAtlasButton) {            
            atlasDetailsTextMesh.visible = true;
        } else {
            atlasDetailsTextMesh.visible = false;
        }
    }
    
    if (cloudDetailsTextMesh != null) {
        if (isTouchingCloudButton) {
            console.log("Touching atlas");
            
            cloudDetailsTextMesh.visible = true;
        } else {
            cloudDetailsTextMesh.visible = false;
        }
    }

    // calculate objects intersecting the picking ray
    if (fruits) {
        var intersects = raycaster.intersectObjects(fruits);


        for (let index = 0; index < fruits.length; index++) {
            const element = fruits[index];
            if (element.name == atlasText){
                isTouchingAtlasButton = false;
                // RESET Camera color
                element.material.color.set(0xFFFFFF);
            } else if (element.name == cloudText){
                isTouchingCloudButton = false;
                // RESET Camera color
                element.material.color.set(0xFFFFFF);
            } else if (element.name == 'camera') {
                // RESET Camera color
                element.material.color.set(0x63BF56);
                isTouchingButton = false;

            } else {
                if (element.name == 'camera' || element.name == 'Camera' || element.name == atlasText) {

                } else {

                    // RESET ALL BAG COLORS 
                    element.material.color.set(0xffffff);
                }
            }
        }
        if (intersects.length > 0) {


            // GET SELECTED BAG 
            intersect = intersects[0].object;

            if (currentBag != intersect) {


                if (intersect.name == atlasText) {
                    isTouchingAtlasButton = true;
                    // RESET Camera color
                    intersect.material.color.set(0x63BF56);
                } else if (intersect.name == cloudText) {
                    isTouchingCloudButton = true;
                    // RESET Camera color
                    intersect.material.color.set(0x63BF56);
                } else if (intersect.name == 'camera') {

                    // RESET Camera color
                    intersect.material.color.set(0x77EA67);
                    isTouchingButton = true;

                } else {

                    if (intersect.name == 'camera' || intersect.name == 'Camera') {

                    } else {
                        // CHANGE SELECTED BAG COLOR
                        intersect.material.color.set(0x499EF0);
                    }
                }

            }
        } else {
            intersect = null;
        }
    }

    // for (var i = 0; i < intersects.length; i++) {

    //     intersects[i].object.material.color.set(0xff0000);

    // }
    var delta = clock.getDelta();

    renderer.render(scene, camera);

}
