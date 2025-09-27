const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);


const dataBtn = document.querySelector("#dataBtn");
const inputRadius1 = document.querySelector("#inputRadius1");
const inputRadius2 = document.querySelector("#inputRadius2");
const inputDistance = document.querySelector("#inputDistance");

//Глобальные переменные (необходимы для области видимости)
let scene;
const TESSELLATION = 128;
let R1 = 2.0;
let R2 = 1.5;
let L = 2.75;
let line;
let lineMaterial;
let normLine;
let circle1;
let circle2;
let O1;
let O2;
let A;
let B;
let C;
let distance;
let a;
let h;
let dx;
let dy;
let length;
let dirX;
let dirY;
let perpX;
let perpY;


const createScene = function () {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.953, 0.957, 0.965);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 1;

    // объявление переменных
    R1 = 2.0; // Радиус первой окружности
    R2 = 1.5; // Радиус второй окружности
    L = 2.75;
    O1 = new BABYLON.Vector3(0, 0, 0); // Центр первой окружности
    O2 = new BABYLON.Vector3(L, -1, 0);  // Центр второй окружности

    //circle1
    circle1 = BABYLON.MeshBuilder.CreateDisc("circle1", { radius: R1, tessellation: TESSELLATION }, scene);
    circle1.position = O1;
    const material1 = new BABYLON.StandardMaterial("mat1", scene);
    material1.diffuseColor = new BABYLON.Color3(0.09, 0.51, 0.212);
    material1.alpha = 0.8;
    circle1.material = material1;

    //circle2
    circle2 = BABYLON.MeshBuilder.CreateDisc("circle2", { radius: R2, tessellation: TESSELLATION }, scene);
    circle2.position = O2;
    const material2 = new BABYLON.StandardMaterial("mat2", scene);
    material2.diffuseColor = new BABYLON.Color3(0.09, 0.51, 0.212);
    material2.alpha = 0.8;
    circle2.material = material2;

    //Считаем
    doMath();

    //lines
    const linePoints = [O1, A, O2, B, O1, O2]; //Соединяем здесь линии
    line = BABYLON.MeshBuilder.CreateLines("triangles", { points: linePoints }, scene);
    lineMaterial = new BABYLON.StandardMaterial("lineMat", scene);
    lineMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    const normLinePoints = [A, B];
    normLine = BABYLON.MeshBuilder.CreateLines("norm", { points: normLinePoints }, scene);
    normLine.diffuseColor = new BABYLON.Color3(1, 1, 1);

    return scene;
};

const updateScene = function () {
    // Получаем новые значения из полей ввода
    R1 = parseFloat(document.getElementById("inputRadius1").value) || 0;
    R2 = parseFloat(document.getElementById("inputRadius2").value) || 0;
    L = parseFloat(document.getElementById("inputDistance").value) || 0;

    // Обновляем центр второй окружности
    O2 = new BABYLON.Vector3(L, -1, 0);

    // 1. Обновляем первый диск (circle1) через scaling
    // Рассчитываем масштаб относительно исходного радиуса
    let scale1 = R1 / 2.0; // 2.0 - исходный радиус R1
    circle1.scaling = new BABYLON.Vector3(scale1, scale1, scale1);

    // 2. Обновляем второй диск (circle2)
    let scale2 = R2 / 1.5; // 1.5 - исходный радиус R2
    circle2.scaling = new BABYLON.Vector3(scale2, scale2, scale2);
    circle2.position = O2; // Обновляем позицию

    // 3. Пересчитываем геометрию пересечения
    doMath();

    // 4. Обновляем линии - старую удаляем, создаем новую
    line.dispose(); // Удаляем старую линию
    let newLinePoints = [O1, A, O2, B, O1, O2]; // Новый массив точек
    line = BABYLON.MeshBuilder.CreateLines("triangles", { points: newLinePoints }, scene);
    line.diffuseColor = new BABYLON.Color3(1, 1, 1);;

    normLine.dispose();
    let newNormLinePoints = [A, B];
    normLine = BABYLON.MeshBuilder.CreateLines("norm", { points: newNormLinePoints }, scene);
    normLine.diffuseColor = new BABYLON.Color3(1, 1, 1);;
}

const doMath = function () {
    //расстояние между центрами 
    distance = Math.sqrt(Math.pow((circle2.position.x - circle1.position.x), 2)
        + Math.pow((circle2.position.y - circle1.position.y), 2) + Math.pow((circle2.position.z - circle2.position.z), 2)
    );
    console.log("Расстояние между центрами окружностей: ", distance);

    //O1C = d1
    a = (Math.pow(R1, 2) - Math.pow(R2, 2) + Math.pow(distance, 2)) / (2 * distance);
    console.log("Расстояние от O1 до линии пересечения: ", a);

    //AC = h
    h = Math.sqrt(Math.pow(R1, 2) - Math.pow(a, 2));
    console.log("Высота h: ", h);

    //Находим точку C (основание перпендикуляра)
    C = new BABYLON.Vector3(
        O1.x + (a / distance) * (O2.x - O1.x),
        O1.y + (a / distance) * (O2.y - O1.y),
        0
    );
    console.log("Точка C (основание): ", C);

    //Находим единичный вектор направления O1O2
    dx = O2.x - O1.x;
    dy = O2.y - O1.y;
    length = Math.sqrt(dx * dx + dy * dy);
    dirX = dx / length;
    dirY = dy / length;

    //Перпендикулярный вектор (поворот на 90 градусов)
    perpX = -dirY;
    perpY = dirX;

    //Точки пересечения A и B
    A = new BABYLON.Vector3(
        C.x + h * perpX,
        C.y + h * perpY,
        0
    );
    console.log("Точка A: ", A);

    B = new BABYLON.Vector3(
        C.x - h * perpX,
        C.y - h * perpY,
        0
    );
    console.log("Точка B: ", B);
}

scene = createScene();

dataBtn.addEventListener('click', updateScene);

//render loop
engine.runRenderLoop(function () {
    scene.render();
});

//catch resize
window.addEventListener("resize", function () {
    engine.resize();
});