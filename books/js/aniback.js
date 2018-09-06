'use strict';
const canvas = document.getElementById('wall');
const ctx = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
ctx.strokeStyle = '#fff';
const curves = [];

function getCross(x, y, size, angle) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 5 * size;
    size = 20 * size;
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(angle);
    ctx.translate(- (x + size / 2), - (y + size / 2));
    ctx.moveTo(x + size / 2, y);
    ctx.lineTo(x + size / 2, y + size);
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size, y + size / 2);
    ctx.stroke();
    ctx.restore();
}

function getCircle(x, y, size) {
    ctx.beginPath();
    ctx.lineWidth = 5 * size;
    size = 12 * size;
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
    ctx.stroke();
}

function createObjects() {
    const quanity = getRandom(50, 200);
    for (let i = 0; i < quanity; i++) {
        const item = {};
        item.nextPoint = getTimeFunc();
        item.x = getRandom(5, canvas.width - 5);
        item.y = getRandom(5, canvas.height - 5);
        item.size = getRandom(0.1, 0.6, 2);
        if (i < quanity / 2) {
            item.func = getCross;
            item.type = 'cross';
            item.stepAngle = getRandom(0, 1) ? getRandom(0, 0.2, 2) : getRandom(0, 0.2, 2) * -1;
            item.currentAngle = 0;
        } else {
            item.func = getCircle;
            item.type = 'circle';
        }
        curves.push(item);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    curves.forEach(item => {
        const coords = item.nextPoint(item.x, item.y, Date.now());
        item.func(coords.x, coords.y, item.size, item.currentAngle += item.stepAngle);
        if (item.currentAngle >= 2 * Math.PI || item.currentAngle <= -2 * Math.PI)
            item.currentAngle = 0;
    });
}

function getTimeFunc() {
    let value = getRandom(0, 1);
    if (value === 0) {
        return function (x, y, time) {
            return {
                x: x + Math.sin((50 + x + (time / 10)) / 100) * 3,
                y: y + Math.sin((45 + x + (time / 10)) / 100) * 4
            };
        }
    } else {
        return function (x, y, time) {
            return {
                x: x + Math.sin((x + (time / 10)) / 100) * 5,
                y: y + Math.sin((10 + x + (time / 10)) / 100) * 2
            }
        }
    }
}

function getRandom(min, max, digits = 0) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(digits));
}

createObjects();

let frameCount = 0;

function tick() {
    if (frameCount === 3) {
        animate();
        frameCount = 0;
    }
    frameCount++;
    requestAnimationFrame(tick);
}

tick();