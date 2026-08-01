// board.js

export function createIconButton({className, path, x, y, scale}) {
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

export function createSvgBoard(width, thickness, x = 0, y = 0, boardsLayer, animate = true) {
    const group = document.createElementNS("http://www.w3.org/2000/svg","g");
    group.classList.add("boardObject");

    // Добавляем класс для анимации
    if (animate) {
        group.classList.add("board-appearing");
    }

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

    const rotate = createIconButton({
        className: "rotateButton",
        path: "M246.868 319.998q27.587 0 41.736 15.982q13.64 15.473 13.64 45.502q0 28.91-10.281 50.898q-10.281 21.886-30.335 30.946q-13.335 6.006-33.287 6.006q-11.809 0-26.365-2.545l3.156-26.772q12.52 3.867 22.903 3.868q19.545 0 29.928-12.623q8.348-10.077 9.467-25.449q-13.54 12.623-31.556 12.623q-20.868 0-32.778-12.724Q192 393.698 192 371.914q0-23.21 12.724-36.443q14.862-15.473 42.144-15.473m137.799-.206q32.981 0 46.927 25.245q9.365 17.102 9.365 49.472q0 35.425-11.502 52.832q-14.354 21.784-44.79 21.784q-32.88 0-46.928-25.245q-9.365-17-9.365-50.287q0-34.61 11.503-52.017q14.354-21.784 44.79-21.784m0 25.449q-12.114 0-17.967 11.91t-5.853 36.748q0 25.754 5.7 37.562q5.904 12.216 18.12 12.215q12.215 0 18.017-11.96q5.803-11.96 5.803-37.207q0-25.347-5.599-37.053q-5.904-12.215-18.221-12.215m-138.003-.608q-10.485 0-16.44 6.871t-5.955 18.883q0 11.095 5.65 17.203q5.649 6.108 15.931 6.108q11.706 0 18.526-8.042q5.395-6.312 5.395-15.88q0-12.012-6.107-18.425q-6.312-6.718-17-6.718m158.86-302.14v127.999h-128v-42.666l53.095-.017a129 129 0 0 0-4.748-5.007c-49.987-49.987-131.032-49.987-181.019 0c-49.896 49.896-49.987 130.738-.272 180.747l-30.169 30.171l-3.43-3.545c-62.924-66.896-61.69-172.151 3.701-237.543c66.65-66.65 174.71-66.65 241.359 0a173 173 0 0 1 6.843 7.247l-.027-57.387z",
        x: -right + ICON - PAD,
        y: top + ICON - PAD + 1,
        scale: 0.04
    });
    group.appendChild(rotate);

    const remove = createIconButton({
        className: "removeButton",
        path: "M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z",
        x: right - ICON - PAD -2,
        y: top + ICON - PAD,
        scale: 0.7
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

    updateBoardElement(board);

    return board;
}

export function updateBoardElement(board){
    board.group.setAttribute(
        "transform",
        `translate(${board.x} ${board.y}) rotate(${board.angle})`
    );
    board.rect.setAttribute("x",-board.width/2);
    board.rect.setAttribute("y",-board.thickness/2);
    board.label.setAttribute("x",0);
    board.label.setAttribute("y",0);
}

export function getBoardCorners(board, gap) {
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