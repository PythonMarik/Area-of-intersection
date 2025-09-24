const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.282, 0.282, 0.282);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 1;

    // Константы
    const TESSELLATION = 64;
    const R1 = 2.0; // Радиус первой окружности
    const R2 = 1.5; // Радиус второй окружности
    const O1 = new BABYLON.Vector3(-3 / 2, 0, 0); // Центр первой окружности
    const O2 = new BABYLON.Vector3(2.5 / 2, -1, 0);  // Центр второй окружности
    console.log("Центр первой окружности:", O1);
    console.log("Центр второй окружности:", O2);

    //circle1
    let circle1 = BABYLON.MeshBuilder.CreateDisc("circle1", { radius: R1, tessellation: TESSELLATION }, scene);
    circle1.position = O1;
    const mat1 = new BABYLON.StandardMaterial("mat1", scene);
    mat1.diffuseColor = new BABYLON.Color3(0.031, 0.031, 0.031);
    mat1.alpha = 0.8;
    circle1.material = mat1;

    //circle2
    let circle2 = BABYLON.MeshBuilder.CreateDisc("circl2", { radius: R2, tessellation: TESSELLATION }, scene);
    circle2.position = O2;
    const mat2 = new BABYLON.StandardMaterial("mat2", scene);
    mat2.diffuseColor = new BABYLON.Color3(0.031, 0.031, 0.031);
    mat2.alpha = 0.8;
    circle2.material = mat2;

    //расстояние между центрами 
    var distance = Math.sqrt(Math.pow((circle2.position.x - circle1.position.x), 2)
        + Math.pow((circle2.position.y - circle1.position.y), 2) + Math.pow((circle2.position.z - circle2.position.z), 2)
    );
    console.log("Расстояние между центрами окружностей: ", distance);

    //O1C = d1
    var a = (Math.pow(R1, 2) - Math.pow(R2, 2) + Math.pow(distance, 2)) / (2 * distance);
    console.log("Расстояние от O1 до линии пересечения: ", a);

    //AC = h
    var h = Math.sqrt(Math.pow(R1, 2) - Math.pow(a, 2));
    console.log("Высота h: ", h);

    //O1C = d1
    var a = (Math.pow(R1, 2) - Math.pow(R2, 2) + Math.pow(distance, 2)) / (2 * distance);
    console.log("Расстояние от O1 до линии пересечения: ", a);

    //AC = h
    var h = Math.sqrt(Math.pow(R1, 2) - Math.pow(a, 2));
    console.log("Высота h: ", h);

    //Находим точку C (основание перпендикуляра)
    var C = new BABYLON.Vector3(
        O1.x + (a / distance) * (O2.x - O1.x),
        O1.y + (a / distance) * (O2.y - O1.y),
        0
    );
    console.log("Точка C (основание): ", C);

    //Находим единичный вектор направления O1O2
    var dx = O2.x - O1.x;
    var dy = O2.y - O1.y;
    var length = Math.sqrt(dx * dx + dy * dy);
    var dirX = dx / length;
    var dirY = dy / length;

    //Перпендикулярный вектор (поворот на 90 градусов)
    var perpX = -dirY;
    var perpY = dirX;

    //Точки пересечения A и B
    var A = new BABYLON.Vector3(
        C.x + h * perpX,
        C.y + h * perpY,
        0
    );
    console.log("Точка A: ", A);

    var B = new BABYLON.Vector3(
        C.x - h * perpX,
        C.y - h * perpY,
        0
    );
    console.log("Точка B: ", B);

    //lines
    const linePoints = [O1, A, O2, B, O1, O2]; //Соединяем здесь линии
    let line = BABYLON.MeshBuilder.CreateLines("triangles", { points: linePoints });
    const lineMaterial = new BABYLON.StandardMaterial("lineMat", scene);
    lineMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

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