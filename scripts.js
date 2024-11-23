document.addEventListener("DOMContentLoaded", function() {
    var acceptButton = document.getElementById('acceptButton');
    var privacyNotice = document.getElementById('privacyNotice');

    // Sprawdzenie, czy użytkownik zaakceptował ciasteczka
    if (localStorage.getItem('cookiesAccepted') === 'true') {
        privacyNotice.classList.add('hidden');
    }

    acceptButton.addEventListener('click', function() {
        // Ukrycie powiadomienia i zapisanie stanu w localStorage
        privacyNotice.classList.add('hidden');
        localStorage.setItem('cookiesAccepted', 'true');
    });
});
function createLeaf() {
    const leaf = document.createElement('div');
    leaf.classList.add('leaf');

    // Ustaw losową pozycję startową z góry
    
    leaf.style.left = Math.random() * window.innerWidth - 50 + 'px';
    leaf.style.top = '-50px'; // Ustawiamy liść, aby zaczynał nad ekranem
    leaf.style.maxWidth = Window.innerWidth
    leaf.style.animationDuration = (Math.random() * 8 + 15) + 's'; // Czas spadania (3-8s)
    leaf.style.animationName = 'fall';

  

    document.body.appendChild(leaf);

    // Usuń liść po zakończeniu animacji
    leaf.addEventListener('animationend', () => {
        leaf.remove();
    });
}

// Twórz liście co 500ms
setInterval(createLeaf, 300);
