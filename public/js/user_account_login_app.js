'use strict';

/* ── Show / hide password ── */
const pwInput   = document.getElementById('inputPassword');
const eyeShow   = document.getElementById('eyeShow');
const eyeHide   = document.getElementById('eyeHide');



document.getElementById('togglePassword').addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type   = isHidden ? 'text' : 'password';
    eyeShow.classList.toggle('hidden',  isHidden);
    eyeHide.classList.toggle('hidden', !isHidden);
});


document.getElementById('signInButton').addEventListener('click', async () => {
    const identifier = document.getElementById('inputIdentifier').value.trim();
    const password   = document.getElementById('inputPassword').value.trim();

    /* Basic validation */
    if (!identifier) {
        document.getElementById('inputIdentifier').classList.add('shake');
        setTimeout(() => document.getElementById('inputIdentifier').classList.remove('shake'), 500);
        showToast('⚠️ Enter your email or phone number', 'warning');
        return;
    }
    
    if (!password) {
        pwInput.classList.add('shake');
        setTimeout(() => pwInput.classList.remove('shake'), 500);
        showToast('⚠️ Enter your password', 'warning');
        return;
    }
    /* Loading state */
    document.getElementById('btnLabel').classList.add('hidden');
    document.getElementById('btnSpinner').classList.remove('hidden');

    try{
        const response = await fetch('/account/user/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber:identifier, password:password })
        });
        const data = await response.json();
        if (data.success) {
            window.location = "/";
        } else {
            document.getElementById('btnLabel').classList.remove('hidden');
            document.getElementById('btnSpinner').classList.add('hidden');
            showToast('❌ Invalid credential', 'warning');
        }
    }catch(error){
        document.getElementById('btnLabel').classList.remove('hidden');
        document.getElementById('btnSpinner').classList.add('hidden');
        showToast('❌ Unable to reach the server. Please try again', 'error');
    }
})


/* ── Allow Enter key to submit ── */
document.getElementById('signInForm').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('signInButton').click();
});




