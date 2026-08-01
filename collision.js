// collision.js

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

export function hasCollision(board, boards, getBoardCorners, gap) {
    const current = getBoardCorners(board, gap);

    for (const other of boards) {
        if (other === board)
            continue;
        if (polygonsIntersect(current, getBoardCorners(other, gap)))
            return true;
    }

    return false;
}