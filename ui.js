// ui.js

import { createSvgBoard } from './board.js';

export function createBoardTemplate(width, thickness, boardList) {
    const div = document.createElement("div");
    div.className = "board-item";
    div.textContent = `${thickness}×${width} мм`;
    div.style.width = 240 + "px";
    div.style.height = 50 + "px";
    div.dataset.width = width;
    div.dataset.thickness = thickness;
    boardList.appendChild(div);
}

export function initializeBoardTemplates(boardList) {
    const templates = [
        [100,25], [120,25], [150,25], [200,25],
        [100,50], [120,50], [150,50], [200,50],
        [150,32], [150,40],
        [100,100], [150,100], [200,100],
        [150,150], [200,200]
    ];

    templates.forEach(([width, thickness]) => {
        createBoardTemplate(width, thickness, boardList);
    });
}

export function setupUI() {
    // Инициализация шаблонов досок
    const boardList = document.getElementById("boardList");
    initializeBoardTemplates(boardList);

    // Обработчики для кнопок примененения настроек
    document.getElementById("applySettings").addEventListener("click", () => {
        const diameter = Number(document.getElementById("diameterInput").value);
        const gap = Number(document.getElementById("gapInput").value);
        return { diameter, gap };
    })

    return { boardList };
}

export function updateStats(boards, diameter) {
    const countDisplay = document.getElementById('countDisplay');
    const diameterDisplay = document.getElementById('diameterDisplay');
    const efficiencyDisplay = document.getElementById('efficiencyDisplay');
    const boardsVolumeDisplay = document.getElementById('boardsVolumeDisplay');

    countDisplay.textContent = boards.length;
    diameterDisplay.textContent = diameter;
    efficiencyDisplay.textContent = calculateEfficiency(boards, diameter);
    // Объем всех досок
    const boardsVolume = calculateBoardsVolume(boards);
    boardsVolumeDisplay.textContent = boardsVolume.toFixed(3);
}

// Расчет объема бревна (цилиндр)
export function updateLogVolumeUI(diameter) {
    const logVolumeDisplay = document.getElementById('logVolumeDisplay');
    if (logVolumeDisplay) {
        const diameterM = diameter / 1000;
        const radius = diameterM / 2;
        const volume = Math.PI * radius * radius * 6; // 6 метров длина
        logVolumeDisplay.textContent = `(${volume.toFixed(3)} м³)`;
    }
}

// Расчет объема всех досок
function calculateBoardsVolume(boards) {
    let totalVolume = 0;
    
    boards.forEach(board => {
        // Переводим мм в метры
        const widthM = board.width / 1000;
        const thicknessM = board.thickness / 1000;
        const length = 6; // длина доски 6 метров
        
        // Объем одной доски
        const volume = widthM * thicknessM * length;
        totalVolume += volume;
    });
    
    return totalVolume;
}

function calculateEfficiency(boards, diameter) {
    let boardArea = 0;
    boards.forEach(board => {
        boardArea += board.width * board.thickness;
    });

    const circleArea = Math.PI * Math.pow(diameter / 2, 2);
    return (boardArea / circleArea * 100).toFixed(1);
}

export function setupScrollbar() {
    const list = document.getElementById("boardList");
    const scrollZone = document.querySelector(".scroll-zone");
    const thumb = document.querySelector(".scroll-thumb");

    let scrollDragging = false;
    let scrollStartY = 0;
    let scrollStartTop = 0;

    function updateScrollThumb() {
        const visible = list.clientHeight;
        const total = list.scrollHeight;

        if(total <= visible) {
            thumb.style.display = "none";
            return;
        }

        thumb.style.display = "block";
        const ratio = visible / total;
        const height = Math.max(ratio * visible, 40);
        thumb.style.height = height + "px";

        const maxThumbMove = visible - height;
        const maxScroll = total - visible;
        const y = list.scrollTop / maxScroll * maxThumbMove;
        thumb.style.transform = `translateY(${y}px)`;
    }

    list.addEventListener("scroll", updateScrollThumb);
    window.addEventListener("resize", updateScrollThumb);

    scrollZone.addEventListener("pointerdown", e => {
        scrollDragging = true;
        scrollStartY = e.clientY;
        scrollStartTop = list.scrollTop;
        thumb.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    document.addEventListener("pointermove", e => {
        if(!scrollDragging) return;
        const dy = e.clientY - scrollStartY;
        const maxScroll = list.scrollHeight - list.clientHeight;
        const maxThumbMove = list.clientHeight - thumb.offsetHeight;
        const scrollDelta = dy * (maxScroll / maxThumbMove);
        list.scrollTop = scrollStartTop + scrollDelta;
    });

    document.addEventListener("pointerup", () => {
        scrollDragging = false;
    });

    scrollZone.addEventListener("pointerdown", e => {
        if(e.target !== thumb) {
            const rect = scrollZone.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            list.scrollTop = clickY / rect.height * list.scrollHeight;
        }
    });

    updateScrollThumb();
}