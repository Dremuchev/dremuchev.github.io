'use strict';
const canvas = document.querySelector('#draw');
const ctx = canvas.getContext('2d');
let curves = [];
let brushWidth = 100;
let brushCount;
let color = 0;
let drawing = false;
let needsRepaint = false;
let isShift;

document.addEventListener('DOMContentLoaded', canvasSize);
document.addEventListener('dblclick', clearCanvas);

function clearCanvas() {
    curves = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    needsRepaint = true;
}

window.addEventListener('resize', () =>{
    canvasSize()
    clearCanvas();
});

function canvasSize() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
}

function getBrushSize() {
    if (brushWidth === 100) {
        brushCount = true;
    }

    if (brushWidth === 5) {
        brushCount = false;
    }

    return brushCount?  brushWidth-- :  brushWidth++;
}

function getHue() {
    if (isShift){
        return (color > 0 && color <= 359)? color-- : color = 359;
    } else {
        return (color <= 359)? color++ : color = 0;
    }
}

function smoothCurveBetween (p1, p2) {
    const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
    ctx.lineWidth = getBrushSize();
    ctx.strokeStyle =  `hsl(${getHue()}, 100%, 50%)`;
    ctx.quadraticCurveTo(...p1, ...cp);
}

function smoothCurve(points) {
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (points.length > 2) {
        for (let i = points.length - 2; i < points.length - 1; i++) {
            ctx.moveTo(...points[i]);
            smoothCurveBetween(points[i], points[i + 1]);
        }
        ctx.stroke();
    }
}

canvas.addEventListener("mousedown", event => {
    const curve = [];
    drawing = true;
    curve.push([event.offsetX, event.offsetY]);
    curves.push(curve);
    needsRepaint = true;
    if(event.shiftKey){
        isShift = true;
    }
});

canvas.addEventListener("mouseup", () => {
    curves = [];
    drawing = false;
});

canvas.addEventListener("mouseleave", () => {
    curves = [];
    drawing = false;
});

canvas.addEventListener("mousemove", event => {
    if (drawing) {
        if (event.shiftKey) {
            isShift = true;
        } else {
            isShift = false;
        }

        const point = [event.offsetX, event.offsetY]
        curves[curves.length - 1].push(point);
        needsRepaint = true;
    }
});

function repaint () {
    curves.forEach((curve) => smoothCurve(curve));
}

function tick () {
    if(needsRepaint) {
        repaint();
        needsRepaint = false;
    }
    window.requestAnimationFrame(tick);
}

tick();