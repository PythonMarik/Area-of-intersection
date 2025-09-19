const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(1, 0.929, 0.953);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 1;

    // Константы
    const TESSELLATION = 64;
    const R1 = 2.0; // Радиус первой окружности
    const R2 = 1.5; // Радиус второй окружности
    const D = 2.5;  // Расстояние между центрами
    const O1 = new BABYLON.Vector3(-D / 2, 0, 0); // Центр первой окружности
    const O2 = new BABYLON.Vector3(D / 2, 0, 0);  // Центр второй окружности

    //circle1
    let circle1 = BABYLON.MeshBuilder.CreateDisc("circle1", { radius: R1, tessellation: TESSELLATION }, scene);
    circle1.position = O1;
    const mat1 = new BABYLON.StandardMaterial("mat1", scene);
    mat1.diffuseColor = new BABYLON.Color3(0.514, 0.008, 0.133);
    mat1.alpha = 0.8;
    circle1.material = mat1;

    //circle2
    let circle2 = BABYLON.MeshBuilder.CreateDisc("circl2", { radius: R2, tessellation: TESSELLATION }, scene);
    circle2.position = O2;
    const mat2 = new BABYLON.StandardMaterial("mat2", scene);
    mat2.diffuseColor = new BABYLON.Color3(0.514, 0.008, 0.133);
    mat2.alpha = 0.8;
    circle2.material = mat2;

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