// Three.js ray.intersects with offset canvas

var minimapContainer, minimapCamera, minimapScene, minimapRenderer, minimapMesh,

    mouse = {
        x: 0,
        y: 0
    },
    objects = [],

    count = 0,

    CANVAS_WIDTH = 0,
    CANVAS_HEIGHT = 0;

// info
info = document.createElement('div');
info.style.position = 'absolute';
info.style.top = '30px';
info.style.width = '100%';
info.style.textAlign = 'center';
info.style.color = '#f00';
info.style.backgroundColor = 'transparent';
info.style.zIndex = '1';
info.style.userSelect = "none";
info.style.webkitUserSelect = "none";
info.style.MozUserSelect = "none";
document.body.appendChild(info);

function LoadMinimapInRegistration() {


    minimapContainer = document.getElementById('minimap-model-registration');
    //document.body.appendChild(minimapContainer);

    var element = document.getElementById('minimap-model-card-registration');
    var positionInfo = element.getBoundingClientRect();
    CANVAS_HEIGHT = positionInfo.height;
    CANVAS_WIDTH = positionInfo.width;

    console.log('width: ' + CANVAS_WIDTH);

    minimapRenderer = new THREE.WebGLRenderer({
        alpha: true
    });
    minimapRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

    minimapContainer.appendChild(minimapRenderer.domElement);

    minimapModelScene = new THREE.Scene();

    minimapModelScene.dispose();

    minimapModelScene.remove(minimapMesh);

    minimapCamera = new THREE.PerspectiveCamera(50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
    minimapCamera.position.x = 0;
    minimapCamera.position.y = 40;
    minimapCamera.position.z = 100;
    minimapCamera.lookAt(minimapModelScene.position);

    function render() {

        if (minimapMesh) {
            minimapMesh.rotation.y += 0.01;
        }

        minimapRenderer.render(minimapModelScene, minimapCamera);

    }

    (function animate() {

        requestAnimationFrame(animate);

        render();

    })();

    var light = new THREE.DirectionalLight("#ffffff", 1);
    var ambient = new THREE.AmbientLight("#85b2cd", 2);
    light.position.set(0, -70, 100).normalize();
    minimapModelScene.add(light);
    minimapModelScene.add(ambient);

    // 3Dモデル用テクスチャ画像の読込
    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        //'https://cdn.jsdelivr.net/gh/siouxcitizen/3DModel@a1c2e47550ca20de421f6d779229f66efab07830/yuusha.gltf',
        //'https://obs.ap-southeast-3.myhuaweicloud.com:443/hiverlabtest/huawei-virtualtour/models/city/scene.gltf',
        './models/HW_AILAB_04.gltf',
        //'../models/scan_machine.gltf',
        // called when the resource is loaded
        function (gltf) {

            minimapMesh = gltf.scene;
            //minimapMesh.scale.set(0.01, 0.01, 0.01);
            minimapMesh.scale.set(1, 1, 1);
            minimapModelScene.add(minimapMesh);

            //minimapMesh.position.y = -5;
            //minimapMesh.position.x = -5;

        },
        // called when loading is in progresses
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );
}


function LoadMinimapInContent() {
    minimapContainer = document.getElementById('minimap-model-content');
    //document.body.appendChild(minimapContainer);

    var element = document.getElementById('minimap-model-card-content');
    var positionInfo = element.getBoundingClientRect();
    CANVAS_HEIGHT = positionInfo.height;
    CANVAS_WIDTH = positionInfo.width;

    minimapRenderer = new THREE.WebGLRenderer({
        alpha: true
    });
    minimapRenderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

    minimapContainer.appendChild(minimapRenderer.domElement);

    minimapModelScene = new THREE.Scene();
    
    minimapModelScene.dispose();

    minimapModelScene.remove(minimapMesh);

    minimapCamera = new THREE.PerspectiveCamera(50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
    minimapCamera.position.x = 0;
    minimapCamera.position.y = 40;
    minimapCamera.position.z = 100;
    minimapCamera.lookAt(minimapModelScene.position);

    function render() {

        if (minimapMesh) {
            minimapMesh.rotation.y += 0.01;
        }

        minimapRenderer.render(minimapModelScene, minimapCamera);

    }

    (function animate() {

        requestAnimationFrame(animate);

        render();

    })();

    var light = new THREE.DirectionalLight("#ffffff", 1);
    var ambient = new THREE.AmbientLight("#85b2cd", 2);
    light.position.set(0, -70, 100).normalize();
    minimapModelScene.add(light);
    minimapModelScene.add(ambient);

    // 3Dモデル用テクスチャ画像の読込
    var loader = new THREE.GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        //'https://cdn.jsdelivr.net/gh/siouxcitizen/3DModel@a1c2e47550ca20de421f6d779229f66efab07830/yuusha.gltf',
        //'https://obs.ap-southeast-3.myhuaweicloud.com:443/hiverlabtest/huawei-virtualtour/models/city/scene.gltf',
        './models/HW_AILAB_04.gltf',
        //'../models/scan_machine.gltf',
        // called when the resource is loaded
        function (gltf) {

            minimapMesh = gltf.scene;
            //minimapMesh.scale.set(0.01, 0.01, 0.01);
            minimapMesh.scale.set(1, 1, 1);
            minimapModelScene.add(minimapMesh);

            //minimapMesh.position.y = -5;
            //minimapMesh.position.x = -5;

        },
        // called when loading is in progresses
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );
}
