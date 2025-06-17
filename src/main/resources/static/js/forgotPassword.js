document.addEventListener('DOMContentLoaded', () => {
	
	// Fetch the email when the page loads
	    fetchUserEmail();
		
    const form = document.getElementById('forgotPasswordForm');
    const inputs = {
        username: document.getElementById('username'),
        otp: document.getElementById('otp'),
        newPassword: document.getElementById('newPassword'),
        confirmPassword: document.getElementById('confirmPassword')
    };

    Object.keys(inputs).forEach(key => {
        const errorMsg = document.getElementById(`${key}-error`);
        if (errorMsg) errorMsg.style.display = 'none';
    });

    let isUsernameValid = false;
    let usernameTimeout;
    let lastRequestId = 0;

    inputs.username.addEventListener('input', () => {
        const value = inputs.username.value.trim();
        clearTimeout(usernameTimeout);
        usernameTimeout = setTimeout(() => {
            checkUsernameExists(value);
        }, 500);
    });

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
            console.error("Error checking username:", error);
            showError('username', 'Error checking username');
            isUsernameValid = false;
        }
    }

    inputs.newPassword.addEventListener('input', () => {
        validatePassword();
        if (inputs.confirmPassword.value) {
            validatePasswordMatch();
        }
    });

    inputs.confirmPassword.addEventListener('input', validatePasswordMatch);

    function validatePassword() {
        const password = inputs.newPassword.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        const missing = [];
        if (!requirements.length) missing.push('8 characters');
        if (!requirements.uppercase) missing.push('uppercase letter');
        if (!requirements.lowercase) missing.push('lowercase letter');
        if (!requirements.number) missing.push('number');
        if (!requirements.special) missing.push('special character');

        if (missing.length > 0) {
            showError('newPassword', `Password must include: ${missing.join(', ')}`);
            return false;
        }

        hideError('newPassword');
        updateStrengthMeter(Object.values(requirements).filter(Boolean).length);
        return true;
    }

    function validatePasswordMatch() {
        const newPass = inputs.newPassword.value;
        const confirmPass = inputs.confirmPassword.value;
        const input = inputs.confirmPassword;
        const successIcon = input.parentElement.querySelector('.input-success-icon');

        if (!confirmPass) {
            showError('confirmPassword', 'Please confirm your password');
            input.classList.remove('valid');
            input.classList.add('invalid');
            if (successIcon) successIcon.style.opacity = '0';
            return false;
        }

        if (newPass !== confirmPass) {
            showError('confirmPassword', 'Passwords do not match');
            input.classList.remove('valid');
            input.classList.add('invalid');
            if (successIcon) successIcon.style.opacity = '0';
            return false;
        }

        hideError('confirmPassword');
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (successIcon) successIcon.style.opacity = '1';
        return true;
    }

    function showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const input = inputs[fieldName];
        const successIcon = input.parentElement.querySelector('.input-success-icon');

        if (errorElement) {
            errorElement.innerHTML = `
                <i class="fas fa-exclamation-circle message-icon"></i>
                <span>${message}</span>
            `;
            errorElement.classList.add('show');
            errorElement.style.display = 'flex';
            input.classList.add('invalid');
            input.classList.remove('valid');
            if (successIcon) successIcon.style.opacity = '0';
        }
    }

    function hideError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const input = inputs[fieldName];
        const successIcon = input.parentElement.querySelector('.input-success-icon');

        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.style.display = 'none';
            input.classList.remove('invalid');
            input.classList.add('valid');
            if (successIcon) successIcon.style.opacity = '1';
        }
    }

    function showSuccess(fieldName, message) {
        const input = inputs[fieldName];
        const successIcon = input.parentElement.querySelector('.input-success-icon');
        if (successIcon) successIcon.style.opacity = '1';
    }

    function updateStrengthMeter(strength) {
        const meter = document.getElementById('strength-meter');
        const percentage = (strength / 5) * 100;
        meter.style.width = `${percentage}%`;
        if (percentage <= 25) meter.style.backgroundColor = '#dc3545';
        else if (percentage <= 50) meter.style.backgroundColor = '#ffc107';
        else if (percentage <= 75) meter.style.backgroundColor = '#17a2b8';
        else meter.style.backgroundColor = '#28a745';
    }

    // ✅ SEND OTP BUTTON
    document.getElementById('sendOtpBtn').addEventListener('click', async () => {
        const username = inputs.username.value.trim();

        if (!username) {
            Swal.fire('Error', 'Please enter your username.', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8081/api/credential/sendOTP?username=${username}`, {
                method: 'POST'
            });

            const message = await response.text();

            if (response.ok) {
                Swal.fire('Success', message, 'success');
            } else {
                Swal.fire('Error', message, 'error');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            Swal.fire('Error', 'Something went wrong while sending OTP.', 'error');
        }
    });

    // ✅ FORM SUBMISSION
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = inputs.username.value.trim();
        const otp = inputs.otp.value.trim();
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

        if (!otp) {
            showError('otp', 'OTP is required');
            hasErrors = true;
        } else {
            hideError('otp');
        }

        if (!validatePassword()) hasErrors = true;
        if (!validatePasswordMatch()) hasErrors = true;

        if (hasErrors) {
            return;
        }

        try {
            const dto = {
                username: username,
                otp: otp,
                newPassword: newPassword
            };

            const response = await fetch(`http://localhost:8081/api/credential/forgetPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dto)
            });

            const message = await response.text();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Password Changed!',
                    text: message,
                    timer: 2000,
                    showConfirmButton: false
                });
                form.reset();
                Object.keys(inputs).forEach(key => {
                    inputs[key].classList.remove('valid', 'invalid');
                    const successIcon = inputs[key].parentElement.querySelector('.input-success-icon');
                    if (successIcon) successIcon.style.opacity = '0';
                });
                document.getElementById('strength-meter').style.width = '0%';
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Invalid OTP!',
                    text: message
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'An error occurred while updating your password.'
            });
        }
    });
});


// Function to fetch user email and update the display
function fetchUserEmail() {
    // Use the correct endpoint from your backend
    // Update this URL to match your actual backend endpoint
    fetch('http://localhost:8081/profile/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch email data: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            const email = data.email || 'default@gmail.com';
            updateMaskedEmail(email);
        })
        .catch(error => {
            console.error('Error fetching email:', error);
            // Use a default email when there's an error
            updateMaskedEmail('default@gmail.com');
        });
}

// Function to mask the email address
function updateMaskedEmail(email) {
    if (!email || email.indexOf('@') === -1) {
        email = 'default@gmail.com';
    }
    
    const parts = email.split('@');
    const username = parts[0];
    const domain = parts[1];
    
    // Show first 3 characters of username, mask the rest
    let maskedUsername = '';
    if (username.length <= 3) {
        maskedUsername = username.charAt(0) + '*'.repeat(username.length - 1);
    } else {
        maskedUsername = username.substring(0, 3) + '*'.repeat(username.length - 3);
    }
    
    const maskedEmail = maskedUsername + '@' + domain;

    // Find the element and update it
    const otpInfoElement = document.querySelector('.otp-info');
    if (otpInfoElement) {
        otpInfoElement.textContent = `(${maskedEmail})`;
        console.log("Email display updated");
    } else {
        console.error("Could not find element with class 'otp-info'");
    }
}
