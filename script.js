function initializeSecurity() {
    console.log('Security initialization placeholder');
}

function toggleInputs() {
    const title = document.getElementById('formTitle').value.trim();
    const inputControls = document.getElementById('inputControls');
    if (title) {
        inputControls.style.display = 'flex';
        adjustControlsPosition();
    } else {
        inputControls.style.display = 'none';
    }
}

function updateMCQType(checkbox) {
    const card = checkbox.closest('.input-card');
    const allowMultiple = checkbox.checked;
    const optionInputs = card.getElementsByClassName('option-input');
    for (let option of optionInputs) {
        const inputType = allowMultiple ? 'checkbox' : 'radio';
        option.querySelector('input[type="radio"], input[type="checkbox"]').type = inputType;
    }
}

function addTextInput() {
    const formInputs = document.getElementById('formInputs');
    const div = document.createElement('div');
    div.className = 'input-card';
    div.innerHTML = `
        <div class="mb-2">
            <input type="text" class="form-control mb-2" placeholder="Question" oninput="updateCard(this)">
            <button class="remove-btn" onclick="this.parentElement.parentElement.remove(); adjustControlsPosition();">Remove</button>
        </div>
    `;
    formInputs.appendChild(div);
    adjustControlsPosition();
}

function addMCQInput() {
    const formInputs = document.getElementById('formInputs');
    const div = document.createElement('div');
    div.className = 'input-card';
    div.innerHTML = `
        <div class="mb-2">
            <input type="text" class="form-control mb-2" placeholder="Question" oninput="updateCard(this)">
            <div class="mb-2">
                <label>Allow Multiple Options: </label>
                <input type="checkbox" onchange="updateMCQType(this)">
            </div>
            <div class="option-input">
                <input type="radio" disabled>
                <input type="text" class="form-control option-text" placeholder="Option 1">
            </div>
            <button class="add-option-btn" onclick="addOption(this)">Add Option</button>
            <button class="remove-btn" onclick="this.parentElement.parentElement.remove(); adjustControlsPosition();">Remove</button>
        </div>
    `;
    formInputs.appendChild(div);
    adjustControlsPosition();
}

function addOption(button) {
    const card = button.parentElement.parentElement;
    const allowMultiple = card.querySelector('input[type="checkbox"]').checked;
    const inputType = allowMultiple ? 'checkbox' : 'radio';
    const optionDiv = button.parentElement.querySelector('.option-input').cloneNode(true);
    optionDiv.querySelector('input[type="text"]').value = '';
    optionDiv.querySelector('input[type="radio"], input[type="checkbox"]').type = inputType;
    optionDiv.querySelector('input[type="radio"], input[type="checkbox"]').disabled = true;
    button.parentElement.insertBefore(optionDiv, button);
    adjustControlsPosition();
}

function updateCard(input) {
    const card = input.parentElement.parentElement;
    let question = card.querySelector('input[placeholder="Question"]')?.value || '';
    let hasOptions = card.querySelectorAll('.option-text').length > 0 && Array.from(card.querySelectorAll('.option-text')).some(opt => opt.value.trim());
    if (question || hasOptions) {
        card.style.backgroundColor = '#f1f8ff';
    } else {
        card.style.backgroundColor = 'transparent';
    }
}

function adjustControlsPosition() {
    const inputControls = document.getElementById('inputControls');
    const formInputs = document.getElementById('formInputs');
    const inputs = formInputs.getElementsByClassName('input-card');
    const titleInput = document.getElementById('formTitle');
    let newTop = 0;

    if (inputs.length > 0) {
        const lastCard = inputs[inputs.length - 1];
        const formInputsRect = formInputs.getBoundingClientRect();
        const lastCardRect = lastCard.getBoundingClientRect();
        newTop = (lastCardRect.bottom - formInputsRect.top) + formInputs.offsetTop + 15;
    } else {
        const titleRect = titleInput.getBoundingClientRect();
        const formInputsRect = formInputs.getBoundingClientRect();
        newTop = (titleRect.bottom - formInputsRect.top) + formInputs.offsetTop + 15;
    }

    inputControls.style.top = newTop + 'px';
}

function saveForm() {
    const title = document.getElementById('formTitle').value.trim();
    const formInputs = document.getElementById('formInputs');
    const inputs = formInputs.getElementsByClassName('input-card');
    const questions = [];

    for (let input of inputs) {
        const questionInput = input.querySelector('input[placeholder="Question"]');
        const optionInputs = input.querySelectorAll('.option-text');
        const allowMultipleCheckbox = input.querySelector('input[type="checkbox"]');
        const allowMultiple = allowMultipleCheckbox ? allowMultipleCheckbox.checked : false;
        if (questionInput) {
            const question = questionInput.value.trim();
            const options = Array.from(optionInputs).map(opt => opt.value.trim()).filter(opt => opt);
            questions.push({ question, options, multiple: allowMultiple });
        }
    }

    if (title && questions.length > 0) {
        const id = uuid.v4();
        const link = `http://127.0.0.1:5500/Fill%20Form/fill-form.html?id=${id}`;
        const formData = { id, title, questions, link, timestamp: new Date().toISOString() };
        let forms = JSON.parse(localStorage.getItem('forms') || '[]');
        forms.push(formData);
        localStorage.setItem('forms', JSON.stringify(forms));
        alert('Form saved successfully!');
        renderSavedForms();
        document.getElementById('formInputs').innerHTML = '';
        document.getElementById('formTitle').value = '';
        const inputControls = document.getElementById('inputControls');
        inputControls.style.display = 'none';
        // Reset position to align with formTitle
        const titleInput = document.getElementById('formTitle');
        const formInputs = document.getElementById('formInputs');
        const titleRect = titleInput.getBoundingClientRect();
        const formInputsRect = formInputs.getBoundingClientRect();
        const newTop = (titleRect.bottom - formInputsRect.top) + formInputs.offsetTop + 15;
        inputControls.style.top = newTop + 'px';
    } else {
        alert('Please enter a title and at least one question.');
    }
}

function renderSavedForms() {
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    const tbody = document.getElementById('savedFormsBody');
    tbody.innerHTML = '';
    forms.forEach(form => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${form.title}</td>
            <td><a href="${form.link}" target="_blank">${form.link}</a></td>
            <td>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <!-- Top row: View Responses and Copy Link -->
        <div style="margin-bottom: 10px;">
            <button class="btn btn-primary btn-sm action-btn" onclick="viewResponses('${form.id}')" style="margin-right: 8px;">
                View Responses
            </button>
            <button class="btn btn-secondary btn-sm action-btn" onclick="copyLink('${form.id}')">
                Copy Link
            </button>
        </div>

        <!-- Bottom row: Centered Delete button -->
        <div>
            <button class="btn btn-danger btn-sm action-btn" onclick="deleteForm('${form.id}')">
                Delete
            </button>
        </div>
    </div>
</td>
        `;
        tbody.appendChild(row);
    });
}

function viewResponses(id) {
    window.location.href = `Form%20Response/form-response.html?id=${id}`;
}

function copyLink(id) {
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    const form = forms.find(f => f.id === id);
    if (form) {
        navigator.clipboard.writeText(form.link).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

function deleteForm(id) {
    let forms = JSON.parse(localStorage.getItem('forms') || '[]');
    forms = forms.filter(form => form.id !== id);
    localStorage.setItem('forms', JSON.stringify(forms));
    renderSavedForms();
}

window.onload = function () {
    initializeSecurity();
    renderSavedForms();
    adjustControlsPosition();
};