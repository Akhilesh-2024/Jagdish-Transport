
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('passwordForm');
    const inputs = {
        username: document.getElementById('username'),
        oldPassword: document.getElementById('oldPassword'),
        newPassword: document.getElementById('newPassword'),
        confirmPassword: document.getElementById('confirmPassword')
    };

    // Hide all errors on load
    Object.keys(inputs).forEach(key => {
        const errorMsg = document.getElementById(`${key}-error`);
        if (errorMsg) errorMsg.style.display = 'none';
    });

    let isUsernameValid = false;
    let usernameTimeout;
    let lastRequestId = 0;

    // ✅ Username input with debounce and server check
    inputs.username.addEventListener('input', () => {
        clearTimeout(usernameTimeout);
        const username = inputs.username.value.trim();
        usernameTimeout = setTimeout(() => {
            checkUsernameExists(username);
        }, 500);
    });

    // 🔍 Check if username exists (async)
    async function checkUsernameExists(username) {
        if (!username) {
            showError('username', 'Username is required');
            isUsernameValid = false;
            return;
        }

        const currentRequestId = ++lastRequestId;

        try {
            const response = await fetch(`http://localhost:8081/api/credential/username/${username}`);

            if (currentRequestId !== lastRequestId) return;

            if (response.ok) {
                isUsernameValid = true;
                hideError('username');
                showSuccess('username', 'Username found');
            } else {
                isUsernameValid = false;
                showError('username', 'Username not found');
            }
        } catch (error) {
            if (currentRequestId !== lastRequestId) return;
            isUsernameValid = false;
            showError('username', 'Error checking username');
        }
    }

    // 🔐 Current password field
    inputs.oldPassword.addEventListener('input', () => {
        if (!inputs.oldPassword.value) {
            showError('oldPassword', 'Current password is required');
        } else {
            hideError('oldPassword');
        }
    });

    // 🔐 New password validations
    inputs.newPassword.addEventListener('input', () => {
        validatePassword();
        if (inputs.confirmPassword.value) validatePasswordMatch();
    });

    // 🔁 Confirm password match
    inputs.confirmPassword.addEventListener('input', validatePasswordMatch);

    // ✅ Password strength check
    function validatePassword() {
        const password = inputs.newPassword.value;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        const missing = [];
        if (!checks.length) missing.push('8 characters');
        if (!checks.uppercase) missing.push('uppercase letter');
        if (!checks.lowercase) missing.push('lowercase letter');
        if (!checks.number) missing.push('number');
        if (!checks.special) missing.push('special character');

        if (missing.length > 0) {
            showError('newPassword', `Password must include: ${missing.join(', ')}`);
            updateStrengthMeter(Object.values(checks).filter(Boolean).length);
            return false;
        }

        hideError('newPassword');
        updateStrengthMeter(Object.values(checks).filter(Boolean).length);
        return true;
    }

    // 🔁 Confirm Password Match
    function validatePasswordMatch() {
        const newPass = inputs.newPassword.value;
        const confirmPass = inputs.confirmPassword.value;

        if (!confirmPass) {
            showError('confirmPassword', 'Please confirm your password');
            return false;
        }

        if (newPass !== confirmPass) {
            showError('confirmPassword', 'Passwords do not match');
            return false;
        }

        hideError('confirmPassword');
        return true;
    }

    // ❌ Show error
    function showError(fieldName, message) {
        const errorEl = document.getElementById(`${fieldName}-error`);
        const input = inputs[fieldName];
        if (errorEl) {
            errorEl.innerHTML = `<i class="fas fa-exclamation-circle message-icon"></i><span>${message}</span>`;
            errorEl.style.display = 'flex';
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    }

    // ✅ Hide error and show success icon
    function hideError(fieldName) {
        const errorEl = document.getElementById(`${fieldName}-error`);
        const input = inputs[fieldName];
        if (errorEl) {
            errorEl.style.display = 'none';
            input.classList.remove('invalid');
            input.classList.add('valid');
        }
    }

    // ✅ Show username success
    function showSuccess(fieldName, message) {
        const status = document.getElementById(`${fieldName}-status`);
        const input = inputs[fieldName];
        if (status) {
            status.innerHTML = `<i class="fas fa-check-circle message-icon"></i><span>${message}</span>`;
            status.className = 'success-message';
            status.style.display = 'flex';
            input.classList.add('valid');
            input.classList.remove('invalid');
            setTimeout(() => status.style.display = 'none', 3000);
        }
    }

    // 🔋 Strength meter update
    function updateStrengthMeter(score) {
        const meter = document.getElementById('strength-meter');
        const percentage = (score / 5) * 100;
        meter.style.width = `${percentage}%`;
        meter.style.backgroundColor =
            percentage <= 25 ? '#dc3545' :
            percentage <= 50 ? '#ffc107' :
            percentage <= 75 ? '#17a2b8' :
            '#28a745';
    }

    // 🚀 Submit password change request
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = inputs.username.value.trim();
        const oldPassword = inputs.oldPassword.value;
        const newPassword = inputs.newPassword.value;

        let hasErrors = false;

        if (!username) {
            showError('username', 'Username is required');
            hasErrors = true;
        }

        if (!isUsernameValid) {
            showError('username', 'Please enter a valid username');
            hasErrors = true;
        }

        if (!oldPassword) {
            showError('oldPassword', 'Current password is required');
            hasErrors = true;
        }

        if (!validatePassword()) hasErrors = true;
        if (!validatePasswordMatch()) hasErrors = true;

        if (hasErrors) return;

        try {
            const dto = { username, oldPassword, newPassword };

            const response = await fetch(`http://localhost:8081/api/credential/updatePassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });

            const message = await response.text();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: message,
                    timer: 2000,
                    showConfirmButton: false
                });
                form.reset();
                Object.values(inputs).forEach(input => {
                    input.classList.remove('valid', 'invalid');
                });
                document.getElementById('strength-meter').style.width = '0%';
            } else {
                if (message === 'Old password is incorrect') {
                    showError('oldPassword', message);
                } else if (message === 'Username not found') {
                    showError('username', message);
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: message
                    });
                }
            }

        } catch (error) {
            console.error("Submission failed:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred while changing the password.'
            });
        }
    });
});

