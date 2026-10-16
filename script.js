/* ==========================================================================
   SCRIPT.JS - Frontend Logic & Database API Connection
   ========================================================================== */

// Backend server API URL (where our Python/SQLite server runs)
const API_BASE_URL = "http://localhost:5000";

// ---------------------------------------------------------------------------
// 1. SELECT HTML ELEMENTS
// ---------------------------------------------------------------------------
// Tabs
const tabLoginBtn = document.getElementById("tabLoginBtn");
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Login Form Elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const rememberMe = document.getElementById("rememberMe");
const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");
const toggleLoginPasswordBtn = document.getElementById("toggleLoginPasswordBtn");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginBtnText = document.getElementById("loginBtnText");
const loginBtnLoader = document.getElementById("loginBtnLoader");
const demoFillBtn = document.getElementById("demoFillBtn");

// Register Form Elements
const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regRole = document.getElementById("regRole");
const regPassword = document.getElementById("regPassword");
const regNameError = document.getElementById("regNameError");
const regEmailError = document.getElementById("regEmailError");
const regPasswordError = document.getElementById("regPasswordError");
const toggleRegPasswordBtn = document.getElementById("toggleRegPasswordBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");
const regBtnText = document.getElementById("regBtnText");
const regBtnLoader = document.getElementById("regBtnLoader");

// Global Elements
const alertBox = document.getElementById("alertBox");
const alertIcon = document.getElementById("alertIcon");
const alertMessage = document.getElementById("alertMessage");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const dbStatusBadge = document.getElementById("dbStatusBadge");
const dbStatusText = document.getElementById("dbStatusText");

// Track whether the backend server is reachable
let isServerOnline = false;


// ---------------------------------------------------------------------------
// 2. CHECK DATABASE SERVER STATUS ON PAGE LOAD
// ---------------------------------------------------------------------------
async function checkDatabaseConnection() {
    const dot = dbStatusBadge.querySelector(".status-dot");
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`, { method: "GET" });
        if (response.ok) {
            const data = await response.json();
            isServerOnline = true;
            dot.className = "status-dot online";
            dbStatusText.textContent = `🟢 Database Connected (${data.database})`;
            return;
        }
    } catch (err) {
        // If fetch fails, server is not running yet
        isServerOnline = false;
        dot.className = "status-dot offline";
        dbStatusText.textContent = "🟡 Offline Demo Mode";
    }
}

// Call on startup
checkDatabaseConnection();


// ---------------------------------------------------------------------------
// 3. TAB SWITCHING (Sign In <--> Register)
// ---------------------------------------------------------------------------
tabLoginBtn.addEventListener("click", function () {
    tabLoginBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    hideAlert();
    clearErrors();
});

tabRegisterBtn.addEventListener("click", function () {
    tabRegisterBtn.classList.add("active");
    tabLoginBtn.classList.remove("active");
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    hideAlert();
    clearErrors();
});


// ---------------------------------------------------------------------------
// 4. PASSWORD VISIBILITY TOGGLES (Show / Hide)
// ---------------------------------------------------------------------------
function setupPasswordToggle(button, inputField) {
    button.addEventListener("click", function () {
        if (inputField.type === "password") {
            inputField.type = "text";
            button.textContent = "🙈";
            button.setAttribute("aria-label", "Hide password");
        } else {
            inputField.type = "password";
            button.textContent = "👁️";
            button.setAttribute("aria-label", "Show password");
        }
    });
}

setupPasswordToggle(toggleLoginPasswordBtn, loginPassword);
setupPasswordToggle(toggleRegPasswordBtn, regPassword);


// ---------------------------------------------------------------------------
// 5. ALERT NOTIFICATION HELPERS
// ---------------------------------------------------------------------------
function showAlert(message, type) {
    alertBox.style.display = "flex";
    alertBox.className = `alert-box ${type}`;
    alertMessage.textContent = message;
    alertIcon.textContent = type === "success" ? "✅" : "⚠️";
}

function hideAlert() {
    alertBox.style.display = "none";
}

function clearErrors() {
    loginEmailError.textContent = "";
    loginPasswordError.textContent = "";
    loginEmail.classList.remove("input-error");
    loginPassword.classList.remove("input-error");

    regNameError.textContent = "";
    regEmailError.textContent = "";
    regPasswordError.textContent = "";
    regName.classList.remove("input-error");
    regEmail.classList.remove("input-error");
    regPassword.classList.remove("input-error");
}

function isValidEmail(text) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(text);
}


// ---------------------------------------------------------------------------
// 6. HANDLING LOGIN FORM SUBMISSION
// ---------------------------------------------------------------------------
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Stop normal page reload
    clearErrors();
    hideAlert();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    // Validation checks
    let hasError = false;
    if (email === "") {
        loginEmailError.textContent = "Please enter your email address.";
        loginEmail.classList.add("input-error");
        hasError = true;
    } else if (!isValidEmail(email)) {
        loginEmailError.textContent = "Please enter a valid email (e.g. name@campus.edu).";
        loginEmail.classList.add("input-error");
        hasError = true;
    }

    if (password === "") {
        loginPasswordError.textContent = "Please enter your password.";
        loginPassword.classList.add("input-error");
        hasError = true;
    }

    if (hasError) return;

    // Loading state
    loginSubmitBtn.disabled = true;
    loginBtnText.textContent = "Authenticating...";
    loginBtnLoader.style.display = "inline-block";

    // -----------------------------------------------------------------------
    // A. If Backend Server is Online -> Send request to SQLite Database
    // -----------------------------------------------------------------------
    if (isServerOnline) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert(`${result.message} (${result.user.role}) - Redirecting to Dashboard...`, "success");
                loginBtnText.textContent = "Success!";
            } else {
                showAlert(result.message || "Invalid credentials.", "error");
                loginSubmitBtn.disabled = false;
                loginBtnText.textContent = "Sign In to Dashboard";
            }
        } catch (error) {
            showAlert("Could not connect to database server. Using offline test mode.", "error");
            isServerOnline = false;
        } finally {
            loginBtnLoader.style.display = "none";
        }
    } 
    // -----------------------------------------------------------------------
    // B. If Offline Demo Mode -> Friendly Simulated Login
    // -----------------------------------------------------------------------
    else {
        setTimeout(function () {
            loginBtnLoader.style.display = "none";
            loginSubmitBtn.disabled = false;
            loginBtnText.textContent = "Sign In to Dashboard";

            if (email === "student@campus.edu" && (password === "incubate2026" || password.includes("123"))) {
                showAlert("Welcome! (Offline Demo Mode). Run 'python server.py' to use real SQLite database.", "success");
            } else {
                showAlert("Invalid credentials! Click the Demo button below or start 'python server.py'.", "error");
            }
        }, 800);
    }
});


// ---------------------------------------------------------------------------
// 7. HANDLING REGISTRATION FORM SUBMISSION (Save to Database)
// ---------------------------------------------------------------------------
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();
    hideAlert();

    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    const role = regRole.value;

    // Validation
    let hasError = false;
    if (name === "") {
        regNameError.textContent = "Please enter your full name.";
        regName.classList.add("input-error");
        hasError = true;
    }

    if (email === "") {
        regEmailError.textContent = "Please enter your email.";
        regEmail.classList.add("input-error");
        hasError = true;
    } else if (!isValidEmail(email)) {
        regEmailError.textContent = "Please enter a valid email format.";
        regEmail.classList.add("input-error");
        hasError = true;
    }

    if (password.length < 6) {
        regPasswordError.textContent = "Password must be at least 6 characters.";
        regPassword.classList.add("input-error");
        hasError = true;
    }

    if (hasError) return;

    // Loading state
    registerSubmitBtn.disabled = true;
    regBtnText.textContent = "Saving to Database...";
    regBtnLoader.style.display = "inline-block";

    if (isServerOnline) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, email: email, password: password, role: role })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAlert(result.message, "success");
                // Pre-fill the login form with newly registered email
                loginEmail.value = email;
                loginPassword.value = password;
                // Switch back to Login tab after 2 seconds
                setTimeout(() => { tabLoginBtn.click(); }, 2000);
            } else {
                showAlert(result.message || "Registration failed.", "error");
            }
        } catch (error) {
            showAlert("Error connecting to server. Is 'python server.py' running?", "error");
        } finally {
            registerSubmitBtn.disabled = false;
            regBtnText.textContent = "Register & Save in Database";
            regBtnLoader.style.display = "none";
        }
    } else {
        setTimeout(function () {
            registerSubmitBtn.disabled = false;
            regBtnText.textContent = "Register & Save in Database";
            regBtnLoader.style.display = "none";
            showAlert("Offline Mode: Start 'python server.py' in your terminal to save real accounts into SQLite!", "error");
        }, 800);
    }
});


// ---------------------------------------------------------------------------
// 8. DEMO AUTO-FILL BUTTON
// ---------------------------------------------------------------------------
demoFillBtn.addEventListener("click", function () {
    loginEmail.value = "student@campus.edu";
    loginPassword.value = "incubate2026";
    rememberMe.checked = true;
    clearErrors();
    showAlert("Loaded demo credentials! Click 'Sign In' to test.", "success");
});

// Forgot password placeholder
forgotPasswordLink.addEventListener("click", function (e) {
    e.preventDefault();
    showAlert("In a full system, a secure reset token is emailed to you. Contact admin for manual reset.", "error");
});
