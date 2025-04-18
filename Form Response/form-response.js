document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    const form = forms.find(f => f.id === formId);
    const responsesBody = document.getElementById('responsesBody');
    const thead = document.querySelector('thead tr');
    const formTitleElement = document.getElementById('formTitle');

    // Set the card header to "Responses of [form title]"
    if (form && form.title) {
        formTitleElement.textContent = `Responses of ${form.title}`;
    } else {
        formTitleElement.textContent = 'Responses of Untitled Form';
    }

    // Dynamically add headers based on form questions
    if (form && form.questions && form.questions.length > 0) {
        form.questions.forEach(question => {
            const th = document.createElement('th');
            th.textContent = question.question;
            thead.appendChild(th);
        });
    }

    const formSubmissions = submissions.filter(sub => sub.formId === formId);

    formSubmissions.forEach(submission => {
        const row = document.createElement('tr');
        const responseData = submission.responses.reduce((acc, curr) => {
            // Handle multiple-choice questions by joining options with commas if array
            acc[curr.question] = Array.isArray(curr.answer) ? curr.answer.join(', ') : curr.answer || '';
            return acc;
        }, { email: submission.user.email, timestamp: submission.timestamp });

        console.log('Response Data for submission:', responseData); // Debug log

        let rowContent = `
            <td style="overflow: visible;">${responseData.email || ''}</td>
            <td style="overflow: visible;">${new Date(responseData.timestamp).toLocaleString() || ''}</td>
        `;

        // Add cells for each question's answer without truncation
        if (form && form.questions) {
            form.questions.forEach(question => {
                const response = responseData[question.question] || '';
                rowContent += `<td style="overflow: visible;">${response}</td>`;
            });
        }

        row.innerHTML = rowContent;
        responsesBody.appendChild(row);
    });

    if (formSubmissions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="2">No responses found</td>';
        responsesBody.appendChild(row);
    }

    // Adjust column widths dynamically based on content without truncation
    const rows = responsesBody.getElementsByTagName('tr');
    if (rows.length > 0) {
        const headers = thead.getElementsByTagName('th');
        for (let i = 0; i < headers.length; i++) {
            let maxWidth = headers[i].offsetWidth;
            // Check header width
            maxWidth = Math.max(maxWidth, headers[i].scrollWidth);
            // Check all cell widths in the column
            for (let row of rows) {
                const cells = row.getElementsByTagName('td');
                if (cells[i]) {
                    const cellWidth = cells[i].scrollWidth;
                    maxWidth = Math.max(maxWidth, cellWidth);
                }
            }
            // Set minimum width without enforcing truncation
            headers[i].style.minWidth = `${maxWidth + 30}px`;
            headers[i].style.overflow = 'visible';
            for (let row of rows) {
                const cells = row.getElementsByTagName('td');
                if (cells[i]) {
                    cells[i].style.minWidth = `${maxWidth + 30}px`;
                    cells[i].style.overflow = 'visible'; // Ensure no truncation
                    cells[i].style.maxWidth = 'none'; // Remove any max-width restriction
                }
            }
        }
    }
});