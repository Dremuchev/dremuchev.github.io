'use strict';

const imgLoader = document.querySelector('.image-loader');

// событие перетаскивание файла

document.body.addEventListener('drop', onFilesDrop);
document.body.addEventListener('dragover', event => event.preventDefault());

var imgID = null;

//плавающее меню

const pageDimension = { width: document.body.clientWidth, height: document.body.clientHeight };
const shiftMenu = {x: 0, y: 0};
let bounds;
let movedPiece = null;

document.addEventListener('mousedown', clickToMove);
document.addEventListener('mousemove', dragStart, false);
document.addEventListener('mouseup', dragStop);

function clickToMove(event) {
    if(event.target.classList.contains('drag')) {
        movedPiece = event.target.parentNode;
        bounds = event.target.getBoundingClientRect();
        shiftMenu.x = event.pageX - bounds.left - window.pageXOffset;
        shiftMenu.y = event.pageY - bounds.top - window.pageYOffset;
        console.log(movedPiece);
    }
}

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

// переключение режимов

const menu = document.querySelector('.menu');
menu.dataset.state = 'initial';
menu.addEventListener('click', changeMode);
const burger = document.querySelector('.burger');
const share = document.querySelector('.share');
const draw = document.querySelector('.draw');
const comments = document.querySelector('.comments');
const img = document.querySelector('.current-image');
img.addEventListener('load', canvasSize);
img.classList.add('hidden');
const errorWrap = document.querySelector('.error');
document.addEventListener('click', () => errorWrap.classList.add('hidden'));
const errorMessage = document.querySelector('.error__message');
const url = document.querySelector('.menu__url');
const copyButton = document.querySelector('.menu_copy');
copyButton.addEventListener('click', copyURL);
const menuToggle = document.querySelector('.menu__toggle-bg');
menuToggle.addEventListener('click', toggleComments);
const inputFile = document.createElement('input');
inputFile.setAttribute('accept', 'image/jpeg, image/png');
inputFile.type = 'file';
inputFile.id = 'fileInput';
document.body.appendChild(inputFile);
inputFile.addEventListener('change', onSelectFiles);

function changeMode(event) {
    const element = event.target;
    const parent = event.target.parentNode;
    const currentMode = document.querySelector('li[data-state = selected]');

    if (element.tagName === 'LI' || parent.tagName === 'LI') {
        if(parent.classList.contains('burger') || element.classList.contains('burger')) {
            const isNewComment = document.getElementsByClassName('comments__form new')[0];
            currentMode.dataset.state = '';
            menu.dataset.state = 'default';
            removeEmptyComment();
        }
        if(parent.classList.contains('new') || element.classList.contains('new')) {
            clearCanvas();
            inputFile.click();
        }
        if(parent.classList.contains('comments') || element.classList.contains('comments')) {
            menu.dataset.state = 'selected';
            comments.dataset.state = 'selected';
        }
        if(parent.classList.contains('draw') || element.classList.contains('draw')) {
            menu.dataset.state = 'selected';
            draw.dataset.state = 'selected';
        }
        if(parent.classList.contains('share') || element.classList.contains('share')) {
            menu.dataset.state = 'selected';
            share.dataset.state = 'selected';
        }
    }
}

// рисование

window.addEventListener('resize', canvasSize);
document.body.appendChild(document.createElement('canvas'));
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.id = 'canvas';
canvas.className = 'hidden';
let curves = [];
let color = {'red': '#ea5d56', 'yellow': '#f3d135', 'green': '#6cbe47', 'blue': '#53a7f5', 'purple': '#b36ade'};
let drawing = false;
let needsRepaint = false;

const colorButtons = document.querySelector('.draw-tools');
colorButtons.addEventListener('click', colorSelect);

function colorSelect(event) {
    if (event.target.name === 'color') {
        const currentColor = document.querySelector('.menu__color[checked]');
        currentColor.removeAttribute('checked');
        event.target.setAttribute('checked', '');
    }
}

function canvasSize() {
    clearCanvas();
    canvas.width = img.width;
    canvas.height = img.height;
}

function clearCanvas() {
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

    if (points.length > 2) {
        for (let i = points.length - 2; i < points.length - 1; i++) {
            ctx.moveTo(...points[i]);
            smoothCurveBetween(points[i], points[i + 1]);
        }
        ctx.stroke();
    }
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

canvas.addEventListener('dblclick', clearCanvas);

// конец рисования

function copyURL() {
    url.select();
    try {
        document.execCommand('copy');
    } catch(err) {
        console.log('Can`t copy!');
    }
    console.log(`Текст скопирован в буфер обмена...`);
}

function onSelectFiles(event) {
    const files = event.target.files;
    console.log(files[0]);
    sendFile(files[0]);
}

function sendFile(file) {
    errorWrap.classList.add('hidden');
    console.log(file)
    if (file) {
        const imageTypeRegExp = /^image\/jpg|jpeg|png/;
        if (imageTypeRegExp.test(file.type)) {
            const formData = new FormData();
            formData.append('title', file.name);
            formData.append('image', file);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://neto-api.herokuapp.com/pic/');
            xhr.addEventListener("loadstart", onLoadStart);
            xhr.addEventListener("loadend", onLoadEnd);
            xhr.addEventListener('load', () => {
                if(xhr.status === 200) {
                    console.log(xhr.responseText);
                    const result = JSON.parse(xhr.responseText);
                    img.src = result.url;
                    url.value = result.url;
                    img.setAttribute('alt', result.title);
                    imgID = result.id;
                    canvas.removeAttribute('class');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    menu.dataset.state = 'selected';
                    share.dataset.state = 'selected';
                    getFile(imgID);
                    console.log(`Изображение опубликовано! Дата публикации: ${timeParser(result.timestamp)}`);
                    canvasSize();
                }
            })
            xhr.send(formData);
        } else {
            errorWrap.classList.remove('hidden');
            errorMessage.innerText = 'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';
        }
    }
}

function onLoadStart() {
    img.classList.add('hidden');
    imgLoader.style.display = 'block';
}

function onLoadEnd() {
    img.classList.remove('hidden');
    imgLoader.style.display = 'none';
}

function getFile(id) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://neto-api.herokuapp.com/pic/${id}`);
    xhr.addEventListener('load', () => {
        if (xhr.status === 200){
        console.log(xhr.responseText);
        const result = JSON.parse(xhr.responseText);
        img.src = result.url;
        url.value = result.url;
        console.log(`Изображение получено! Дата публикации: ${timeParser(result.timestamp)}`)
    }
});
    xhr.send();
}

function onFilesDrop(event) {
    event.preventDefault();
    if (img.classList.contains('hidden')) {
        const files = event.dataTransfer.files;
        sendFile(files[0]);
    } else {
        errorWrap.classList.remove('hidden');
        errorMessage.innerText = 'Чтобы загрузить новое изображение, пожалуйста воспользуйтесь пунктом "Загрузить новое" в меню.';
    }
}

function toggleComments() {
    const commentsForm = document.querySelectorAll('.comments__form');
    const commentsOn = document.getElementById('comments-on');
    const commentsOff = document.getElementById('comments-off');
    for (const comment of commentsForm) {
        comment.classList.toggle('hidden');
    }
    if (commentsOn.checked) {
        commentsOff.removeAttribute('checked');
        commentsOn.setAttribute('checked', '');
        console.log('Комментарии Включены!');
    } else {
        commentsOn.removeAttribute('checked');
        commentsOff.setAttribute('checked', '');
        if (document.querySelector('.comments__marker-checkbox') && !document.querySelector('.app').lastChild.querySelector('.comments__marker-checkbox[type]')){
            document.querySelector('.app').removeChild(document.querySelector('.app').lastChild);
        }
        console.log('Комментарии выключены!');
    }
}

// comments

function removeEmptyComment() {
    const isNewComment = document.getElementsByClassName('comments__form new')[0];
    if (isNewComment) {
        document.querySelector('.app').removeChild(isNewComment);
    }
}

// форма коментариев (создание)

function createNewComment(event) {
    const isCommentsOn = document.getElementById('comments-on').checked;
    if (comments.dataset.state === 'selected' && isCommentsOn) {
        removeEmptyComment();
        const app = document.querySelector('.app');
        const form = document.createElement('div');
        form.className = 'comments__form new';

        const marker = document.createElement('span');
        marker.className = 'comments__marker';

        const markerCheckbox = document.createElement('input');
        markerCheckbox.className = 'comments__marker-checkbox';
        markerCheckbox.type = 'checkbox';

        const commentsBody = document.createElement('div');
        commentsBody.className = 'comments__body';

        const createMessaege = document.createElement('div');
        createMessaege.className = 'comment';

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
        createMessaege.appendChild(loader);
        commentsBody.appendChild(createMessaege);
        commentsBody.appendChild(commentsInput);
        commentsBody.appendChild(commentsClose);
        commentsBody.appendChild(commentsSubmit);

        form.style.left = event.pageX + 'px';
        form.style.top = event.pageY + 'px';

        form.appendChild(marker);
        form.appendChild(markerCheckbox);
        form.appendChild(commentsBody);
        app.appendChild(form);
        const newForm = document.querySelectorAll('.comments__form');
        newForm[newForm.length-1].querySelector('.comments__marker-checkbox').click();
        commentsClose.addEventListener('click', removeEmptyComment);
        markerCheckbox.removeAttribute('type');
        commentsBody.style.display = 'block';
    }
}

function createCommentForm(comments) {
    const app = document.querySelector('.app');

    for (let comment in comments) {

        const form = document.createElement('div');
        form.className = 'comments__form';

        const marker = document.createElement('span');
        marker.className = 'comments__marker';

        const markerCheckbox = document.createElement('input');
        markerCheckbox.className = 'comments__marker-checkbox';
        markerCheckbox.type = 'checkbox';

        const commentsBody = document.createElement('div');
        commentsBody.className = 'comments__body';

        const commit = document.createElement('div');
        commit.className = 'comment';

        const time = document.createElement('p');
        time.className = 'comment__time';
        time.innerText = timeParser(comments[comment].timestamp);

        const message = document.createElement('p');
        message.className = 'comment__message';
        message.innerText = comments[comment].message;

        const createMessaege = document.createElement('div');
        createMessaege.className = 'comment';

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

        commit.appendChild(time);
        commit.appendChild(message);
        commentsBody.appendChild(commit);
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        loader.appendChild(document.createElement('span'));
        createMessaege.appendChild(loader);
        commentsBody.appendChild(createMessaege);
        commentsBody.appendChild(commentsInput);
        commentsBody.appendChild(commentsClose);
        commentsBody.appendChild(commentsSubmit);

        form.style.left = comments[comment].left + 'px';
        form.style.top = comments[comment].top + 'px';

        form.appendChild(marker);
        form.appendChild(markerCheckbox);
        form.appendChild(commentsBody);
        app.appendChild(form);
    }
}

// https://neto-api.herokuapp.com/pic/${aba23fc0-1008-11e8-b8b2-2b0fbff0de7d}

// const str = {
//     id: "aba23fc0-1008-11e8-b8b2-2b0fbff0de7d",
//     title: "Макет дизайна",
//     url: "https://storage.googleapis.com/neto-api.appspot.com/pic/aba23fc0-1008-11e8-b8b2-2b0fbff0de7d/bMFAlDwf9AI.jpg",
//     mask: "https://www.googleapis.com/download/storage/v1/b/neto-api.appspot.com/o/pic%2F8ece7a20-15f4-11e8-96fd-2513ea9afcae-mask.png?generation=1519100719825524&alt=media",
//     timestamp: 1518449006013,
//     comments: {
//         "-L59YakIzQIO4_qiP6ws": {
//             left: 100,
//             message: "Тут мне кажется лучше подойдет розовый цвет",
//             timestamp: 1518448045157,
//             top: 65
//         },
//         "-L59bM_rv4fesvnQ1nts": {
//             left: 953,
//             message: "Эта картинка на коллаже слишком шумная",
//             timestamp: 1518449031562,
//             top: 480
//         }
//     },
// };

canvas.addEventListener('click', createNewComment);

function timeParser(miliseconds) {
    const date = new Date(miliseconds);
    const options = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'};
    const formatDate = new Intl.DateTimeFormat("ru-RU", options).format;
    return formatDate(date);
}