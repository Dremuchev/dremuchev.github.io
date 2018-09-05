'use strict';

const mainContent =  document.querySelector('.main-content');
const mainForm = document.querySelector('.main-form');
const formFields = document.querySelector('.book-form-fieldset');

document.addEventListener('click', handleClick);
formFields.addEventListener('input', handleInput);

// Переход от формы к списку и обратно
function goTo(target) {
    if (target === 'content') {
        mainContent.classList.remove('hidden');
        mainForm.classList.add('hidden');
        localStorage.clear();
    }

    if (target === 'form') {
        mainContent.classList.add('hidden');
        mainForm.classList.remove('hidden');
    }
}

// Нажатие кнопок
function handleClick(event) {

// Нажатие кнопки "Реадктировать"
    if (event.target.classList.contains('edit')) {
        const currentBook = event.target.parentNode.parentNode;
        currentBook.classList.add('editing');

        const title = currentBook.querySelector('.book-title');
        const author = currentBook.querySelector('.book-authors');
        const year = currentBook.querySelector('.book-publish');
        const pic = currentBook.querySelector('img');

        document.getElementById('input-title').value = title.innerText;
        document.getElementById('input-author').value = author.innerText;
        document.getElementById('input-publish').value = year.innerText;
        document.getElementById('input-pic').value = pic.src;

        localStorage.setItem('title', title.innerText);
        localStorage.setItem('author', author.innerText);
        localStorage.setItem('year', year.innerText);
        localStorage.setItem('pic', pic.src);

        checkLocalStorage();
        goTo('form');
    }

// Нажатие кнопки "Удалить"
    if (event.target.classList.contains('delete')) {
        event.target.parentNode.parentNode.remove()
    }

// Нажатие кнопки "Добавить"
    if (event.target.classList.contains('btn-book-add')) {
        checkLocalStorage();
        document.querySelector('.book-form').reset();
        goTo('form');
    }

// Нажатие кнопки "Сохранить"
    if (event.target.classList.contains('btn-submit')) {
        event.preventDefault();
        const editingBook = document.querySelector('.editing');
        if (!editingBook) {
            checkLocalStorage();
            const newBook = createBookEngine(createBook(localStorage, true));
            mainContent.insertBefore(newBook, document.querySelector('.book-wrapper'));
            document.querySelector('.new-book img').addEventListener('error', toggleEmptyImage);
            document.querySelector('.new-book').classList.remove('new-book');
        } else {
            editingBook.querySelector('.book-title').textContent = localStorage.title;
            editingBook.querySelector('.book-authors').textContent = localStorage.author;
            editingBook.querySelector('.book-publish').textContent = localStorage.year;
            editingBook.querySelector('img').src = localStorage.pic || 'src/no-image.png';
            editingBook.querySelector('img').addEventListener('error', toggleEmptyImage);
            editingBook.classList.remove('editing');
        }
        goTo('content');
    }

// Нажатие кнопки "Отменить"
    if (event.target.classList.contains('btn-reset')) {
        goTo('content');
    }
}

// Проверка изображения книги
function toggleEmptyImage(event) {
    event.currentTarget.src= 'src/no-image.png';
}


// Запись данных локально для последующей отрисовки новой книги
function handleInput(event) {
    if (event.target.id === 'input-title') {
        localStorage.setItem('title', event.target.value);
    }


    if (event.target.id === 'input-author') {
        localStorage.setItem('author', event.target.value);
    }


    if (event.target.id === 'input-publish') {
        if(event.target.value > 2017) {
            event.target.value = 2017;
        }

        if (event.target.value.length > 4) {
            event.target.value = event.target.value.substr(0, 4);
        }

        localStorage.setItem('year', event.target.value);
    }


    if (event.target.id === 'input-pic') {
        localStorage.setItem('pic', event.target.value);
    }

    checkLocalStorage();
}

function checkLocalStorage() {
    if (localStorage.title && localStorage.author && localStorage.year) {
        document.querySelector('.btn-submit').classList.remove('hidden');
    } else {
        document.querySelector('.btn-submit').classList.add('hidden');
    }
}

mainContent.appendChild(createBookEngine(books.map(el => createBook(el))));


// Шаблонизатор в два прохода
function createBookEngine(book) {
    if ((book === undefined) || (book === null) || (book === false)) {
        return document.createTextNode('');
    }

    if ((typeof book === 'string') || (typeof book === 'number')) {
        return document.createTextNode(book);
    }

    if(Array.isArray(book)) {
        return book.reduce((emptyElement, el) => {
            emptyElement.appendChild(createBookEngine(el));
            return emptyElement;
        }, document.createDocumentFragment())
    }

    const element = document.createElement(book.tag || 'div');

    [].concat(book.cls || []).forEach(className => element.classList.add(className));

    if (book.attrs) {
        Object.keys(book.attrs).forEach(key => element.setAttribute(key, book.attrs[key]));
    }

    element.appendChild(createBookEngine(book.content));

    return element;
}

function createBook(item, isNewBook) {
    const array = [];
        array.push(
            { tag: 'div', cls: isNewBook ? ['book-wrapper', 'new-book'] : 'book-wrapper', content:
                [
                    { tag: 'div', cls: ['book', 'book-pic'], content:
                        { tag: 'img', attrs: { src: item.pic } }
                    },
                    { tag: 'div', cls: ['book', 'book-info-wrapper'], content:
                        [
                            { tag: 'div', cls: ['book-info', 'book-title'], content: item.title },
                            { tag: 'div', cls: ['book-info', 'book-authors'], content: item.author },
                            { tag: 'div', cls: ['book-info', 'book-publish'], content: item.year }
                        ]
                    },
                    { tag: 'div', cls: ['book', 'book-edit-conrols'], content:
                        [
                            { tag: 'button', cls: ['book-controls', 'edit'], content: 'Редактировать' },
                            { tag: 'button', cls: ['book-controls', 'delete'], content: 'Удалить' }
                        ]
                    }
                ]
            }
        )
    return array;
}