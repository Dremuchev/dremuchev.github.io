'use strict';
const connection = new WebSocket('wss://neto-api.herokuapp.com/chat');
const chat = document.getElementsByClassName('chat')[0];
const chatStatus = chat.getElementsByClassName('chat-status')[0];
const messageSubmit = chat.getElementsByClassName('message-submit')[0];
const messagesContent = chat.getElementsByClassName('messages-content')[0];
const messagesTemplates = chat.getElementsByClassName('messages-templates')[0];
const messageStatus = messagesTemplates.getElementsByClassName('message-status')[0];
const messagePersonal = messagesTemplates.getElementsByClassName('message-personal')[0];
const messageInput = chat.getElementsByClassName('message-input')[0];

window.addEventListener('beforeunload', () => connection.close());

connection.addEventListener('open', () => {
    messageInput.value = '';
    const cloneMessage = messageStatus.cloneNode(true);
    cloneMessage.getElementsByClassName('message-text')[0].innerText = 'Пользователь появился в сети';
    chatStatus.innerText = chatStatus.dataset.online;
    messageSubmit.disabled = false;
    messagesContent.appendChild(cloneMessage);
})

connection.addEventListener('message', event => {
    const responseMessage = event.data;
    const loading = messagesTemplates.getElementsByClassName('loading')[0];
    const messageFromUser = messagePersonal.previousElementSibling;
    const now = new Date();
    if(responseMessage === '...') {
        const loadingCopy = loading.cloneNode(true);
        messagesContent.appendChild(loadingCopy);
    } else {
        const loading = messagesContent.getElementsByClassName('loading')[0];
            if(loading) {
                loading.remove();
            }
        const messageFromUserCopy = messageFromUser.cloneNode(true);
        messageFromUserCopy.getElementsByClassName('message-text')[0].innerText = responseMessage;
        messageFromUserCopy.getElementsByClassName('timestamp')[0].innerText = timeParser(now);;
        messagesContent.appendChild(messageFromUserCopy);
    }
})

connection.addEventListener('close', event => {
    const messageStatusCopy = messageStatus.cloneNode(true);
    chatStatus.innerText = chatStatus.dataset.offline;
    messageSubmit.disabled = true;
    messagesContent.appendChild(messageStatusCopy);
})

messageSubmit.addEventListener('click', messageHandler);

function messageHandler(event) {
    event.preventDefault();
    if (messageInput.value) {
        const messagePersonalCopy = messagePersonal.cloneNode(true);
        const now = new Date();
        messagePersonalCopy.getElementsByClassName('message-text')[0].innerText = messageInput.value;
        messagePersonalCopy.getElementsByClassName('timestamp')[0].innerText = timeParser(now);
        messagesContent.appendChild(messagePersonalCopy);
        connection.send(messageInput.value);
        messageInput.value = '';
    }
}

function timeParser(nowDate) {
    const hh = (nowDate.getHours() < 10) ? '0' + nowDate.getHours() : nowDate.getHours();
    const mm = (nowDate.getMinutes() < 10) ? '0' + nowDate.getMinutes() : nowDate.getMinutes();
    return hh + ':' + mm;
}