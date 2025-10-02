const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);


const dataBtn = document.querySelector("#dataBtn");
const inputRadius1 = document.querySelector("#inputRadius1");
const inputRadius2 = document.querySelector("#inputRadius2");
const inputDistance = document.querySelector("#inputDistance");

//Глобальные переменные (необходимы для области видимости)
let scene;
const TESSELLATION = 128;
R1 = 2.0; // Радиус первой окружности
R2 = 1.5; // Радиус второй окружности
L = 2.75; // Растояние по X между окружностями
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
let linePoints;
let normLinePoints;


const createScene = function () {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.953, 0.957, 0.965);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 1;

    // объявление переменных
    
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
    linePoints = [O1, A, O2, B, O1, O2]; //Соединяем здесь линии
    line = BABYLON.MeshBuilder.CreateLines("triangles", { points: linePoints, updatable: true }, scene);
    
    lineMaterial = new BABYLON.StandardMaterial("lineMat", scene);
    lineMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    normLinePoints = [A, B];
    normLine = BABYLON.MeshBuilder.CreateLines("norm", { points: normLinePoints, updatable: true }, scene);
    normLine.diffuseColor = new BABYLON.Color3(1, 1, 1);

    return scene;
};

const updateLines = function () {
    // Обновляем линии - старую удаляем, создаем новую
    line.dispose(); // Удаляем старую линию
    linePoints = [O1, A, O2, B, O1, O2]; // Новый массив точек
    line = BABYLON.MeshBuilder.CreateLines("triangles", { points: linePoints }, scene);
    line.diffuseColor = new BABYLON.Color3(1, 1, 1);

    normLine.dispose();
    normLinePoints = [A, B];
    normLine = BABYLON.MeshBuilder.CreateLines("norm", { points: normLinePoints }, scene);
    normLine.diffuseColor = new BABYLON.Color3(1, 1, 1);
}

const getUpdate = function () {
    // Получаем новые значения из полей ввода
    let oldR1 = R1;
    let oldR2 = R2
    let oldL = L;

    R1 = parseFloat(document.getElementById("inputRadius1").value) || 0;
    R2 = parseFloat(document.getElementById("inputRadius2").value) || 0;
    L = parseFloat(document.getElementById("inputDistance").value) || 0;
    O2 = new BABYLON.Vector3(L, -1, 0);

    // Animation parameters
    const frameRate = 30; // frames per second
    const duration = 1.0; // seconds
    const totalFrames = frameRate * duration;

    
    // Animate circle2 position
    if(oldL != L){
        BABYLON.Animation.CreateAndStartAnimation(
            "circle2Anim",
            circle2,
            "position",
            frameRate,
            totalFrames,
            circle2.position.clone(),
            O2,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    // Also animate the scaling if radii are changing
    if (oldR1 !== R1 || oldR2 !== R2) {
        const targetScale1 = R1 / 2.0;
        const targetScale2 = R2 / 1.5;
        
        // Animate circle1 scaling
        BABYLON.Animation.CreateAndStartAnimation(
            "circle1ScaleAnim",
            circle1,
            "scaling",
            frameRate,
            totalFrames,
            circle1.scaling.clone(),
            new BABYLON.Vector3(targetScale1, targetScale1, targetScale1),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // Animate circle2 scaling
        BABYLON.Animation.CreateAndStartAnimation(
            "circle2ScaleAnim",
            circle2,
            "scaling",
            frameRate,
            totalFrames,
            circle2.scaling.clone(),
            new BABYLON.Vector3(targetScale2, targetScale2, targetScale2),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    }

    // 3. Пересчитываем геометрию пересечения
    doMath();

    updateLines();
}

const doMath = function () {

    distance = Math.sqrt(Math.pow((O2.x - O1.x), 2)
        + Math.pow((O2.y - O1.y), 2) + Math.pow((O2.z - O2.z), 2)
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

dataBtn.addEventListener('click', getUpdate);

//render loop
engine.runRenderLoop(function () {
    scene.render();
});

//catch resize
window.addEventListener("resize", function () {
    engine.resize();
});