const toggleBtn   = document.getElementById('togglePassword');
const passInput   = document.getElementById('adminPassword');
const eyeIcon     = document.getElementById('eyeIcon');

toggleBtn.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeIcon.innerHTML = isHidden
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

const form      = document.getElementById('adminLoginForm');
const submitBtn = document.getElementById('submitBtn');
const btnLabel  = document.getElementById('btnLabel');
const btnSpinner= document.getElementById('btnSpinner');

function showError(elId, msg) {
    const el = document.getElementById(elId);
    el.textContent = msg;
    el.classList.remove('hidden');
}
function hideError(elId) {
    document.getElementById(elId).classList.add('hidden');
}
function setLoading(state) {
    submitBtn.disabled = state;
    btnLabel.classList.toggle('hidden', state);
    btnSpinner.classList.toggle('hidden', !state);
}


submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    let valid = true;

    hideError('usernameError');
    hideError('passwordError');

    if (!username) { showError('usernameError', 'Please enter your username or email.'); valid = false; }
    if (!password) { showError('passwordError', 'Please enter your password.'); valid = false; }
    if (!valid) {
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 400);
    return;
    }

    setLoading(true);




    const response = await fetch('/a/postLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
        window.location = data.redirect;
    } else {
        setLoading(false);
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 400);
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            title: "Error!",
            text: data.message,
            icon: "error"
        });
    }
});
document.getElementById('adminUsername').addEventListener('input', () => hideError('usernameError'));
document.getElementById('adminPassword').addEventListener('input', () => hideError('passwordError'));