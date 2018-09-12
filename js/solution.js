'use strict';

const pageDimension = { width: document.body.clientWidth, height: document.body.clientHeight };
const fileInput = document.getElementById('fileInput');
const menu = document.querySelector('.menu');
const newPic = document.querySelector('.new');
const drag = document.querySelector('.drag');
const burger = document.querySelector('.burger');
const share = document.querySelector('.share');
const shareTools = document.querySelector('.share-tools');
const draw = document.querySelector('.draw');
const comments = document.querySelector('.comments');
const img = document.querySelector('.current-image');
const imgLoader = document.querySelector('.image-loader');
const errorWrap = document.querySelector('.error');
const errorMessage = document.querySelector('.error__message');
const url = document.querySelector('.menu__url');
const copyButton = document.querySelector('.menu_copy');
const menuToggle = document.querySelector('.menu__toggle-bg');
const mask = document.querySelector('.mask');
const shiftMenu = {x: 0, y: 0};
let emptyCanvasSize = 0;
let currentCanvasSize = 0;
let isDraw = false;
let needReload = false;
let imgID = null;
let bounds;
let connection;
let response;
let countComments;

// скрытие описания ошибки

document.addEventListener('click', () => errorWrap.classList.add('hidden'));

// выбор изображения

fileInput.addEventListener('change', event => {
    console.log(`Файл выбран. Функция onSelectFiles(). Запускаю функцию sendFile(file)...`);
    const file = event.target.files[0];
    if (file) sendFile(file);
});

// копирование ссылки в буфер обмена

copyButton.addEventListener('click', () => {
    url.select();
document.execCommand('copy');
console.log(`Текст скопирован в буфер обмена...`);
});

// Работа со Storage 

function dataToStorage(title, value) {
    sessionStorage.setItem(title, value);
    console.log("TCL: dataToStorage -> sessionStorage", sessionStorage);
}

// загрузка картинки

function loadMask(url) {
    console.log('TCL: loadMask -> url', url);
    return new Promise(resolve => {
        mask.src = url;
        mask.addEventListener('load', () => resolve())
    });
}

function loadImg(url) {
    console.log('TCL: loadImg -> url', url);
    return new Promise(resolve => {
        img.src = url;
        img.addEventListener("load", () => resolve());
    });
}

// определение размера канваса

function canvasSize() {
    console.log("Изображение загрузилось. Меняю размер ХОЛСТА...");
    canvas.removeAttribute('class');
    canvas.width = img.width;
    canvas.height = img.height;
    checkMenuWidth();
    checkFormsPosition();
}

// определение размера маски

function maskSize() {
    console.log('Изображение загрузилось. Меняю размер МАСКИ...');
    console.log("TCL: maskSize -> img.width", img.width);
    mask.width = img.width;
    mask.height = img.height;
}

// уточнение положения форм с комментариями относительно картинки

function checkFormsPosition() {
    console.log("Запущена функция checkFormsPosition...");
    const forms = document.querySelectorAll(".comments__form");
    const imageHeight = document.querySelector("img").getBoundingClientRect().height;
    const imageWidth = document.querySelector("img").getBoundingClientRect().width;
    const imageLeft = document.querySelector("img").getBoundingClientRect().x;
    const imageTop = document.querySelector("img").getBoundingClientRect().y;

    const movingForm = form => {
        form.style.top = `${parseFloat(form.dataset.aspectTop) * imageHeight + imageTop}px`;
        form.style.left = `${parseFloat(form.dataset.aspectLeft) * imageWidth + imageLeft}px`;
    }

    forms.forEach(form => movingForm(form));
}

// перемещение меню

document.addEventListener('mousedown', event => {
    if(event.target.classList.contains('drag')) {
        movedPiece = event.target.parentNode;
        bounds = event.target.getBoundingClientRect();
        shiftMenu.x = event.pageX - bounds.left - window.pageXOffset;
        shiftMenu.y = event.pageY - bounds.top - window.pageYOffset;
    }
});

// переключение режимов

menu.addEventListener('click', event => {
    const element = event.target;
    const parent = event.target.parentNode;
    const currentMode = document.querySelector('.menu__item[data-state = selected]');

    if (element.tagName === 'LI' || parent.tagName === 'LI') {
        if (parent.classList.contains('burger') || element.classList.contains('burger')) {
            toggleMenu(currentMode, menu, "", "default");
            currentMode.dataset.state = '';
            menu.dataset.state = 'default';
            removeEmptyComment();
            closeAllForms();
            sendMask(response);
            checkMenuWidth();
        }

        if(parent.classList.contains('new') || element.classList.contains('new')) {
            fileInput.click();
        }

        if (parent.classList.contains('comments') || element.classList.contains('comments')) {
            toggleMenu(menu, comments);
        }

        if(parent.classList.contains('draw') || element.classList.contains('draw')) {
            isDraw = true;
            toggleMenu(menu, draw);
        }
        
        if(parent.classList.contains('share') || element.classList.contains('share')) {
            toggleMenu(menu, share);
            checkMenuWidth();
        }
    }
});

function toggleMenu(pointCne, pointTwo, attrOne, attrTwo) {
    if (!attrOne) {
        pointCne.dataset.state = "selected";
    } else {
        pointCne.dataset.state = attrOne;
    }

    if (!attrTwo) {
        pointTwo.dataset.state = "selected";
    } else {
        pointTwo.dataset.state = attrTwo;  
    }
}

// Проверка раскрытия меню

function checkMenuWidth() {
    const menuShareWidth = drag.getBoundingClientRect().width
        + burger.getBoundingClientRect().width
        + share.getBoundingClientRect().width
        + parseFloat(getComputedStyle(shareTools).width)
        + parseFloat(getComputedStyle(shareTools).borderWidth || getComputedStyle(shareTools).borderLeftWidth) * 2;

    const menuDefaultWitdh = drag.getBoundingClientRect().width
        + comments.getBoundingClientRect().width+draw.getBoundingClientRect().width
        + share.getBoundingClientRect().width
        + newPic.getBoundingClientRect().width
        + parseFloat(getComputedStyle(shareTools).borderWidth || getComputedStyle(shareTools).borderLeftWidth) * 2;

    if (menu.dataset.state === 'selected' && menu.getBoundingClientRect().x + menuShareWidth > pageDimension.width) {
        menu.style.left = `${pageDimension.width - menuShareWidth - parseInt(getComputedStyle(menu).borderWidth || getComputedStyle(shareTools).borderLeftWidth)*2}px`;
        checkMenuWidth();
    }

    if (menu.dataset.state === 'default' && menu.getBoundingClientRect().x + menuDefaultWitdh > pageDimension.width) {
        menu.style.left = `${pageDimension.width - menuDefaultWitdh - parseInt(getComputedStyle(menu).borderWidth || getComputedStyle(shareTools).borderLeftWidth)*2}px`;
        checkMenuWidth();
    }
}

// форматирование даты

function timeParser(miliseconds) {
    const date = new Date(miliseconds);
    const options = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'};
    const formatDate = new Intl.DateTimeFormat("ru-RU", options).format;
    return formatDate(date);
}
