console.log('fill-form.js loaded');

function saveUserInfo() {
    console.log('saveUserInfo called');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userCard = document.getElementById('userCard');
    const formCard = document.getElementById('formCard');

    if (!userName || !userEmail || !userCard || !formCard) {
        console.error('DOM elements missing:', { userName, userEmail, userCard, formCard });
        alert('Error: Page elements not found. Please refresh and try again.');
        return;
    }

    if (!userName.value.trim() || !userEmail.value.trim()) {
        alert('Please fill in both Name and Email before saving.');
        return;
    }

    const userInfo = { name: userName.value.trim(), email: userEmail.value.trim(), timestamp: new Date().toISOString() };
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(userInfo);
    localStorage.setItem('users', JSON.stringify(users));

    if (typeof anime === 'undefined') {
        console.error('Anime.js not loaded');
        alert('Animation library not loaded. Falling back to basic transition.');
        userCard.style.display = 'none';
        formCard.style.display = 'block';
        return;
    }

    anime({
        targets: userCard,
        scale: [1, 1.3],
        duration: 400,
        easing: 'easeInOutQuad',
        complete: () => {
            console.log('Popping animation complete');
            userCard.classList.add('disappear');

            const colors = [
                '#FFD700', '#FFA500', '#DAA520', '#FF4500', '#00CED1', '#FF69B4'
            ];

            const pieceCount = 60;
            const pieces = [];
            console.log('Creating', pieceCount, 'crystal pieces');
            for (let i = 0; i < pieceCount; i++) {
                const piece = document.createElement('div');
                piece.className = 'shatter-piece';
                piece.style.position = 'absolute';
                piece.style.left = Math.random() * 100 + '%';
                piece.style.top = Math.random() * 100 + '%';
                piece.style.width = Math.random() * 6 + 2 + 'px';
                piece.style.height = Math.random() * 6 + 2 + 'px';
                piece.style.borderRadius = Math.random() > 0.8 ? '0' : '50%';
                const color = colors[Math.floor(Math.random() * colors.length)];
                piece.style.background = color;
                console.log(`Crystal ${i} color: ${color}`);
                piece.style.zIndex = '10';
                userCard.appendChild(piece);
                pieces.push(piece);
            }

            anime({
                targets: pieces,
                translateX: () => anime.random(-50, 50),
                translateY: () => anime.random(100, 200),
                rotate: () => anime.random(-90, 90),
                scale: [1, 0.1],
                opacity: [1, 0],
                duration: 800,
                easing: 'easeInQuad',
                delay: anime.stagger(10),
                complete: () => {
                    console.log('Crystal animation complete');
                    userCard.style.display = 'none';
                    pieces.forEach(piece => piece.remove());
                    formCard.style.display = 'block';
                    anime({
                        targets: formCard,
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        duration: 600,
                        easing: 'easeOutQuad',
                        complete: () => console.log('Form card animation complete')
                    });
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    const form = forms.find(f => f.id === formId);
    const formCard = document.getElementById('formCard');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const formTitle = document.getElementById('formTitle');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    if (!formCard || !saveUserBtn || !formTitle || !userName || !userEmail) {
        console.error('DOM elements missing:', { formCard, saveUserBtn, formTitle, userName, userEmail });
        alert('Error: Page elements not found. Please refresh and try again.');
        return;
    }

    saveUserBtn.addEventListener('click', saveUserInfo);

    function toggleSaveButton() {
        saveUserBtn.disabled = !(userName.value.trim() && userEmail.value.trim());
    }

    userName.addEventListener('input', toggleSaveButton);
    userEmail.addEventListener('input', toggleSaveButton);

    if (form) {
        formTitle.textContent = form.title || 'Untitled Form';
        const bioForm = document.getElementById('bioForm');
        bioForm.innerHTML = `
            ${form.questions.map(q => `
                <div class="card shadow-sm p-3 mb-3">
                    <label class="form-label">${q.question}</label>
                    <div>
                        ${q.options && q.options.length > 0 ? q.options.map((opt, index) => `
                            <div class="form-check">
                                <input type="${q.multiple ? 'checkbox' : 'radio'}" class="form-check-input" name="${q.question.replace(/ /g, '_')}" id="${q.question.replace(/ /g, '_')}_${index}" value="${opt}" ${q.multiple ? '' : 'required'}>
                                <label class="form-check-label" for="${q.question.replace(/ /g, '_')}_${index}">${opt}</label>
                            </div>
                        `).join('') : `
                            <input type="text" class="form-control" id="${q.question.replace(/ /g, '_')}" required>
                        `}
                    </div>
                </div>
            `).join('')}
            <button type="submit" class="btn btn-primary w-100">Submit</button>
        `;

        bioForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validate checkbox questions (at least one must be checked for MCQs with multiple=true)
            const checkboxQuestions = form.questions.filter(q => q.multiple && q.options && q.options.length > 0);
            for (const q of checkboxQuestions) {
                const inputs = document.querySelectorAll(`input[name="${q.question.replace(/ /g, '_')}"]`);
                const isAnyChecked = Array.from(inputs).some(input => input.checked);
                if (!isAnyChecked) {
                    alert(`Please select at least one option for "${q.question}".`);
                    return;
                }
            }

            const responses = form.questions.map(q => {
                const inputs = document.querySelectorAll(`input[name="${q.question.replace(/ /g, '_')}"]`);
                const answer = q.options && q.options.length > 0 ? Array.from(inputs)
                    .filter(input => input.checked)
                    .map(input => input.value) : document.getElementById(q.question.replace(/ /g, '_')).value.trim();
                return { question: q.question, answer: q.multiple && Array.isArray(answer) && answer.length > 1 ? answer : answer[0] || answer };
            });

            const submission = {
                formId,
                user: { name: userName.value.trim(), email: userEmail.value.trim(), timestamp: new Date().toISOString() },
                responses,
                timestamp: new Date().toISOString()
            };

            let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
            submissions.push(submission);
            localStorage.setItem('submissions', JSON.stringify(submissions));

            const submitMessage = document.getElementById('submitMessage');
            submitMessage.style.display = 'block';
            anime({
                targets: formCard,
                scale: [1, 0.5],
                opacity: [1, 0],
                duration: 600,
                easing: 'easeInQuad',
                complete: () => {
                    console.log('Form card vanish animation complete');
                    formCard.style.display = 'none';
                    submitMessage.style.display = 'none';
                    bioForm.reset();
                    userCard.classList.remove('disappear');
                    userCard.style.display = 'block';
                    anime({
                        targets: userCard,
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        duration: 600,
                        easing: 'easeOutQuad',
                        complete: () => console.log('User card reappear animation complete')
                    });
                }
            });
        });
    } else {
        formCard.innerHTML = '<h2 class="text-center">Form not found</h2>';
        formCard.style.display = 'block';
    }
});