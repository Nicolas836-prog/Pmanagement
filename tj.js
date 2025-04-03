document.addEventListener('DOMContentLoaded', () => {
    // Verify CryptoJS is loaded
    if (typeof CryptoJS === 'undefined') {
        alert('Error: CryptoJS library not loaded. Password encryption unavailable.');
        return;
    }

    // DOM Elements
    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-view');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // App tabs
    const addTab = document.getElementById('add-tab');
    const savedTab = document.getElementById('saved-tab');
    const generatorTab = document.getElementById('generator-tab');
    const addView = document.getElementById('add-view');
    const savedView = document.getElementById('saved-view');
    const generatorView = document.getElementById('generator-view');
    
    // Password fields
    const addPasswordBtn = document.getElementById('addPassword');
    const viewPasswordBtn = document.getElementById('view-password');
    const passwordList = document.getElementById('passwordList');
    const websiteInput = document.getElementById('website');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const searchInput = document.getElementById('search');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const signupUsernameInput = document.getElementById('signup-username');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupConfirmInput = document.getElementById('signup-confirm');
    
    // Generator elements
    const generatedPasswordInput = document.getElementById('generated-password');
    const copyPasswordBtn = document.getElementById('copy-password');
    const usePasswordBtn = document.getElementById('use-password');
    
    // Strength meters
    const strengthMeters = document.querySelectorAll('.strength-meter');
    const strengthTexts = document.querySelectorAll('.strength-text');
    
    // State
    let currentUser = null;
    let users = [];
    let passwords = [];
    
    // Initialize with error handling
    try {
        const usersData = localStorage.getItem('users');
        const passwordsData = localStorage.getItem('passwords');
        
        users = usersData ? JSON.parse(usersData) : [];
        passwords = passwordsData ? JSON.parse(passwordsData) : [];
        
        // Validate loaded data
        if (!Array.isArray(users)) users = [];
        if (!Array.isArray(passwords)) passwords = [];
    } catch (e) {
        console.error('Error loading saved data:', e);
        users = [];
        passwords = [];
    }

    let viewingPassword = false;

    // Password strength checker
    const checkPasswordStrength = (password) => {
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return strength;
    };

    // Update strength meter
    const updateStrengthMeter = (password, meter, text) => {
        const strength = checkPasswordStrength(password);
        let color = '#ff4444';
        let message = 'Weak';
        
        if (strength >= 4) {
            color = '#ffc107';
            message = 'Medium';
        }
        if (strength >= 6) {
            color = '#4CAF50';
            message = 'Strong';
        }
        
        meter.style.width = `${(strength / 6) * 100}%`;
        meter.style.backgroundColor = color;
        text.textContent = message;
    };

    // Form validation
    const validateForm = (form) => {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('invalid');
                isValid = false;
            } else {
                input.classList.remove('invalid');
            }
        });
        
        return isValid;
    };

    // Tab Switching (Auth)
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    // Tab Switching (App)
    addTab.addEventListener('click', () => {
        addTab.classList.add('active');
        savedTab.classList.remove('active');
        generatorTab.classList.remove('active');
        addView.classList.add('active');
        savedView.classList.remove('active');
        generatorView.classList.remove('active');
    });

    savedTab.addEventListener('click', () => {
        savedTab.classList.add('active');
        addTab.classList.remove('active');
        generatorTab.classList.remove('active');
        savedView.classList.add('active');
        addView.classList.remove('active');
        generatorView.classList.remove('active');
        renderPasswords();
    });

    generatorTab.addEventListener('click', () => {
        generatorTab.classList.add('active');
        addTab.classList.remove('active');
        savedTab.classList.remove('active');
        generatorView.classList.add('active');
        addView.classList.remove('active');
        savedView.classList.remove('active');
    });

    // Authentication
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm(loginForm)) return;

        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            authView.style.display = 'none';
            appView.style.display = 'block';
            renderPasswords();
        } else {
            alert('Invalid username or password');
        }
    });

    // SIGNUP
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = signupUsernameInput.value.trim();
        const password = signupPasswordInput.value.trim();
        const confirmPassword = signupConfirmInput.value.trim();

        if (!username || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (users.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }

        const strength = checkPasswordStrength(password);
        if (strength < 3) {
            alert('Password too weak. Include uppercase, lowercase, numbers and special characters');
            return;
        }

        const newUser = { username, password };
        users.push(newUser);
        try {
            localStorage.setItem('users', JSON.stringify(users));
        } catch (e) {
            console.error('Error saving user:', e);
            alert('Error saving account. Please try again.');
            return;
        }

        alert('Sign up successful! Please login');
        signupUsernameInput.value = '';
        signupPasswordInput.value = '';
        signupConfirmInput.value = '';
        loginTab.click();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        authView.style.display = 'block';
        appView.style.display = 'none';
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';
        signupUsernameInput.value = '';
        signupPasswordInput.value = '';
        signupConfirmInput.value = '';
    });

    // Password Management
    function renderPasswords() {
        if (!currentUser) return;
        
        passwordList.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        const userPasswords = passwords.filter(p => 
            p.user === currentUser.username && 
            (p.website.toLowerCase().includes(searchTerm) || 
            p.username.toLowerCase().includes(searchTerm))
        );
        
        userPasswords.forEach((password, index) => {
            const tr = document.createElement('tr');
            
            try {
                // Improved decryption
                const salt = CryptoJS.enc.Hex.parse(password.salt);
                const key = CryptoJS.PBKDF2(
                    currentUser.username + 'SecretKey123',
                    salt,
                    { keySize: 512/32, iterations: 1000 }
                );
                
                const decrypted = CryptoJS.AES.decrypt(password.password, key, {
                    iv: salt,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC
                });
                
                const decryptedPassword = decrypted.toString(CryptoJS.enc.Utf8);
                
                if (!decryptedPassword) throw new Error('Decryption failed');
                
                tr.innerHTML = `
                    <td>${password.website}</td>
                    <td>${password.username}</td>
                    <td class="password-cell">
                        <span class="password-display">••••••••</span>
                        <span class="password-text" style="display: none;">${decryptedPassword}</span>
                    </td>
                    <td>
                        <div class="password-actions">
                            <button class="view-btn" data-index="${index}"><i class="fas fa-eye"></i></button>
                            <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                passwordList.appendChild(tr);
            } catch (e) {
                console.error('Error decrypting password:', e);
                // Show placeholder if decryption fails
                tr.innerHTML = `
                    <td>${password.website}</td>
                    <td>${password.username}</td>
                    <td>Error loading password</td>
                    <td>
                        <button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                passwordList.appendChild(tr);
            }
        });

        // View password toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const passwordCell = e.target.closest('tr').querySelector('.password-cell');
                const passwordDisplay = passwordCell.querySelector('.password-display');
                const passwordText = passwordCell.querySelector('.password-text');
                
                if (passwordDisplay.style.display === 'none') {
                    passwordDisplay.style.display = 'inline';
                    passwordText.style.display = 'none';
                    e.target.innerHTML = '<i class="fas fa-eye"></i>';
                } else {
                    passwordDisplay.style.display = 'none';
                    passwordText.style.display = 'inline';
                    e.target.innerHTML = '<i class="fas fa-eye-slash"></i>';
                }
            });
        });

        // Delete password
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('button').dataset.index;
                if (confirm('Are you sure you want to delete this password?')) {
                    passwords.splice(index, 1);
                    try {
                        localStorage.setItem('passwords', JSON.stringify(passwords));
                        renderPasswords();
                    } catch (e) {
                        console.error('Error saving passwords:', e);
                        alert('Error deleting password. Please try again.');
                    }
                }
            });
        });
    }

    // Add new password with improved encryption
    addPasswordBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login first');
            return;
        }

        const website = websiteInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!website || !username || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const strength = checkPasswordStrength(password);
        if (strength < 4 && !confirm('This password is weak. Are you sure you want to use it?')) {
            return;
        }

        try {
            // Generate random salt
            const salt = CryptoJS.lib.WordArray.random(128/8);
            
            // Create key using PBKDF2
            const key = CryptoJS.PBKDF2(
                currentUser.username + 'SecretKey123',
                salt,
                { keySize: 512/32, iterations: 1000 }
            );
            
            // Encrypt the password
            const encrypted = CryptoJS.AES.encrypt(password, key, {
                iv: salt,
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC
            });
            
            // Add to passwords array
            passwords.push({
                website,
                username,
                password: encrypted.toString(),
                salt: salt.toString(),
                user: currentUser.username
            });
            
            // Save to localStorage
            localStorage.setItem('passwords', JSON.stringify(passwords));
            
            // Update UI
            renderPasswords();
            websiteInput.value = '';
            usernameInput.value = '';
            passwordInput.value = '';
            
            alert('Password saved successfully!');
        } catch (e) {
            console.error('Error saving password:', e);
            console.log('Password being saved:', password);
            console.log('Current user:', currentUser);
            alert(`Error saving password: ${e.message}`);
        }
    });

    // Password Generator
    function generatePassword() {
        const length = parseInt(document.getElementById('length').value) || 12;
        const uppercase = document.getElementById('uppercase').checked;
        const lowercase = document.getElementById('lowercase').checked;
        const numbers = document.getElementById('numbers').checked;
        const special = document.getElementById('special').checked;

        let charset = '';
        if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers) charset += '0123456789';
        if (special) charset += '!@#$%^&*()';

        if (!charset) {
            alert('Please select at least one character type');
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        generatedPasswordInput.value = password;
        updateStrengthMeter(password, 
            document.querySelector('#generator-view .strength-meter'), 
            document.querySelector('#generator-view .strength-text'));
    }

    // Generator event listeners
    document.querySelectorAll('.generator-options input').forEach(input => {
        input.addEventListener('change', generatePassword);
    });

    document.getElementById('length').addEventListener('input', generatePassword);

    usePasswordBtn.addEventListener('click', () => {
        passwordInput.value = generatedPasswordInput.value;
        updateStrengthMeter(passwordInput.value, 
            document.querySelector('#add-view .strength-meter'), 
            document.querySelector('#add-view .strength-text'));
    });

    copyPasswordBtn.addEventListener('click', () => {
        generatedPasswordInput.select();
        document.execCommand('copy');
        alert('Password copied to clipboard!');
    });

    // Toggle password visibility
    viewPasswordBtn.addEventListener('click', () => {
        viewingPassword = !viewingPassword;
        passwordInput.type = viewingPassword ? 'text' : 'password';
        viewPasswordBtn.innerHTML = viewingPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });

    // Password strength monitoring
    passwordInput.addEventListener('input', () => {
        updateStrengthMeter(passwordInput.value, 
            document.querySelector('#add-view .strength-meter'), 
            document.querySelector('#add-view .strength-text'));
    });

    signupPasswordInput.addEventListener('input', () => {
        updateStrengthMeter(signupPasswordInput.value, 
            document.querySelector('#signup-form .strength-meter'), 
            document.querySelector('#signup-form .strength-text'));
    });

    // Search functionality
    searchInput.addEventListener('input', renderPasswords);

    // Initialize generator
    generatePassword();

    // Check localStorage availability
    function checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            console.error('LocalStorage not available:', e);
            return false;
        }
    }

    if (!checkLocalStorage()) {
        alert('Warning: LocalStorage is not available. Your data will not be saved.');
    }
});