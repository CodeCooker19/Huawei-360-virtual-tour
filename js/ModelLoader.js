// Three.js ray.intersects with offset canvas

var container, camera, scene, renderer, mesh,

    mouse = {
        x: 0,
        y: 0
    },
    objects = [],

    count = 0,

    CANVAS_WIDTH = 1000,
    CANVAS_HEIGHT = 500;

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

container = document.getElementById('model-parent');
//document.body.appendChild(container);

renderer = new THREE.WebGLRenderer({
    alpha: true
});
renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);

container.appendChild(renderer.domElement);

modelScene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 1000);
camera.position.x = 0;
camera.position.y = 20;
camera.position.z = 50;
camera.lookAt(modelScene.position);

function render() {

    if (mesh) {
        mesh.rotation.y += 0.01;
    }

    renderer.render(modelScene, camera);

}

(function animate() {

    requestAnimationFrame(animate);

    render();

})();

var light = new THREE.DirectionalLight("#ffffff", 1);
var ambient = new THREE.AmbientLight("#85b2cd", 5);
light.position.set(0, -70, 100).normalize();
modelScene.add(light);
modelScene.add(ambient);

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

        mesh = gltf.scene;
        //mesh.scale.set(0.01, 0.01, 0.01);
        mesh.scale.set(1, 1, 1);
        modelScene.add(mesh);

        mesh.position.y = -5;
        mesh.position.x = -5;

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
