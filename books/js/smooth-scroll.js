'use strict';
const scrollButton = document.getElementById('scroll');
const body = document.querySelector('body');
const documentHeight = body.offsetHeight;

scrollButton.addEventListener('click', scrollToBottom);

document.addEventListener('wheel', toggleScroll);

function toggleScroll() {
    const value = window.pageYOffset;
    if(value === 0) {
        goToBottom(scrollButton);
        scrollButton.classList.remove('to-up');
        scrollButton.classList.add('to-down');
    } else if (documentHeight === (value + document.documentElement.clientHeight)) {
        goToTop(scrollButton);
        scrollButton.classList.add('to-up');
        scrollButton.classList.remove('to-down');
    } else {
        goToTop(scrollButton);
        scrollButton.classList.add('to-up');
        scrollButton.classList.remove('to-down');
    }
}

let angle = 0;
toggleScroll();

function goToTop(element) {
    if(angle <= 180) {
        element.style.transform = `rotate(${angle}deg)`;
        (function showMe() {
            if (angle < 180) {
                angle += 18;
                element.style.transform = `rotate(${angle}deg)`;
                requestAnimationFrame(showMe);
            }
        })();
    }
}

function goToBottom(element) {
    if(angle > 0) {
        element.style.transform = `rotate(${angle}deg)`;
        (function showMe() {
            if (angle > 0) {
                angle -= 18;
                element.style.transform = `rotate(${angle}deg)`;
                requestAnimationFrame(showMe);
            }
        })();
    }
}

function scrollToBottom() {
    if (scrollButton.classList.contains('to-down')) {
        scrollButton.classList.add('to-up');
        scrollButton.classList.remove('to-down');
        let step = window.pageYOffset;
        (function handleAnimation() {
            if (step <= documentHeight) {
                step += 200;
                scroll(0, step);
                requestAnimationFrame(handleAnimation);
            }
        })();
        goToTop(scrollButton);
    } else if (scrollButton.classList.contains('to-up')) {
        scrollButton.classList.remove('to-up');
        scrollButton.classList.add('to-down');
        let step = window.pageYOffset;
        (function handleAnimation() {
            if (step > 0) {
                step -= 200;
                scroll(0, step);
                requestAnimationFrame(handleAnimation);
            }
        })();
        goToBottom(scrollButton);
    }
}