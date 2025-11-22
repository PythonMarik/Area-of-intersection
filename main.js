const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const dataBtn = document.querySelector("#dataBtn");
const inputRadius1 = document.querySelector("#inputRadius1");
const inputRadius2 = document.querySelector("#inputRadius2");
const inputDistance = document.querySelector("#inputDistance");

//Глобальные переменные
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
let pointO1;
let pointO2;
let pointA;
let pointB;
let pointC;
let distance;
let a;
let h;

const THE_WORLD = 2500;
const EPS = 0.00001;

// Добавляем переменные для хранения меток
let labelO1, labelO2, labelA, labelB, labelC;
let ui;

let step = 1;

// CSS для формул
const addFormulaStyles = function () {
    if (document.getElementById('formula-styles')) return;

    const style = document.createElement('style');
    style.id = 'formula-styles';
    style.textContent = `
        .formula-container {
            padding: 12px !important;
            background: #f8f9fa !important;
            border-radius: 8px !important;
            border-left: 4px solid #007bff !important;
            margin: 5px 0 !important;
        }
        .formula {
            font-size: 16px !important;
            text-align: center !important;
            margin: 8px 0 !important;
            padding: 12px !important;
            background: white !important;
            border-radius: 6px !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            font-family: "Courier New", monospace !important;
            font-weight: bold !important;
            color: #2c3e50 !important;
            border: 1px solid #e9ecef !important;
        }
        .formula-description {
            font-size: 14px !important;
            color: #6c757d !important;
            font-style: italic !important;
            margin-top: 8px !important;
            text-align: center !important;
            padding: 0 10px !important;
        }
        .formula-cell {
            padding: 8px !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для добавления математической формулы в таблицу
const addFormulaInTable = function (formula, description = "") {
    const tbody = document.querySelector('.output tbody');
    const row = document.createElement('tr');

    const stepCell = document.createElement('td');
    stepCell.textContent = step;
    step++;

    const formulaCell = document.createElement('td');

    const container = document.createElement('div');
    container.className = 'formula-container';

    const formulaDiv = document.createElement('div');
    formulaDiv.className = 'formula';
    formulaDiv.textContent = formula;

    container.appendChild(formulaDiv);

    if (description) {
        const descDiv = document.createElement('div');
        descDiv.className = 'formula-description';
        descDiv.textContent = description;
        container.appendChild(descDiv);
    }

    formulaCell.appendChild(container);
    row.appendChild(stepCell);
    row.appendChild(formulaCell);
    tbody.appendChild(row);
};

const addTextInTable = function (text) {
    const tbody = document.querySelector('.output tbody');
    const row = document.createElement('tr');

    const stepCell = document.createElement('td');
    stepCell.textContent = step;
    step++;

    const textCell = document.createElement('td');
    textCell.textContent = text;

    row.appendChild(stepCell);
    row.appendChild(textCell);
    tbody.appendChild(row);
};

const addImgInTable = function (imageUrl) {
    const tbody = document.querySelector('.output tbody');
    const row = document.createElement('tr');

    const stepCell = document.createElement('td');
    stepCell.textContent = step;
    stepCell.style.padding = '12px';
    step++;

    const imgCell = document.createElement('td');
    imgCell.style.padding = '12px';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Image';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';

    imgCell.appendChild(img);
    row.appendChild(stepCell);
    row.appendChild(imgCell);
    tbody.appendChild(row);
}

const clearText = function () {
    const tbody = document.querySelector('.output tbody');
    tbody.innerHTML = '';
    step = 1;
}

// Функция doMath должна быть объявлена ДО ее использования
const doMath = function () {
    // Исправляем расчет расстояния
    const dx = O2.x - O1.x;
    const dy = O2.y - O1.y;
    distance = Math.sqrt(dx * dx + dy * dy);
    console.log("Расстояние между центрами окружностей: ", distance);

    // O1C = d1
    a = (Math.pow(R1, 2) - Math.pow(R2, 2) + Math.pow(distance, 2)) / (2 * distance);
    console.log("Расстояние от O1 до линии пересечения: ", a);

    // AC = h
    h = Math.sqrt(Math.pow(R1, 2) - Math.pow(a, 2));
    console.log("Высота h: ", h);

    // Находим точку C (основание перпендикуляра)
    C = new BABYLON.Vector3(
        O1.x + (a / distance) * (O2.x - O1.x),
        O1.y + (a / distance) * (O2.y - O1.y),
        0
    );
    console.log("Точка C (основание): ", C);

    // Находим единичный вектор направления O1O2
    const length = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / length;
    const dirY = dy / length;

    // Перпендикулярный вектор (поворот на 90 градусов)
    const perpX = -dirY;
    const perpY = dirX;

    // Точки пересечения A и B
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

// Функция для нахождения пересечения двух окружностей
const calculateIntersectionArea = function (R1, R2, distance) {

    // Просто отладочно проверить площади самих окружностей
    console.log("Площадь окружности O1: ", Math.PI * R1 * R1);
    console.log("Площадь окружности O2: ", Math.PI * R2 * R2);

    // Нет пересечения
    if (distance >= R1 + R2) {
        return 0;
    }

    // Одна окружность полностью внутри другой
    if (distance >= R1 + R2) {
        return 0;
    }

    // Для удобства перепишем опять уже известные переменные
    const d1 = a;
    const d2 = distance - d1;

    // Случай когда центр O2 совпадает с точкой C
    let alpha, beta;

    if (Math.abs(d2) < EPS) {
        alpha = Math.PI;
    }
    else {
        alpha = 2 * Math.atan(h / Math.abs(d2));

        // Если d2 отрицательное (O2 между O1 и C), прибавляем 2*Pi
        if (d2 < 0) {
            alpha += 2 * Math.PI;
        }
    }

    // Случай когда центр O1 совпадает с точкой C
    if (Math.abs(d1) < EPS) {
        beta = Math.PI;
    }
    else {
        beta = 2 * Math.atan(h / Math.abs(d1));

        if (d1 < 0) {
            beta += 2 * Math.PI;
        }
    }

    // Вычисляем площадь
    const S1 = 0.5 * Math.pow(R1, 2) * (beta - Math.sin(beta));
    console.log("Площадь сегмента S1: ", S1);
    const S2 = 0.5 * Math.pow(R2, 2) * (alpha - Math.sin(alpha));
    console.log("Площадь сегмента S2: ", S2);

    // Возращаем площадь пересечения
    return S1 + S2;
}

// Функция для обновления позиций меток
const updateLabels = function () {
    if (labelO1) labelO1.linkWithMesh(pointO1);
    if (labelO2) labelO2.linkWithMesh(pointO2);
    if (labelA) labelA.linkWithMesh(pointA);
    if (labelB) labelB.linkWithMesh(pointB);
    if (labelC) labelC.linkWithMesh(pointC);
}

const createScene = function () {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.953, 0.957, 0.965);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 1;

    // объявление переменных
    R1 = 2.0;
    R2 = 1.5;
    L = 2.75;
    O1 = new BABYLON.Vector3(0, 0, 0);
    O2 = new BABYLON.Vector3(L, -1, 0);

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

    //ui для букв
    ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    ui.renderAtIdealSize = true;
    ui.idealWidth = 1920;
    ui.idealHeight = 1080;
    ui.renderScale = 1.0;
    ui.idealCamera = camera;

    // Функция для добавления подписей
    function createLabel(mesh, text) {
        const label = new BABYLON.GUI.TextBlock();
        label.text = text;
        label.color = "white";
        label.fontSize = 32;
        label.outlineWidth = 4;
        label.outlineColor = "black";
        label.linkWithMesh(mesh);
        label.linkOffsetY = -30;
        ui.addControl(label);
        return label;
    }

    // Невидимые точки
    pointO1 = BABYLON.MeshBuilder.CreateSphere("O1_point", { diameter: 0.05 }, scene);
    pointO1.position = O1;
    pointO2 = BABYLON.MeshBuilder.CreateSphere("O2_point", { diameter: 0.05 }, scene);
    pointO2.position = O2;
    pointA = BABYLON.MeshBuilder.CreateSphere("A_point", { diameter: 0.05 }, scene);
    pointA.position = A;
    pointB = BABYLON.MeshBuilder.CreateSphere("B_point", { diameter: 0.05 }, scene);
    pointB.position = B;
    pointC = BABYLON.MeshBuilder.CreateSphere("C_point", { diameter: 0.05 }, scene);
    pointC.position = C;

    // Подписи
    labelO1 = createLabel(pointO1, "O₁");
    labelO2 = createLabel(pointO2, "O₂");
    labelA = createLabel(pointA, "A");
    labelB = createLabel(pointB, "B");
    labelC = createLabel(pointC, "C");

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
    R1 = parseFloat(document.getElementById("inputRadius1").value) || 2.0;
    R2 = parseFloat(document.getElementById("inputRadius2").value) || 1.5;
    L = parseFloat(document.getElementById("inputDistance").value) || 2.75;

    // Обновляем центр второй окружности
    O2 = new BABYLON.Vector3(L, -1, 0);

    // 1. Обновляем первый диск (circle1) через scaling
    let scale1 = R1 / 2.0;
    circle1.scaling = new BABYLON.Vector3(scale1, scale1, scale1);

    // 2. Обновляем второй диск (circle2)
    let scale2 = R2 / 1.5;
    circle2.scaling = new BABYLON.Vector3(scale2, scale2, scale2);
    circle2.position = O2;

    // Удаляем старые линии
    if (normLine) normLine.dispose();
    if (line) line.dispose();

    const createAndPlayAnimations = () => {
        const myAnim1 = new BABYLON.Animation(
            "circleAnimation1",
            "position.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames1 = [];
        keyFrames1.push({
            frame: 0,
            value: -L * 3 / 2
        });
        keyFrames1.push({
            frame: 45,
            value: -L
        });
        keyFrames1.push({
            frame: 90,
            value: 0
        });
        myAnim1.setKeys(keyFrames1);

        const myAnim2 = new BABYLON.Animation(
            "circleAnimation2",
            "position.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames2 = [];
        keyFrames2.push({
            frame: 0,
            value: L * 2
        });
        keyFrames2.push({
            frame: 45,
            value: L * 5 / 3
        });
        keyFrames2.push({
            frame: 90,
            value: L
        });
        myAnim2.setKeys(keyFrames2);

        const myAnim3empt = new BABYLON.Animation(
            "circleAnimation3",
            "position.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames3 = [];
        keyFrames3.push({
            frame: 0,
            value: circle1.position.x
        });
        myAnim3empt.setKeys(keyFrames3);

        const myAnim4empt = new BABYLON.Animation(
            "circleAnimation4",
            "position.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames4 = [];
        keyFrames4.push({
            frame: 0,
            value: circle1.position.x
        });
        myAnim4empt.setKeys(keyFrames4);

        const myAnim5empt = new BABYLON.Animation(
            "circleAnimation5",
            "position.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keyFrames5 = [];
        keyFrames5.push({
            frame: 0,
            value: circle1.position.x
        });
        myAnim5empt.setKeys(keyFrames5);

        // Используем AnimationGroup для контроля анимации
        const animGroup1 = new BABYLON.AnimationGroup("group1");
        animGroup1.addTargetedAnimation(myAnim1, circle1);

        const animGroup2 = new BABYLON.AnimationGroup("group2");
        animGroup2.addTargetedAnimation(myAnim2, circle2);

        const animGroup3 = new BABYLON.AnimationGroup("group3");
        animGroup3.addTargetedAnimation(myAnim3empt, circle1);

        const animGroup4 = new BABYLON.AnimationGroup("group4");
        animGroup4.addTargetedAnimation(myAnim4empt, circle1);

        const animGroup5 = new BABYLON.AnimationGroup("group5");
        animGroup5.addTargetedAnimation(myAnim5empt, circle1);

        // Последовательное выполнение анимаций с задержкой
        animGroup1.play();
        animGroup2.play();

        clearText();

        animGroup1.onAnimationEndObservable.add(() => {
            setTimeout(() => {
                // Пересчитываем геометрию пересечения
                doMath();

                // Обновляем позиции точек
                pointA.position = A;
                pointB.position = B;
                pointC.position = C;
                pointO2.position = O2;

                // Обновляем линии
                let newLinePoints = [O1, A, O2, B, O1, O2];
                line = BABYLON.MeshBuilder.CreateLines("triangles", { points: newLinePoints }, scene);
                line.diffuseColor = new BABYLON.Color3(1, 1, 1);

                let newNormLinePoints = [A, B];
                normLine = BABYLON.MeshBuilder.CreateLines("norm", { points: newNormLinePoints }, scene);
                normLine.diffuseColor = new BABYLON.Color3(1, 1, 1);

                // Обновляем метки
                updateLabels();

            }, THE_WORLD);
        });

        animGroup2.onAnimationEndObservable.add(() => {
            setTimeout(() => {
                addFormulaInTable(
                    "d = √[(x₂ - x₁)² + (y₂ - y₁)²]",
                    "Расстояние между центрами окружностей"
                );
                addTextInTable(`Расстояние между центрами: ${distance.toFixed(4)}`);
                animGroup3.play();
            }, THE_WORLD);
        });

        animGroup3.onAnimationEndObservable.add(() => {
            setTimeout(() => {
                addFormulaInTable(
                    "a = (R₁² - R₂² + d²) / 2d",
                    "Расстояние от O₁ до линии пересечения (точки C)"
                );
                addTextInTable("Расстояние O1C: " + a.toFixed(4));
                animGroup4.play();
            }, THE_WORLD);
        });

        animGroup4.onAnimationEndObservable.add(() => {
            setTimeout(() => {
                addFormulaInTable(
                    "h = √(R₁² - a²)",
                    "Высота от линии центров до точек пересечения"
                );
                addTextInTable("Высота h: " + h.toFixed(4));
                animGroup5.play();
            }, THE_WORLD);
        });

        animGroup5.onAnimationEndObservable.add(() => {
            setTimeout(() => {
                addTextInTable("Точки пересечения A(" + A.x.toFixed(4) + ", " + A.y.toFixed(4) + ") и B(" + B.x.toFixed(4) + ", " + B.y.toFixed(4) + ")");
            }, THE_WORLD);
        });

        animGroup5.onAnimationEndObservable.add(() => {
            setTimeout(() => {
                const d1 = a;
                const d2 = distance - d1;
                const intersectionArea = calculateIntersectionArea(R1, R2, distance);

                addTextInTable(`O₁C = ${d1.toFixed(4)}, O₂C = ${d2.toFixed(4)}, h = ${h.toFixed(4)}`);

                addFormulaInTable(
                    "α = 2 × arctan(h / O₂C), β = 2 × arctan(h / O₁C)",
                    "Углы сегментов окружностей"
                );
                addTextInTable(`β = ${(2 * Math.atan(h / d1)).toFixed(4)} рад, α = ${(2 * Math.atan(h / d2)).toFixed(4)} рад`);

                setTimeout(() => {
                    addFormulaInTable(
                        "S = 0.5R₁²(β - sinβ) + 0.5R₂²(α - sinα)",
                        "Площадь пересечения как сумма площадей сегментов"
                    );
                    addTextInTable(`Площадь пересечения окружностей = ${intersectionArea.toFixed(4)}`);

                    setTimeout(() => {
                        // Информация о типе пересечения
                        if (intersectionArea === 0) {
                            addTextInTable("Окружности не пересекаются");
                        } else if (intersectionArea === Math.PI * Math.min(R1, R2) * Math.min(R1, R2)) {
                            addTextInTable("Одна окружность полностью внутри другой");
                        } else {
                            addTextInTable("Окружности пересекаются в двух точках");
                        }
                    }, THE_WORLD);

                }, THE_WORLD);

            }, THE_WORLD);
        });
    };

    createAndPlayAnimations();
}

addFormulaStyles(); // Добавляем стили при загрузке
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