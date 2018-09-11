'use strict';

const POINT_EXPANDED = 0,	// статус точки Развернутая
    POINT_СOLLAPSED = 1,	// свернутая
    POINT_HIDDEN = 2;		// скрытая

const CLASS_POINT = 'point-comment',		// класс для точки
    CLASS_FORM = 'form-comment',			// класс для формы
    CLASS_OLD_COMMENT = 'old-comment', 		// класс для блока старого коммента в форме
    CLASS_TEXT = 'text-comment';			// класс для textArea формы

const currentAuthor = 'Настя'; // Используется при сохранении комментария

const body = document.querySelector('body'),
    inpImage = document.querySelector('#inpImage'),
    butShow = document.querySelector('#comments-on'),
    butHide = document.querySelector('#comments-off'),
    view = document.querySelector('.wrap'),
    canvas = document.querySelector('#graphCanvas'),
    divComments = document.querySelector('.block-comments'),
    ctx = canvas.getContext('2d');


// Эта штука задаёт структуру данных для добавляемых DOM-элементов
const e = (name, props, ...childs) => ({name, props, childs});


function getFirstDataAboutPoints() {
    // Как будто мы получили первые данные о точках
    const pointsComment = [
        {
            id: 1,
            x: 100,	// точка старта
            y: 100,
            comments: [
                {
                    author: 'Валентина',
                    text: 'Здесь будет комментарий',
                },
                {
                    author: 'Сергей',
                    text: 'А когда он будет?',
                },
                {
                    author: 'Дмитрий',
                    text: 'Действительно когда?',
                },
                {
                    author: 'Сергей',
                    text: 'Сам до сих пор жду ответа'
                }
            ]
        }
    ];

    pointsComment.forEach(p => addPoint(p, POINT_СOLLAPSED));  // все формы будут скрыты
}

getFirstDataAboutPoints();



butShow.addEventListener('click', showAllPoints);

butHide.addEventListener('click', hideAllPointsAndForms);


// Функция конструирует DOM-фрагмент
function createElement(node) {
    if (typeof node === 'string') {
        return document.createTextNode(node);
    }
    const element = document.createElement(node.name);
    if ((node.props !== null) && (typeof node.props === 'object')) {
        Object.keys(node.props).forEach(i => element.setAttribute(i, node.props[i]));
    }
    if (node.childs instanceof Array) {
        node.childs.forEach(child => element.appendChild(createElement(child)));
    }
    return element;
}

// Создаём div-блок со старым комментарием
function createDivOldComment(author, text) {
    return e('div', { 'class': CLASS_OLD_COMMENT }, `${author}: ${text}`);
}

// Добавление нового комментария (текст берётся из самой формы)
function addNewComment(f) {

    const ta = getTextAreaInForm(f);

    // Сохраняем комментарий как CLASS_OLD_COMMENT, если он есть, иначе требуем ввести его
    if (isTextInForm(f)) {

        const text = getTextInForm(f),
            newComment = createElement(createDivOldComment(currentAuthor, text));

        f.insertBefore(newComment, ta);				// новый комментарий встаёт перед текстовым полем
        clearTextInForm(f); 						// чистим поле ввода текста

    } else {
        alert('Нужен комментарий!');
    }

}

// ------------------------ Работа с точками ----------------------

// Методы, возвращающие результат

function isShowedPoint(p) {
    return p.style.display !== 'none';
}

// Найти точку в DOMе по id
function findPointById(id) {
    return document.querySelector(`.${CLASS_POINT}[data-id='${id}']`);
}

function getAllPointsDOM() {
    return document.querySelectorAll(`.${CLASS_POINT}`);
}

// Генерация новой точки
function generateNewPoint(newX, newY) {
    const max = 1000, min = 50;										// значения взяты произвольными для демки
    const newId = Math.floor(Math.random() * (max - min)) + min;  	// как будто получаем новый ID

    // возвращаем Точку = объект с полями
    return {
        id: newId,
        x: newX,
        y: newY,
        comments: []	// у новой точки нет комментариев
    };

}

// Методы, не возвращающие результат

function showPoint(p) {
    p.style.display = 'block';
}

function hidePoint(p) {
    p.style.display = 'none';
}

function showAllPoints() {
    const points = getAllPointsDOM();
    Array.from(points).forEach(showPoint);
}

function hideAllPoints() {
    const points = getAllPointsDOM();
    Array.from(points).forEach(hidePoint);
}

function deletePoint(p) {
    divComments.removeChild(p);
}

function addPoint(p, status) {
    const pointStruct = e('div', {
        'class': CLASS_POINT,
        'style': `position: absolute; left: ${p.x-10}px; top:${p.y-10}px;`,
        'data-id': `${p.id}` // запоминаем id коммента
    });
    const newPoint = createElement(pointStruct);

    divComments.appendChild(newPoint);
    newPoint.addEventListener('click', pointCommentOnClick);

    showPoint(newPoint);  // по умолчанию точка показывается

    addForm(p, status); // создаём форму комментирования с присланным статусом
}

// Нажали на точку
function pointCommentOnClick(e) {

    const point = e.currentTarget,
        id = point.dataset.id,
        form = findFormById(id);

    // Логика: если есть открытая форма, то сворачиваем её
    const showedForm = findShowedForm();

    if (showedForm) {
        hideForm(showedForm);
    }

    // При клике на точку следующая логика: если форма для этой точки показана, то сворачиваем, и наоборот
    (isShowedForm(form)) ? hideForm(form) : showForm(form);
}



// ------------------------ Работа с формами ----------------------

// Методы, возвращающие результат

function isShowedForm(f) {
    return f.style.display !== 'none';
}

function isFormHasComments(f) {
    return f.querySelector(`.${CLASS_OLD_COMMENT}`) !== null;
}

function getTextAreaInForm(f) {
    return f.querySelector(`.${CLASS_TEXT}`);
}

function getTextInForm(f) {
    const ta = getTextAreaInForm(f);
    return ta.value.trim();
}

function isTextInForm(f) {
    return getTextInForm(f) !== '';
}

function getAllForms() {
    return document.querySelectorAll(`.${CLASS_FORM}`);
}

function findShowedForm() {
    const forms = getAllForms();
    return Array.from(forms).find(isShowedForm);
}

// Найти форму в DOMе по id
function findFormById(id) {
    return document.querySelector(`.${CLASS_FORM}[data-id='${id}']`);
}


// Методы, не возвращающие результат

function showForm(f) {
    f.style.display = 'block';
}

function clearTextInForm(f) {
    const ta = getTextAreaInForm(f);
    ta.value = '';
}

function deleteForm(f) {
    divComments.removeChild(f);
}

function hideForm(f) {
    const id = f.dataset.id,
        point = findPointById(id);

    // Проверка: если в форме ещё ни одного комментария и пустой текст, то удаляем точку и форму
    if (!isFormHasComments(f) && !isTextInForm(f)) {
        deletePoint(point);
        deleteForm(f);
    } else {
        // Иначе просто прячем её
        f.style.display = 'none';
    }
}

function hideAllForms() {
    const forms = getAllForms();
    Array.from(forms).forEach(hideForm);
}

// Нажали кнопку Закрыть внутри формы
function closeFormComment(e) {
    e.preventDefault();

    // Функция скрывает форму, на кнопке «Закрыть» которой сработало событие
    const form = e.currentTarget.closest('form');
    hideForm(form);
}

// Нажали кнопку «Добавить» на форме
function submitFormComment(e) {
    e.preventDefault();

    const form = e.currentTarget.closest('form');
    addNewComment(form);
}

// Функция создаёт по заданной структуре форму комментирования для заданной точки
function addForm(point, status) {

    // получаем массив блоков со старыми комментариями, дальше его деструктуризуем
    const comments = point.comments ? point.comments.map(p => createDivOldComment(p.author, p.text)) : [];

    const formStruct =
            e(
                'form',
                {
                    'class': CLASS_FORM,
                    'style': `position: absolute; left: ${point.x+15}px; top:${point.y}px;`,
                    'data-id': `${point.id}`
                },
                ...comments,									// деструктуризация комментариев
        e('textarea', { 'class': CLASS_TEXT }),
        e('button', { 'class': 'submit-comment'}, 'Добавить'),
        e('button', { 'class': 'close-comment'}, 'Закрыть'),
);

    const newForm = createElement(formStruct);

    divComments.appendChild(newForm);
    // навешиваем обработчик на кнопку «Добавить» в только что добавленной форме
    newForm.querySelector('.submit-comment').addEventListener('click', submitFormComment);

    // и на кнопку «Закрыть»
    newForm.querySelector('.close-comment').addEventListener('click', closeFormComment);

    // если прислан статус «Форма должна быть развёрнута», то показываем её, иначе — скрываем
    (status === POINT_EXPANDED) ? showForm(newForm) : hideForm(newForm);
}


// Совместная работа с точками и формами

function hideAllPointsAndForms() {
    hideAllPoints();
    hideAllForms();
}


// Загрузка картинки -->
inpImage.addEventListener('change', onUpload, false);

function onUpload() {
    setImageToCanvas(this.files[0]);
}

function setImageToCanvas(myFile) {
    canvas.style.backgroundImage = `url(${URL.createObjectURL(myFile)})`;
}
// <-- Загрузка картинки


// Дроп -->
canvas.addEventListener('drop', function(ev) {
    ev.preventDefault();
    var dt = ev.dataTransfer;
    var myFile;
    myFile = (dt.items) ? dt.items[0].getAsFile() : dt.files[0];
    setImageToCanvas(myFile);
});


// Без этого дроп не работает
canvas.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

// <-- Дроп


// Клик на картинке => новая точка комментирования -->
function newPointComment(e) {
    // Проверка: можно ли сейчас добавлять новую точку?
    // Логика: если есть открытая форма, то сворачиваем её, а не создаём новую точку
    const showedForm = findShowedForm();

    if (showedForm) {
        hideForm(showedForm);
    } else {
        const newPoint = generateNewPoint(e.pageX, e.pageY);
        addPoint(newPoint, POINT_EXPANDED);  // форма будет показана сразу
    }
}

hideAllPointsAndForms();


/*------------------------------ switches.js -------------------------*/
var menu = document.getElementsByClassName("menu")[0];
var burger = document.getElementsByClassName("burger")[0];


burger.addEventListener('click', function() {
    if (menu.dataset.state == 'initial' || menu.dataset.state == 'selected') {
        menu.dataset.state = "default";
    }
    let modes = new Array(document.getElementsByClassName("mode"))[0];
    modes = [].slice.call(modes);

    modes.forEach(function(mode) {
        mode.dataset.state = '';
    });
});

function modeOnClick(e) {
    if (this.dataset.state === '') {
        // Убираем обработчики секции Комментарии, скрываем точки и формы
        canvas.removeEventListener("click", newPointComment);
        hideAllPointsAndForms();

        // Убираем обработчики секции Рисование
        canvas.removeEventListener("mousedown", paintCanvasOnMouseDown);
        canvas.removeEventListener("mouseup", paintCanvasOnMouseUpLeave);
        canvas.removeEventListener("mouseleave", paintCanvasOnMouseUpLeave);
        canvas.removeEventListener("mousemove", paintCanvasOnMouseMove);
        canvas.removeEventListener('dblclick', clearPaint);


        this.dataset.state = "selected";
        menu.dataset.state = "selected";

        if (this.classList.contains('draw')) {
            canvas.addEventListener("mousedown", paintCanvasOnMouseDown);
            canvas.addEventListener("mouseup", paintCanvasOnMouseUpLeave);
            canvas.addEventListener("mouseleave", paintCanvasOnMouseUpLeave);
            canvas.addEventListener("mousemove", paintCanvasOnMouseMove);
            canvas.addEventListener('dblclick', clearPaint);
            tick();
        } else if (this.classList.contains('comments')) {
            if (document.querySelector('input.menu__toggle[type="radio"]').checked) {
                showAllPoints();
            }

            canvas.addEventListener('click', newPointComment);
        }
    }
}

let modes = new Array(document.getElementsByClassName("mode"))[0];
modes = [].slice.call(modes);

modes.forEach(function(mode) {
    mode.addEventListener('click', modeOnClick);
});



/*-------------------- Рисование -------------------------*/

// При двойном клике холст необходимо очистить.
function clearPaint(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // зачистка
    curves = []; // забываем все линии
}

//------------------------------------
let curves = [];
let drawing = false;
let needsRepaint = false;

let brush_radius = 5;


// При открытии страницы необходимо установить размер холста равным размеру окна браузера.
canvas.width = screen.width;
canvas.height = screen.height;
//console.log('Размер окна', canvas.width, canvas.height);
ctx.clearRect(0, 0, canvas.width, canvas.height);   // зачистка

// При изменении размеров окна браузера необходимо обновить размер холста и очистить его.
window.addEventListener('resize', function(e) {
    canvas.width = screen.width;
    canvas.height = screen.height;
    //console.log('Размер окна', canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);   // зачистка
    curves = []; // забываем все линии
});


// Отрисовка линии
function smoothCurve(points) {
    let lenPointsMinus1 = points.length - 1;
    for (let i = 0; i < lenPointsMinus1; i++) {
        ctx.beginPath();
        //Необходимо скруглить края линии, задав свойствам контекста lineJoin и lineCap значение round.
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = points[i].colorFill;
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineWidth = points[i].radius;
        ctx.lineTo(points[i+1].x, points[i+1].y);
        ctx.stroke();
    }
}

function makePoint(x, y) {
    let result = {
        x: x,
        y: y,
        radius: brush_radius,
        colorFill: document.querySelector('.draw-tools input[type="radio"]:checked').value
    }

    return result;
};

function paintCanvasOnMouseDown(evt) {
    drawing = true;

    const curve = []; // create a new curve

    curve.push(makePoint(evt.offsetX, evt.offsetY)); // add a new point
    curves.push(curve); // add the curve to the array of curves
    needsRepaint = true;
}

function paintCanvasOnMouseUpLeave(evt) {
    drawing = false;
}

function paintCanvasOnMouseMove(evt) {
    if (drawing) {
        // add a point

        const point = makePoint(evt.offsetX, evt.offsetY);
        curves[curves.length - 1].push(point);
        needsRepaint = true;
    }
}

// rendering
function repaint () {
    // clear before repainting
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    curves.forEach((curve) => smoothCurve(curve));
}

function tick () {
    if (needsRepaint) {
        repaint();
        needsRepaint = false;
    }

    window.requestAnimationFrame(tick);
}


document.querySelector('.menu__eraser').addEventListener('click', function(e) {
    if (curves.length > 0) {
        curves.pop();
        needsRepaint = true;
    }
});
