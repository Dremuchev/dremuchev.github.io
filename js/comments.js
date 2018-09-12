'use strict';

//поправки

canvas.addEventListener("click", createNewComment);
// canvas.addEventListener('click', createComments);
document.querySelector('.app').addEventListener('click', messageHandler);
document.addEventListener('click', markerClick);
document.addEventListener('click', closeForm);
menuToggle.addEventListener('click', toggleComments);

// переключатель видимости комментариев

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
        removeEmptyComment();
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

// удаляет пустую форму из DOM

function removeEmptyComment() {
    console.log(`Запущена функция removeEmptyComment()`);
    const isNewComment = document.getElementsByClassName('comments__form new')[0];
    console.log(isNewComment);
    if (isNewComment) {
        document.querySelector('.app').removeChild(isNewComment);
    }
}

// закрытие текущей формы

function closeForm(event) {
    if (event.target.className === 'comments__close') {
        console.log(`Запущена функция closeForm()`);
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

// функция удаления всех существующих форм из DOM

function clearForms() {
    if (document.querySelector('.comments__form')) {
        console.log(`Запущена функция clearForms()`);
        const forms = document.querySelectorAll('.comments__form');
        console.log("TCL: clearForms -> forms", forms);
        for (const form of forms) {
            document.querySelector('.app').removeChild(form);
        }
    }
}

// функция создания новой (пустой) формы

function createNewComment(event) {
    const isCommentsOn = document.getElementById('comments-on').checked;
    if (comments.dataset.state === 'selected' && isCommentsOn) {
        console.log(`Запущена функция createNewComment()`);
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

// обработка ввода нового комментария и создание объекта с параметрами нового комментария

function messageHandler(event) {
    if (event.target.className === 'comments__submit') {
    console.log(`Запущена функция messageHandler()`);
        event.preventDefault();
        const element = event.target.parentNode.querySelector('textarea');
        const form = event.target.parentNode.parentNode;
        const pic = document.querySelector("img");
        const imageHeight = pic.getBoundingClientRect().height;
        const imageWidth = pic.getBoundingClientRect().width;
        const imageLeft = pic.getBoundingClientRect().x;
        const imageTop = pic.getBoundingClientRect().y;

        if (element.value) {
            const comment = {
                'message': element.value, 
                'left': ((parseFloat(form.style.left) - imageLeft) / imageWidth).toFixed(3), 
                'top': ((parseFloat(form.style.top) - imageTop) / imageHeight).toFixed(3)
            };
            needReload = true;
            sendNewComment(sessionStorage.id, comment, form);
            element.value = '';
        }
    }
}

// создание массива с коментариями, полученными с сервера

function createCommentsArray(comments) {
    console.log(`Запущена функция createCommentsArray()`);
    const commentArray = [];

    console.log('TCL: createCommentsArray -> commentArray', commentArray);

    for (const comment in comments) {
        commentArray.push(comments[comment]);
    }
    clearForms();
    createCommentForm(commentArray);
}

// наполнение DOM комментариями

function createCommentForm(comments) {
    console.log('TCL: createCommentForm -> comments', comments);
    console.log(`Запущена функция createCommentForm()`);
    const app = document.querySelector('.app');

    const imageHeight = document.querySelector('img').getBoundingClientRect().height;
    const imageWidth = document.querySelector('img').getBoundingClientRect().width;
    const imageLeft = document.querySelector('img').getBoundingClientRect().x;
    const imageTop = document.querySelector('img').getBoundingClientRect().y;

    for (let comment of comments) {
        console.log('TCL: createCommentForm -> comment', comment);
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

        const current = document.querySelector(`.comments__form[data-aspect-left='${comment.left}'], [data-aspect-top='${comment.top}']`);

        if (!current) {
            commentsBody.appendChild(commit);
            form.style.left = `${imageWidth * comment.left + imageLeft}px`;
            form.style.top = `${comment.top * imageHeight + imageTop}px`;
            form.dataset.aspectLeft = comment.left;
            form.dataset.aspectTop = comment.top;
            app.appendChild(form);
        } else {
            form.dataset.aspectLeft = comment.left;
            form.dataset.aspectTop = comment.top;
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
    console.log(target)
    console.log(`Запущена функция appendComment()`);
    const comments = target.querySelector('.comments__body').querySelectorAll('.comment');
    closeAllForms();
    if (target) {
        target.querySelector('.comments__body').insertBefore(element, target.querySelector('.load'));
        target.querySelector('.comments__body').style.display = 'block';
    }
    needReload = false;
}

    // переписал создание новой формы комментариев

    function createComments(event) {
        const isCommentsOn = document.getElementById('comments-on').checked;
        if (comments.dataset.state === 'selected' && isCommentsOn) {
            removeEmptyComment();
            closeAllForms();
            const app = document.querySelector('.app');
            const emptyFragment = document.createDocumentFragment();
            emptyFragment.appendChild(commentTemplateEngine(commentTemplate(event)));
            app.appendChild(emptyFragment);
            const newComment = document.querySelector('.comments__form new');
            console.log(newComment)
            newComment.querySelector('.comments__close')
                .addEventListener('click', removeEmptyComment);
            newComment.style.left = event.pageX + "px";
            newComment.style.top = event.pageY + "px";
        }
    }

    function commentTemplateEngine(comment) {
        if (comment === undefined || comment === null || comment === false) {
            return document.createTextNode("");
        }

        if (typeof comment === "string" || typeof comment === "number") {
            return document.createTextNode(comment);
        }

        if (Array.isArray(comment)) {
            return comment.reduce((emptyElement, el) => {
                emptyElement.appendChild(commentTemplateEngine(el));
                return emptyElement;
            }, document.createDocumentFragment())
        }

        const element = document.createElement(comment.tag || "div");

        [].concat(comment.className || []).forEach(cls => element.classList.add(cls));

        if (comment.attr) {
            Object.keys(comment.attr).forEach(key => element.setAttribute(key, comment.attr[key]));
        }

        element.appendChild(commentTemplateEngine(comment.content));

        return element;
    }

    function commentTemplate(event) {
        return {
            tag: 'div', 
            className: ['comments__form', 'new'],
            attr: { style: `left: ${event.pageX}px; top: ${event.pageY}px` },
            content: [
                { 
                    tag: 'span', 
                    className: 'comments__marker' 
                },

                { 
                    tag: 'div', 
                    className: 'comments__body', 
                    attr: { style: 'display: block' }, 
                    content: [
                        { 
                            tag: 'div', 
                            className: 'comment', 
                            content: [
                                {
                                    tag: 'div', 
                                    className: ['loader', 'hidden'], 
                                    content: [
                                        { tag: 'span' },
                                        { tag: 'span' },
                                        { tag: 'span' },
                                        { tag: 'span' },
                                        { tag: 'span' }
                                    ]
                                }
                            ] 
                        },
                        {
                            tag: 'textarea', 
                            className: 'comments__input', 
                            attr: { type: 'text', placeholder: 'Напишите ответ...' }
                        },
                        {
                            tag: 'input',
                            className: 'comments__close',
                            attr: { type: 'button', value: 'Закрыть' }
                        },
                        {
                            tag: 'input',
                            className: 'comments__submit',
                            attr: { type: 'submit', value: 'Отправить' }
                        }
                    ]
                }
            ]
        }
    }