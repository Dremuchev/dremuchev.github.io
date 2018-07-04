'use strict';

const pageDimension = { width: document.body.clientWidth, height: document.body.clientHeight };
const fileInput = document.getElementById('fileInput');
const menu = document.querySelector('.menu');
const burger = document.querySelector('.burger');
const share = document.querySelector('.share');
const draw = document.querySelector('.draw');
const colorButtons = document.querySelector('.draw-tools');
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
let movedPiece = null;
let bounds;
let connection;
let response;
let countComments;

document.addEventListener('click', () => errorWrap.classList.add('hidden'));
img.addEventListener('load', canvasSize);
menu.addEventListener('click', changeMode);
colorButtons.addEventListener('click', colorSelect);
copyButton.addEventListener('click', copyURL);
menuToggle.addEventListener('click', toggleComments);
fileInput.addEventListener('change', onSelectFiles);

// определение размера канваса и маски

function canvasSize() {
    console.log('Запущена функция canvasSize...');
    clearCanvas();
    if (checkImageLoad()) {
        canvas.removeAttribute('class');
        console.log('Изображение загрузилось. Меняю размер холста...');
        canvas.width = img.width;
        canvas.height = img.height;
    }
}

function maskSize() {
    console.log('Запущена функция maskSize...');
    clearCanvas();
    if (checkImageLoad()) {
        console.log('Изображение загрузилось. Меняю размер маски...');
        mask.width = img.width;
        mask.height = img.height;
    }
}

// функция для проверки окончательной загрузки изображения

function checkImageLoad() {
    console.log('Запущена функция checkImageLoad...');
    if (img.complete){
        return true;
    } else {
        return false;
    }
}

if (location.search) {
    console.log(`Перехожу по ссылке ${`\`${location.origin + location.pathname}?${imgID}\``}`);
    getShareData((location.search).replace(/^\?/, ''));
}

//плавающее меню

document.body.addEventListener('dragover', event => event.preventDefault());
document.body.addEventListener('drop', onFilesDrop);
document.addEventListener('mousedown', clickToMove);
document.addEventListener('mousemove', dragStart, false);
document.addEventListener('mouseup', dragStop);

function clickToMove(event) {
    if(event.target.classList.contains('drag')) {
        movedPiece = event.target.parentNode;
        bounds = event.target.getBoundingClientRect();
        shiftMenu.x = event.pageX - bounds.left - window.pageXOffset;
        shiftMenu.y = event.pageY - bounds.top - window.pageYOffset;
    }
}

// выбор изображения

function onSelectFiles(event) {
    console.log(`Файл выбран. Функция onSelectFiles()`);
    const files = event.target.files;
    if (files[0]) {
        sendFile(files[0]);
    }
}

// drag'n'drop

function dragStart(event) {
    if (movedPiece) {
        event.preventDefault();
        const cords = {x: event.pageX - shiftMenu.x, y: event.pageY - shiftMenu.y};
        const maxX = pageDimension.width - movedPiece.offsetWidth - 1;
        const maxY = pageDimension.height - movedPiece.offsetHeight - 1;
        cords.x = Math.min(cords.x, maxX);
        cords.y = Math.min(cords.y, maxY);
        cords.x = Math.max(cords.x, 0);
        cords.y = Math.max(cords.y, 0);
        movedPiece.style.left = `${cords.x}px`;
        movedPiece.style.top = `${cords.y}px`;
    }
}

function dragStop() {
    if (movedPiece) {
        movedPiece = null;
    }
}

function onFilesDrop(event) {
    console.log(`Файл выбран. Функция onFilesDrop()`);
    event.preventDefault();
    if (!img.getAttribute('src')) {
        const files = event.dataTransfer.files;
        sendFile(files[0]);
    } else {
        errorWrap.classList.remove('hidden');
        errorMessage.innerText = 'Чтобы загрузить новое изображение, пожалуйста воспользуйтесь пунктом "Загрузить новое" в меню.';
    }
}

// получение файла после перехода по ссылке

function getShareData(id) {
    console.log(`Запущена функция getShareData(${imgID})`);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://neto-api.herokuapp.com/pic/${id}`);
    xhr.addEventListener('load', () => loadShareData(JSON.parse(xhr.responseText)));
    xhr.send();
}

function loadShareData(result) {
    console.log(`getShareData(${imgID}) : Изображение получено! Дата публикации: ${timeParser(result.timestamp)}`);
    img.src = result.url;
    url.value = `${location.href}?${imgID}`;
    imgID = result.id;
    menu.dataset.state = 'selected';
    comments.dataset.state = 'selected';

    if (result.comments) {
        createCommentsArray(result.comments);
    }

    if (result.mask) {
        mask.src = result.mask;
        mask.classList.remove('hidden');
    }

    if (document.getElementById('comments-off').checked) {
        console.log('Комментарии выключены!');
        const commentsForm = document.querySelectorAll('.comments__form');
        for (const comment of commentsForm) {
            comment.classList.add('hidden');
        }
    }
    maskSize();
    canvasSize();
    getWSConnect()
    closeAllForms();
}

// переключение режимов

function changeMode(event) {
    const element = event.target;
    const parent = event.target.parentNode;
    const currentMode = document.querySelector('.menu__item[data-state = selected]');

    if (element.tagName === 'LI' || parent.tagName === 'LI') {
        if(parent.classList.contains('burger') || element.classList.contains('burger')) {
            const isNewComment = document.getElementsByClassName('comments__form new')[0];
            currentMode.dataset.state = '';
            menu.dataset.state = 'default';
            removeEmptyComment();
            closeAllForms();
            sendMask(response);
        }
        if(parent.classList.contains('new') || element.classList.contains('new')) {
            clearCanvas();
            fileInput.click();
        }
        if(parent.classList.contains('comments') || element.classList.contains('comments')) {
            menu.dataset.state = 'selected';
            comments.dataset.state = 'selected';
        }
        if(parent.classList.contains('draw') || element.classList.contains('draw')) {
            isDraw = true;
            menu.dataset.state = 'selected';
            draw.dataset.state = 'selected';
        }
        if(parent.classList.contains('share') || element.classList.contains('share')) {
            menu.dataset.state = 'selected';
            share.dataset.state = 'selected';
        }
    }
}

// отправка маски на сервер

function sendMask(response) {
    console.log(`Запущена функция sendMask()`);
    if (isDraw) {
        canvas.toBlob(blob => {
            currentCanvasSize = blob.size;
            if (currentCanvasSize !== emptyCanvasSize) {
                connection.send(blob);
            }
        })
        isDraw = false;
    } else {
        if (checkImageLoad()) {
            canvas.toBlob(blob => emptyCanvasSize = blob.size);
        }
        console.log(`emptyCanvasSize = ${emptyCanvasSize}. Режим рисования выключен!`);
    }

    if (response) {
            if (response.event === 'mask') {
            console.log('Событие маски...');
            mask.classList.remove('hidden');
            mask.src = response.url;
            clearCanvas();
        } else if (response.event === 'comment') {
            pullComments(response);
        }
    }
}

// получение коментариев по изображению

function pullComments(result) {
    console.log(`Запущена функция pullComments(${result})`);
    countComments = 0;

    for (const comment in result.comments) {
        countComments++;
    }
    const countCurrentComments = document.getElementsByClassName('comment').length - document.getElementsByClassName('comment load').length;
    needReload = (countComments === countCurrentComments) ? false : true;

    if(result.comment && needReload) {
        createCommentsArray(result.comment);
    }

    if (document.getElementById('comments-off').checked) {
        const commentsForm = document.querySelectorAll('.comments__form');
        for (const comment of commentsForm) {
            comment.classList.add('hidden');
        }
    }
}

// рисование

window.addEventListener('resize', canvasSize);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let curves = [];
let color = {'red': '#ea5d56', 'yellow': '#f3d135', 'green': '#6cbe47', 'blue': '#53a7f5', 'purple': '#b36ade'};
let drawing = false;
let needsRepaint = false;

function colorSelect(event) {
    if (event.target.name === 'color') {
        const currentColor = document.querySelector('.menu__color[checked]');
        currentColor.removeAttribute('checked');
        event.target.setAttribute('checked', '');
    }
}

canvas.addEventListener('dblclick', clearCanvas);
canvas.addEventListener('click', createNewComment);

function clearCanvas() {
    console.log(`Запущена функция clearCanvas()`);
    curves = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    needsRepaint = true;
}

function getColor() {
    const currentColor = document.querySelector('.menu__color[checked]').value;
    return color[currentColor];
}

function smoothCurveBetween (p1, p2) {
    const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle =  getColor();
    ctx.quadraticCurveTo(...p1, ...cp);
}

function smoothCurve(points) {
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.moveTo(...points[0]);

    for(let i = 1; i < points.length - 1; i++) {
        smoothCurveBetween(points[i], points[i + 1]);
    }
    ctx.stroke();
}

canvas.addEventListener("mousedown", event => {
    if (draw.dataset.state === 'selected') {
        const curve = [];
        drawing = true;
        curve.push([event.offsetX, event.offsetY]);
        curves.push(curve);
        needsRepaint = true;
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

// функция копирования ссылки на данный ресурс

function copyURL() {
    url.select();
    document.execCommand('copy');
    console.log(`Текст скопирован в буфер обмена...`);
}

// открытие WebSocket соединения

function getWSConnect() {
    console.log(`Запущена функция getWSConnect()`);
    connection = new WebSocket(`wss://neto-api.herokuapp.com/pic/${imgID}`);
    connection.addEventListener('open', () => console.log('Connection open...'));
    connection.addEventListener('message', event => sendMask(JSON.parse(event.data)));
}

// функция отправки файла на сервер

function sendFile(file) {
    console.log(`Запущена функция sendFile()`);
    errorWrap.classList.add('hidden');
    const imageTypeRegExp = /^image\/jpg|jpeg|png/;
    if (imageTypeRegExp.test(file.type)) {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('title', file.name);
        formData.append('image', file);
        xhr.open('POST', 'https://neto-api.herokuapp.com/pic/');
        xhr.addEventListener("loadstart", () => imgLoader.style.display = 'block');
        xhr.addEventListener("loadend", () => imgLoader.style.display = 'none');
        xhr.addEventListener('load', () => {
            if(xhr.status === 200) {

            const result = JSON.parse(xhr.responseText);
            img.src = result.url;
            imgID = result.id;
            url.value = `${location.origin + location.pathname}?${imgID}`;
            menu.dataset.state = 'selected';
            share.dataset.state = 'selected';

            console.log(`Изображение опубликовано! Дата публикации: ${timeParser(result.timestamp)}`);

            canvasSize();
            getFile(imgID);
            clearForms();
            getWSConnect();

        }
    })
        xhr.send(formData);
    } else {
        errorWrap.classList.remove('hidden');
        errorMessage.innerText = 'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';
    }
}

// получение изображения

function getFile(id) {
    console.log(`Запущена функция getFile()`);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://neto-api.herokuapp.com/pic/${id}`);
    xhr.addEventListener('load', () => {
        if (xhr.status === 200){
        const result = JSON.parse(xhr.responseText);
        img.src = result.url;
        imgID = result.id;
        url.value = `${location.origin + location.pathname}?${imgID}`;
        menu.dataset.state = 'selected';
        share.dataset.state = 'selected';

        console.log(`Изображение получено! Дата публикации: ${timeParser(result.timestamp)}`);

        if(result.comments) {
            createCommentsArray(result.comments);
        }

        maskSize();
        canvasSize();
        closeAllForms();
    }
});
    xhr.send();
}

//

function toggleComments(event) {
    const commentsForm = document.querySelectorAll('.comments__form');
    const commentsOn = document.getElementById('comments-on');
    const commentsOff = document.getElementById('comments-off');

    if (commentsOn.checked) {
        commentsOff.removeAttribute('checked');
        commentsOn.setAttribute('checked', '');
        for (const comment of commentsForm) {
            comment.classList.remove('hidden');
        }
        closeAllForms();
        console.log('toggleComments() : Комментарии Включены!');
    } else {
        commentsOn.removeAttribute('checked');
        commentsOff.setAttribute('checked', '');

        for (const comment of commentsForm) {
            comment.classList.add('hidden');
        }
        if (document.querySelector('.comments__marker-checkbox') && !document.querySelector('.app').lastChild.querySelector('.comments__marker-checkbox[type]')){
            document.querySelector('.app').removeChild(document.querySelector('.app').lastChild);
        }
        console.log('toggleComments() : Комментарии выключены!');
    }
}

function clearForms() {
    console.log(`Запущена функция clearForms()`);
    const forms = document.querySelectorAll('.comments__form');
    for (const form of forms) {
        document.querySelector('.app').removeChild(form);
    }
}

function createNewComment(event) {
    console.log(`Запущена функция createNewComment()`);
    const isCommentsOn = document.getElementById('comments-on').checked;
    if (comments.dataset.state === 'selected' && isCommentsOn) {
        const app = document.querySelector('.app');
        removeEmptyComment();
        closeAllForms();

        const form = document.createElement('div');
        form.className = 'comments__form new';

        const marker = document.createElement('span');
        marker.className = 'comments__marker';

        const commentsBody = document.createElement('div');
        commentsBody.className = 'comments__body';

        const createMessaege = document.createElement('div');
        createMessaege.className = 'comment';

        const loader = document.createElement('div');
        loader.className = 'loader hidden';

        const span = document.createElement('span');

        const commentsInput = document.createElement('textarea');
        commentsInput.className = 'comments__input';
        commentsInput.setAttribute('type', 'text');
        commentsInput.setAttribute('placeholder', 'Напишите ответ...');

        const commentsClose = document.createElement('input');
        commentsClose.className = 'comments__close';
        commentsClose.type = 'button';
        commentsClose.value = 'Закрыть';

        const commentsSubmit = document.createElement('input');
        commentsSubmit.className = 'comments__submit';
        commentsSubmit.type = 'submit';
        commentsSubmit.value = 'Отправить';

        createMessaege.appendChild(loader);
        loader.appendChild(span);
        loader.appendChild(span);
        loader.appendChild(span);
        loader.appendChild(span);
        loader.appendChild(span);
        commentsBody.appendChild(createMessaege);
        commentsBody.appendChild(commentsInput);
        commentsBody.appendChild(commentsClose);
        commentsBody.appendChild(commentsSubmit);

        form.style.left = event.pageX + 'px';
        form.style.top = event.pageY + 'px';

        form.appendChild(marker);
        form.appendChild(commentsBody);
        app.appendChild(form);
        commentsClose.addEventListener('click', removeEmptyComment);
        commentsBody.style.display = 'block';
    }
}

document.addEventListener('click', markerClick);
document.addEventListener('click', closeForm);

// закрытие текущей формы

function closeForm(event) {
    console.log(`Запущена функция closeForm()`);
    if (event.target.className === 'comments__close') {
        event.target.parentNode.style.display = 'none';
    }
}

// закрытие всех форм

function closeAllForms() {
    console.log(`Запущена функция closeAllForms()`);
    const otherForms = document.querySelectorAll('.comments__body');
    for (const body of otherForms) {
        body.style.display = 'none';
    }
}

// удаляет пустую форму из DOM

function removeEmptyComment() {
    console.log(`Запущена функция removeEmptyComment()`);
    const isNewComment = document.getElementsByClassName('comments__form new')[0];
    if (isNewComment) {
        document.querySelector('.app').removeChild(isNewComment);
    }
}

// показ/скрытие формы

function markerClick(event) {
    const bodyForm = event.target.nextElementSibling;
    if (bodyForm) {
        if (event.target.className === 'comments__marker-checkbox') {
            removeEmptyComment();

            if (bodyForm.style.display === 'block') {
                closeAllForms();
                bodyForm.style.display = 'none';
            } else {
                closeAllForms();
                bodyForm.style.display = 'block';
            }
        }
    }
}

// создание массива с коментариями, полученными с сервера

function createCommentsArray(comments) {
    console.log(`Запущена функция createCommentsArray(${comments})`);
    const commentArray = [];
    for (const comment in comments) {
        commentArray.push(comments[comment]);
    }
    clearForms();
    createCommentForm(commentArray);
}

// наполнение DOM комментариями

function createCommentForm(comments) {
    console.log(`Запущена функция createCommentForm(${comments})`);
    const app = document.querySelector('.app');

    for (let comment of comments) {
        closeAllForms();

        const form = document.createElement('div');
        form.className = 'comments__form';

        const marker = document.createElement('span');
        marker.className = 'comments__marker';

        const markerCheckbox = document.createElement('input');
        markerCheckbox.className = 'comments__marker-checkbox';
        markerCheckbox.type = 'checkbox';

        const commentsBody = document.createElement('div');
        commentsBody.className = 'comments__body';
        commentsBody.style.display = 'block';

        const commit = document.createElement('div');
        commit.className = 'comment';

        const time = document.createElement('p');
        time.className = 'comment__time';
        time.innerText = timeParser(comment.timestamp);

        const message = document.createElement('p');
        message.className = 'comment__message';
        message.innerText = comment.message;

        commit.appendChild(time);
        commit.appendChild(message);

        const current = document.querySelector(`.comments__form[style="left: ${comment.left}px; top: ${comment.top}px;"]`);

        if (!current) {
            commentsBody.appendChild(commit);
            form.style.left = comment.left + 'px';
            form.style.top = comment.top + 'px';
            app.appendChild(form);
        } else {
            appendComment(commit, current);
        }

        const createMessage = document.createElement('div');
        createMessage.className = 'comment load';

        const loader = document.createElement('div');
        loader.className = 'loader hidden';

        const commentsInput = document.createElement('textarea');
        commentsInput.className = 'comments__input';
        commentsInput.setAttribute('type', 'text');
        commentsInput.setAttribute('placeholder', 'Напишите ответ...');

        const commentsClose = document.createElement('input');
        commentsClose.className = 'comments__close';
        commentsClose.type = 'button';
        commentsClose.value = 'Закрыть';

        const commentsSubmit = document.createElement('input');
        commentsSubmit.className = 'comments__submit';
        commentsSubmit.type = 'submit';
        commentsSubmit.value = 'Отправить';

        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        createMessage.appendChild(loader);
        commentsBody.appendChild(createMessage);
        commentsBody.appendChild(commentsInput);
        commentsBody.appendChild(commentsClose);
        commentsBody.appendChild(commentsSubmit);

        form.appendChild(marker);
        form.appendChild(markerCheckbox);
        form.appendChild(commentsBody);
    }
}

// добавления комментария в существующую форму

function appendComment(element, target) {
    console.log(`Запущена функция appendComment()`);
    const comments = target.querySelector('.comments__body').querySelectorAll('.comment');
    closeAllForms();
    if (target) {
        target.querySelector('.comments__body').insertBefore(element, target.querySelector('.load'));
        target.querySelector('.comments__body').style.display = 'block';
    }
    needReload = false;
}

// форматирование даты

function timeParser(miliseconds) {
    const date = new Date(miliseconds);
    const options = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'};
    const formatDate = new Intl.DateTimeFormat("ru-RU", options).format;
    return formatDate(date);
}

// отправка коментария на сервер

document.querySelector('.app').addEventListener('click', messageHandler);

function sendNewComment(id, comment, target) {
    console.log(`Запущена функция sendNewComment()`);
    const xhr = new XMLHttpRequest();
    const body = 'message=' + encodeURIComponent(comment.message) +
        '&left=' + comment.left +
        '&top=' + comment.top;
    xhr.open("POST", `https://neto-api.herokuapp.com/pic/${id}/comments`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.addEventListener("loadstart", () => target.querySelector('.loader').classList.remove('hidden'));
    xhr.addEventListener("loadend", () => target.querySelector('.loader').classList.add('hidden'));
    xhr.addEventListener('load', () => {
        if(xhr.status === 200) {
            console.log('Комментарий был отправвлен!');
            const result = JSON.parse(xhr.responseText);
            clearForms();
            createCommentsArray(result.comments);
            needReload = false;
        }
    })
    xhr.send(body);
}

function messageHandler(event) {
    console.log(`Запущена функция messageHandler()`);
    if (event.target.className === 'comments__submit') {
        event.preventDefault();
        const element = event.target.parentNode.querySelector('textarea');
        const form = event.target.parentNode.parentNode;
        if (element.value) {
            const comment = {'message': element.value, 'left': parseInt(form.style.left), 'top': parseInt(form.style.top)};
            needReload = true;
            sendNewComment(imgID, comment, form);
            element.value = '';
        }
    }
}
