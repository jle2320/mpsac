// Register
document.getElementById('registerAccountButton').addEventListener('click', async (e) => {
    e.preventDefault();

    const btn = e.target;
    btn.disabled = true;

    const inputFname = document.getElementById('inputFname').value.trim();
    const inputLname = document.getElementById('inputLname').value.trim();
    const inputBday = document.getElementById('inputBday').value;
    const inputGender = document.getElementById('inputGender').value;
    const inputEmail = document.getElementById('inputEmail').value.trim();
    const inputPhone = document.getElementById('inputPhone').value.trim();
    const inputPassword = document.getElementById('inputPassword').value;
    const inputConfirmPassword = document.getElementById('inputConfirmPassword').value;
    const inputAgreement = document.getElementById('inputAgreement').checked;

    // Required fields
    if (
        !inputFname ||
        !inputLname ||
        !inputBday ||
        !inputGender ||
        !inputEmail ||
        !inputPhone ||
        !inputPassword ||
        !inputConfirmPassword
    ) {
        btn.disabled = false;
        return showToast('⚠️ All fields are required.', 'warning'); 
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(inputEmail)) {
        btn.disabled = false;
        return showToast('⚠️ Please enter a valid email address.', 'warning');
    }

    // Phone validation
    const phoneRegex = /^09\d{9}$/;

    if (!phoneRegex.test(inputPhone)) {
        btn.disabled = false;
        return showToast('⚠️ Phone number must start with 09 and contain 11 digits.', 'warning');
    }

    // Standard password validation
    // Minimum 8 chars, uppercase, lowercase, number, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

    if (!passwordRegex.test(inputPassword)) {
        btn.disabled = false;
        return showToast('⚠️ Password must be at least 8 characters and include uppercase, lowercase, number, and special character.', 'warning');
    }

    // Confirm password
    if (inputPassword !== inputConfirmPassword) {
        btn.disabled = false;
        return showToast('⚠️ Passwords do not match.', 'warning');
    }

    // Agreement
    if (!inputAgreement) {
        btn.disabled = false;
        return showToast('⚠️ You must accept the terms and conditions.', 'warning');
    }

    try {

        const response = await fetch('/account/user/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: inputFname,
                lastName: inputLname,
                birthDate: inputBday,
                gender: inputGender,
                email: inputEmail,
                phoneNumber: inputPhone,
                password: inputPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            window.location = "/account/login";
        } else {
            btn.disabled = false;
            return showToast('⚠️ Invalid credentials', 'warning');
        }

    } catch (error) {
        btn.disabled = false;
        return showToast('❌ Something went wrong. Please try again.', 'error');
    }

});