// ✅ Toggle password visibility
document.querySelector('.toggle-password').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }

    this.classList.toggle('active');
});

// ✅ Generate secure random session ID
function generateSessionId(length = 32) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

// ✅ Store session permanently using localStorage
function storeSession(username) {
    const sessionId = generateSessionId();
    localStorage.setItem("username", username);
    localStorage.setItem("sessionId", sessionId);
}

// ✅ Simulate login and store session
async function sendLoginToBackend() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        return;
    }

    // ✅ Fake login success
    const isValid = true;

    if (isValid) {
        storeSession(username);
    }
}

// ✅ Hook login button
document.getElementById("saveBtn").addEventListener("click", sendLoginToBackend);
