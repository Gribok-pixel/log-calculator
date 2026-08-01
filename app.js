const svg = document.getElementById("circleSvg");

let diameter = 320;
const padding = 20;

svg.setAttribute(
    "viewBox",
    `${-diameter/2 - padding} 
     ${-diameter/2 - padding} 
     ${diameter + padding*2} 
     ${diameter + padding*2}`
);

const boardList = document.getElementById("boardList");

function updateCircleSize(){

    const radius = diameter / 2;

    svg.setAttribute(
        "viewBox",
        `
        ${-radius - padding}
        ${-radius - padding}
        ${diameter + padding*2}
        ${diameter + padding*2}
        `
    );

    const circle = document.getElementById("logCircle");

    circle.setAttribute("r",radius);

    document.getElementById(
        "diameterDisplay"
    ).textContent = diameter;
}

function createBoardTemplate(width, thickness){
    const div = document.createElement("div");

    div.className = "board-item";
    div.textContent = `${thickness}×${width} мм`;

    const scale = 2;

    div.style.width = 240 + "px";
    div.style.height = 50 + "px";
    // div.style.width = width * scale + "px";
    // div.style.height = thickness * scale + "px";

    // сохраняем размеры
    div.dataset.width = width;
    div.dataset.thickness = thickness;

    boardList.appendChild(div);
}


// создаем одну доску
createBoardTemplate(100,25);
createBoardTemplate(120,25);
createBoardTemplate(150,25);
createBoardTemplate(200,25);

createBoardTemplate(100,50);
createBoardTemplate(120,50);
createBoardTemplate(150,50);
createBoardTemplate(200,50);

createBoardTemplate(150,32);

createBoardTemplate(150,40);

createBoardTemplate(100,100);
createBoardTemplate(150,100);
createBoardTemplate(200,100);

createBoardTemplate(150,150);

createBoardTemplate(200,200);

const boardsLayer = document.getElementById("boardsLayer");
let boards = [];
let activeBoard = null;
let gap = 4;

function updateBoardElement(board){
    board.group.setAttribute(
        "transform",
        `translate(${board.x} ${board.y}) rotate(${board.angle})`
    );
    board.rect.setAttribute("x",-board.width/2);
    board.rect.setAttribute("y",-board.thickness/2);
    board.label.setAttribute("x",0);
    board.label.setAttribute("y",0);
}

function createIconButton({className, path, x, y, scale}) {
    const button = document.createElementNS("http://www.w3.org/2000/svg","g");

    button.classList.add(className);

    const hit = document.createElementNS("http://www.w3.org/2000/svg","rect");

    hit.setAttribute("x", -1);
    hit.setAttribute("y", -1);
    hit.setAttribute("width", 18);
    hit.setAttribute("height", 18);
    hit.setAttribute("fill", "transparent");

    const icon = document.createElementNS("http://www.w3.org/2000/svg","path");

    icon.setAttribute("d", path);
    icon.setAttribute("transform",`scale(${scale})`);

    button.setAttribute("transform",`translate(${x} ${y})`);

    button.append(hit, icon);

    return button;
}

function createSvgBoard(width, thickness, x = 0, y = 0){
    const group = document.createElementNS("http://www.w3.org/2000/svg","g");

    group.classList.add("boardObject");

    const rect = document.createElementNS("http://www.w3.org/2000/svg","rect");

    rect.classList.add("board");

    rect.setAttribute("width",width);
    rect.setAttribute("height",thickness);

    group.appendChild(rect);

    const label = document.createElementNS("http://www.w3.org/2000/svg","text");
    label.classList.add("boardLabel");
    label.textContent = `${thickness}×${width}`;
    label.setAttribute("text-anchor","middle");
    label.setAttribute("dominant-baseline","middle");
    group.appendChild(label);

    const PAD = 6;
    const ICON = 8;
    const left   = -width / 2;
    const right  =  width / 2;
    const top    = -thickness / 2;
    const bottom =  thickness / 2;
    console.log("left: " + left)
    console.log("right: " + right)
    console.log("top: " + top)
    console.log("bottom: " + bottom)

    const rotate = createIconButton({
        className: "rotateButton",
        path: "M246.868 319.998q27.587 0 41.736 15.982q13.64 15.473 13.64 45.502q0 28.91-10.281 50.898q-10.281 21.886-30.335 30.946q-13.335 6.006-33.287 6.006q-11.809 0-26.365-2.545l3.156-26.772q12.52 3.867 22.903 3.868q19.545 0 29.928-12.623q8.348-10.077 9.467-25.449q-13.54 12.623-31.556 12.623q-20.868 0-32.778-12.724Q192 393.698 192 371.914q0-23.21 12.724-36.443q14.862-15.473 42.144-15.473m137.799-.206q32.981 0 46.927 25.245q9.365 17.102 9.365 49.472q0 35.425-11.502 52.832q-14.354 21.784-44.79 21.784q-32.88 0-46.928-25.245q-9.365-17-9.365-50.287q0-34.61 11.503-52.017q14.354-21.784 44.79-21.784m0 25.449q-12.114 0-17.967 11.91t-5.853 36.748q0 25.754 5.7 37.562q5.904 12.216 18.12 12.215q12.215 0 18.017-11.96q5.803-11.96 5.803-37.207q0-25.347-5.599-37.053q-5.904-12.215-18.221-12.215m-138.003-.608q-10.485 0-16.44 6.871t-5.955 18.883q0 11.095 5.65 17.203q5.649 6.108 15.931 6.108q11.706 0 18.526-8.042q5.395-6.312 5.395-15.88q0-12.012-6.107-18.425q-6.312-6.718-17-6.718m158.86-302.14v127.999h-128v-42.666l53.095-.017a129 129 0 0 0-4.748-5.007c-49.987-49.987-131.032-49.987-181.019 0c-49.896 49.896-49.987 130.738-.272 180.747l-30.169 30.171l-3.43-3.545c-62.924-66.896-61.69-172.151 3.701-237.543c66.65-66.65 174.71-66.65 241.359 0a173 173 0 0 1 6.843 7.247l-.027-57.387z",
        x: -right + ICON - PAD,
        y: top + ICON - PAD + 1,
        scale: 0.03
    });

    group.appendChild(rotate);

    const remove = createIconButton({
        className: "removeButton",
        path: "M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z",
        x: right - ICON - PAD -2,
        y: top + ICON - PAD,
        scale: 0.6
    });

    group.appendChild(remove);

    boardsLayer.appendChild(group);

    const board = {
        id:Date.now(),
        width,
        thickness,
        x,
        y,
        angle:0,
        group,
        rect,
        label,
        rotateButton:rotate,
        removeButton: remove
    };

    boards.push(board);

    updateBoardElement(board);

    addBoardEvents(board);

    return board;
}


function mouseToSvg(event){
    const point =
        circleSvg.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    const svgPoint =
        point.matrixTransform(
            circleSvg
            .getScreenCTM()
            .inverse()
        );

    return {
        x: svgPoint.x,
        y: svgPoint.y
    };
}


document.querySelectorAll(".board-item").forEach(item => {
    item.addEventListener("pointerdown", e => {
        const width = Number(item.dataset.width);
        const thickness = Number(item.dataset.thickness);

        activeBoard = createSvgBoard(width,thickness);
        dragData = {
            width,
            thickness
        };

        const pos = mouseToSvg(e);

        moveBoard(pos.x,pos.y);

        circleSvg.setPointerCapture(e.pointerId);
    });
});


function moveBoard(x,y){
    if(!activeBoard)
        return;

    activeBoard.x = x;
    activeBoard.y = y;

    const collision = hasCollision(activeBoard);

    updateBoardElement(activeBoard);

    activeBoard.group.classList.toggle("collision",collision);
}

function addBoardEvents(board){
    board.group.addEventListener("pointerdown", e => {
        if (e.target.closest('.rotateButton') || e.target.closest('.removeButton')) {
            return;
        }
        e.stopPropagation();

        activeBoard = board;

        circleSvg.setPointerCapture(e.pointerId);
    });

    board.rotateButton.addEventListener("pointerdown", e => {
        e.stopPropagation();

        board.angle += 90;

        updateBoardElement(board);

        const collision = hasCollision(board);
        board.group.classList.toggle("collision", collision);
    });

    board.removeButton.addEventListener("pointerdown", e => {
        e.stopPropagation();

        board.group.remove();

        boards = boards.filter(b => b !== board);

        if (activeBoard === board)
            activeBoard = null;
    });
}

// circleSvg.addEventListener("pointermove", e => {
//     if(!activeBoard)
//         return;

//     const pos =
//         mouseToSvg(e);

//     moveBoard(
//         pos.x,
//         pos.y
//     );
// });
let lastPointer = null;
let animationFrame = null;

circleSvg.addEventListener("pointermove", e => {
    if (!activeBoard)
        return;

    lastPointer = mouseToSvg(e);

    if (!animationFrame) {
        animationFrame = requestAnimationFrame(() => {
            moveBoard(lastPointer.x,lastPointer.y);
            animationFrame = null;
        });
    }
});


circleSvg.addEventListener("pointerup", e=> {
    // activeBoard = null;
    // dragData = null;
    if(activeBoard){
        const collision = hasCollision(activeBoard);
        activeBoard.group.classList.toggle("collision",collision);
    }
    activeBoard = null;

    updateStats();
});

function calculateEfficiency(){
    let boardArea = 0;

    boards.forEach(board => {
        boardArea += board.width * board.thickness;
    });


    const circleArea = Math.PI * Math.pow(diameter / 2, 2);


    return (
        boardArea /
        circleArea *
        100
    ).toFixed(1);
}

function updateStats(){
    countDisplay.textContent = boards.length

    diameterDisplay.textContent = diameter;

    efficiencyDisplay.textContent = calculateEfficiency();
}


function getBoardCorners(board) {
    const a = board.angle * Math.PI / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);

    const hw = board.width / 2 + gap / 2;
    const hh = board.thickness / 2 + gap / 2;

    const pts = [
        { x: -hw, y: -hh },
        { x:  hw, y: -hh },
        { x:  hw, y:  hh },
        { x: -hw, y:  hh }
    ];

    return pts.map(p => ({
        x: board.x + p.x * c - p.y * s,
        y: board.y + p.x * s + p.y * c
    }));
}

function project(points, axis) {
    let min = Infinity;
    let max = -Infinity;

    for (const p of points) {
        const d = p.x * axis.x + p.y * axis.y;
        min = Math.min(min, d);
        max = Math.max(max, d);
    }

    return { min, max };
}

function overlap(a, b) {
    return a.max >= b.min && b.max >= a.min;
}

function polygonsIntersect(a, b) {
    const axes = [];

    [a, b].forEach(poly => {
        for (let i = 0; i < 4; i++) {
            const p1 = poly[i];
            const p2 = poly[(i + 1) % 4];
            const edge = {
                x: p2.x - p1.x,
                y: p2.y - p1.y
            };
            const len = Math.hypot(edge.x, edge.y);
            axes.push({
                x: -edge.y / len,
                y: edge.x / len
            });
        }
    });

    for (const axis of axes) {
        const p1 = project(a, axis);
        const p2 = project(b, axis);

        if (!overlap(p1, p2))
            return false;
    }

    return true;
}

function hasCollision(board) {
    const current = getBoardCorners(board);

    for (const other of boards) {
        if (other === board)
            continue;
        if (polygonsIntersect(current, getBoardCorners(other)))
            return true;
    }

    return false;
}


document.getElementById("applySettings").addEventListener("click", () => {
    diameter = Number(document.getElementById("diameterInput").value);
    gap = Number(document.getElementById("gapInput").value);

    updateCircleSize();
});



// Scrollbar for boards-list
const list = document.getElementById("boardList");
const scrollZone = document.querySelector(".scroll-zone");
const thumb = document.querySelector(".scroll-thumb");

let scrollDragging = false;
let scrollStartY = 0;
let scrollStartTop = 0;

function updateScrollThumb(){

    const visible =
        list.clientHeight;

    const total =
        list.scrollHeight;


    if(total <= visible){
        thumb.style.display = "none";
        return;
    }


    thumb.style.display = "block";


    const ratio =
        visible / total;


    const height =
        Math.max(
            ratio * visible,
            40
        );


    thumb.style.height =
        height + "px";


    const maxThumbMove =
        visible - height;


    const maxScroll =
        total - visible;


    const y =
        list.scrollTop /
        maxScroll *
        maxThumbMove;


    thumb.style.transform =
        `translateY(${y}px)`;
}

list.addEventListener(
    "scroll",
    updateScrollThumb
);

window.addEventListener(
    "resize",
    updateScrollThumb
);

scrollZone.addEventListener(
    "pointerdown",
    e => {

        scrollDragging = true;

        scrollStartY = e.clientY;

        scrollStartTop = list.scrollTop;


        thumb.setPointerCapture(
            e.pointerId
        );

        e.preventDefault();
    }
);

document.addEventListener(
    "pointermove",
    e => {

        if(!scrollDragging)
            return;


        const dy =
            e.clientY - scrollStartY;


        const maxScroll =
            list.scrollHeight -
            list.clientHeight;


        const maxThumbMove =
            list.clientHeight -
            thumb.offsetHeight;


        const scrollDelta =
            dy *
            (maxScroll / maxThumbMove);


        list.scrollTop =
            scrollStartTop + scrollDelta;

    }
);

document.addEventListener(
    "pointerup",
    () => {

        scrollDragging = false;

    }
);

scrollZone.addEventListener("pointerdown", e => {
    if(e.target !== thumb) {
        const rect = scrollZone.getBoundingClientRect();

        const clickY = e.clientY - rect.top;

        list.scrollTop =
            clickY / rect.height * list.scrollHeight;
    }
});

updateScrollThumb();


if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("service-worker.js");

}