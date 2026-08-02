// main.js

import { 
    createSvgBoard, 
    updateBoardElement, 
    getBoardCorners 
} from './board.js';
import { hasCollision } from './collision.js';
import { setupUI, updateStats, setupScrollbar, updateLogVolumeUI } from './ui.js';
import menu from './menu/menu.js';
// import { initPilovnik } from './pilov/pilov.js';
// import { initRaschet } from './raschet/raschet.js';



// Инициализация
const svg = document.getElementById("circleSvg");
const boardsLayer = document.getElementById("boardsLayer");
const boardList = document.getElementById("boardList");

let diameter = 320;
const padding = 20;
let gap = 4;
let boards = [];
let activeBoard = null;
let lastPointer = null;
let animationFrame = null;

// Настройка UI
setupUI();
setupScrollbar();

// Обновление размера круга
function updateCircleSize() {
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
    circle.setAttribute("r", radius);

    document.getElementById("diameterDisplay").textContent = diameter;
}

updateCircleSize();
updateLogVolumeUI(diameter); 

// Mouse to SVG координаты
function mouseToSvg(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const svgPoint = point.matrixTransform(
        svg.getScreenCTM().inverse()
    );

    return { x: svgPoint.x, y: svgPoint.y };
}

// Добавление событий для доски
function addBoardEvents(board) {
    board.group.addEventListener("pointerdown", e => {
        if (e.target.closest('.rotateButton') || e.target.closest('.removeButton')) {
            return;
        }
        e.stopPropagation();
        activeBoard = board;
        svg.setPointerCapture(e.pointerId);
    });

    board.rotateButton.addEventListener("pointerdown", e => {
        e.stopPropagation();
        board.angle += 90;
        updateBoardElement(board);

        const collision = hasCollision(board, boards, getBoardCorners, gap);
        board.group.classList.toggle("collision", collision);
    });

    board.removeButton.addEventListener("pointerdown", e => {
        e.stopPropagation();
        board.group.remove();
        boards = boards.filter(b => b !== board);
        if (activeBoard === board) activeBoard = null;
        updateStats(boards, diameter);
    });
}

// Перемещение доски
function moveBoard(x, y) {
    if (!activeBoard) return;

    activeBoard.x = x;
    activeBoard.y = y;

    const collision = hasCollision(activeBoard, boards, getBoardCorners, gap);
    updateBoardElement(activeBoard);
    activeBoard.group.classList.toggle("collision", collision);
}

// Создание доски из шаблона
function createBoardFromTemplate(width, thickness) {
    const board = createSvgBoard(width, thickness, 0, 0, boardsLayer);
    boards.push(board);
    addBoardEvents(board);
    return board;
}
// Обработчики для создания досок
// Переменные для Long Press
let longPressTimer = null;
let isLongPressTriggered = false;
let isPointerDown = false;
let pressStartX = 0;
let pressStartY = 0;
const LONG_PRESS_DELAY = 350; // 500ms для долгого нажатия
const MOVE_THRESHOLD = 10; // пикселей, чтобы отменить long press при движении

// Функция для создания доски и начала drag
function startBoardDrag(item, event) {
    const width = Number(item.dataset.width);
    const thickness = Number(item.dataset.thickness);

    activeBoard = createBoardFromTemplate(width, thickness, true);
    const pos = mouseToSvg(event);
    moveBoard(pos.x, pos.y);
    svg.setPointerCapture(event.pointerId);
}

document.querySelectorAll(".board-item").forEach(item => {
    // item.addEventListener("pointerdown", e => {
    //     const width = Number(item.dataset.width);
    //     const thickness = Number(item.dataset.thickness);

    //     activeBoard = createBoardFromTemplate(width, thickness);
    //     const pos = mouseToSvg(e);
    //     moveBoard(pos.x, pos.y);
    //     svg.setPointerCapture(e.pointerId);
    //     console.log("dosla")
    // });

        // Событие pointerdown - начало касания/клика
    item.addEventListener("pointerdown", e => {
        // Запоминаем позицию начала
        pressStartX = e.clientX;
        pressStartY = e.clientY;
        isPointerDown = true;
        isLongPressTriggered = false;
        
        // Очищаем предыдущий таймер
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        // Устанавливаем таймер для долгого нажатия
        longPressTimer = setTimeout(() => {
            if (isPointerDown && !isLongPressTriggered) {
                // Сработало долгое нажатие!
                isLongPressTriggered = true;
                
                // Визуальный фидбек
                item.style.transform = 'scale(0.95)';
                item.style.transition = 'transform 0.1s';
                
                // Создаем доску и начинаем drag
                startBoardDrag(item, e);
                
                // Убираем визуальный фидбек
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 200);
                
                console.log("Long press triggered!");
            }
        }, LONG_PRESS_DELAY);
    });

    // Событие pointermove - отслеживаем движение
    item.addEventListener("pointermove", e => {
        if (!isPointerDown) return;
        
        // Если палец/мышь сильно сдвинулись - отменяем long press
        const deltaX = Math.abs(e.clientX - pressStartX);
        const deltaY = Math.abs(e.clientY - pressStartY);
        
        if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
            // Пользователь двигает, это не долгое нажатие
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            // Если уже было долгое нажатие, то продолжаем drag
            if (isLongPressTriggered && activeBoard) {
                const pos = mouseToSvg(e);
                moveBoard(pos.x, pos.y);
            }
        }
    });

    // Событие pointerup - отпускание
    item.addEventListener("pointerup", e => {
        // Очищаем таймер
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        isPointerDown = false;
        
        // Если долгое нажатие не сработало и движение было минимальным - это клик
        const deltaX = Math.abs(e.clientX - pressStartX);
        const deltaY = Math.abs(e.clientY - pressStartY);
        
        if (!isLongPressTriggered && deltaX < 5 && deltaY < 5) {
            // Это был обычный клик - создаем доску мгновенно
            // console.log("Click - creating board immediately");
            // startBoardDrag(item, e);
            // Возвращаем элемент в нормальное состояние
            item.style.transform = 'scale(1)';
            return;
        }
        
        // Если был drag после long press - завершаем
        if (activeBoard && isLongPressTriggered) {
            const collision = hasCollision(activeBoard, boards, getBoardCorners, gap);
            activeBoard.group.classList.toggle("collision", collision);
            activeBoard = null;
            updateStats(boards, diameter);
        }
        
        isLongPressTriggered = false;
    });

    // Отмена при потере фокуса
    item.addEventListener("pointercancel", e => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        isPointerDown = false;
        isLongPressTriggered = false;
        
        if (activeBoard) {
            const collision = hasCollision(activeBoard, boards, getBoardCorners, gap);
            activeBoard.group.classList.toggle("collision", collision);
            activeBoard = null;
            updateStats(boards, diameter);
        }
    });
});

// Pointer события для SVG
svg.addEventListener("pointermove", e => {
    if (!activeBoard) return;

    lastPointer = mouseToSvg(e);

    if (!animationFrame) {
        animationFrame = requestAnimationFrame(() => {
            moveBoard(lastPointer.x, lastPointer.y);
            animationFrame = null;
        });
    }
});

svg.addEventListener("pointerup", e => {
    if (activeBoard) {
        const collision = hasCollision(activeBoard, boards, getBoardCorners, gap);
        activeBoard.group.classList.toggle("collision", collision);
    }
    activeBoard = null;
    updateStats(boards, diameter);
});

// Обработка настроек
document.getElementById("applySettings").addEventListener("click", () => {
    diameter = Number(document.getElementById("diameterInput").value);
    gap = Number(document.getElementById("gapInput").value);
    updateCircleSize();
    updateLogVolumeUI(diameter);
    // Обновляем коллизии для всех досок
    boards.forEach(board => {
        const collision = hasCollision(board, boards, getBoardCorners, gap);
        board.group.classList.toggle("collision", collision);
    });
    updateStats(boards, diameter);
});

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

// Начальное обновление статистики
updateStats(boards, diameter);
// initPilovnik()
// initRaschet()

// Подписаться на изменение страницы
menu.setOnPageChange((page) => {
    console.log('Страница изменена:', page);
    // Здесь можно добавить дополнительную логику
});

// Для доступа к меню из любого места
window.menu = menu;