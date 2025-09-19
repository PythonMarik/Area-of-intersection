const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    BABYLON.ImportMeshAsync("https://assets.babylonjs.com/meshes/box.babylon");

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 0.7;

    return scene;
};

const scene = createScene();

//render loop
engine.runRenderLoop(function () {
    scene.render();
});

//catch resize
window.addEventListener("resize", function () {
    engine.resize();
});