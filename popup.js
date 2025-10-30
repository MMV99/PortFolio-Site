const popupContainer = document.querySelector('.popup-container');
const closeBtn = document.querySelector('.close-btn');

function showPopup() {
    if (popupContainer) popupContainer.style.visibility = 'visible';
}

function closePopup() {
    if (popupContainer) popupContainer.style.visibility = 'hidden';
}

if (closeBtn) closeBtn.addEventListener('click', closePopup);
window.addEventListener('load', showPopup);
