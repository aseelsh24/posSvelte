window.addEventListener('DOMContentLoaded', () => {
    const log = DB.log;

    // --- DOM Elements ---
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUserDisplay = document.getElementById('current-user-display');
    const viewContainer = document.getElementById('view-container');
    const navButtons = document.querySelectorAll('.nav-btn');
    const usersNavBtn = document.getElementById('users-nav-btn');
    const settingsNavBtn = document.getElementById('settings-nav-btn');
    const usersView = document.getElementById('users-view');

    // --- App Initialization ---
    async function init() {
        log('Application starting...');
        // 1. Register SW
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => log('Service Worker registered.'))
                .catch(err => log(`SW Registration Error: ${err}`));
        }

        // 2. Init DB
        await DB.init();

        // 3. Check for initial setup
        const userCount = await DB.count('users');
        if (userCount === 0) {
            log('No users found. Creating initial Owner account...');
            await Auth.addUser('owner', '0000', 'Owner');
            log('Initial account created. Username: owner, PIN: 0000');
            alert('تم إنشاء حساب المالك الأولي.\nاسم المستخدم: owner\nالرقم السري: 0000\nالرجاء تسجيل الدخول وتغيير الرقم السري.');
        }

        // 4. Check session
        const currentUser = Auth.getCurrentUser();
        if (currentUser) {
            showMainApp(currentUser);
        } else {
            showLoginScreen();
        }
    }

    // --- UI State Management ---
    function showLoginScreen() {
        mainApp.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    }

    function showMainApp(user) {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');

        // Setup UI based on user
        currentUserDisplay.textContent = `${user.username} (${user.role})`;
        setupPermissions(user.role);
        setupNavigation();
        renderUsersView(); // Initial render for the users view
    }

    function setupPermissions(role) {
        // Hide/show nav buttons based on role
        usersNavBtn.classList.toggle('hidden', !Auth.checkPermission('Manager'));
        settingsNavBtn.classList.toggle('hidden', !Auth.checkPermission('Owner'));
    }

    function setupNavigation() {
        // Set initial view
        switchView('pos-view');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewId = btn.getAttribute('data-view');
                switchView(viewId);
            });
        });
    }

    function switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
        const newView = document.getElementById(viewId);
        if (newView) {
            newView.classList.add('active-view');
        }
    }

    // --- Event Handlers ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        const username = document.getElementById('username').value;
        const pin = document.getElementById('pin').value;

        try {
            const user = await Auth.login(username, pin);
            log(`User ${user.username} logged in.`);
            window.location.reload(); // Easiest way to reset app state
        } catch (error) {
            log(`Login failed: ${error.message}`);
            loginError.textContent = error.message;
        }
    });

    logoutBtn.addEventListener('click', () => {
        Auth.logout();
        log('User logged out.');
        window.location.reload();
    });

    // --- User Management View ---
    async function renderUsersView() {
        if (!Auth.checkPermission('Manager')) {
            usersView.innerHTML = '<p>ليس لديك الصلاحية لعرض هذه الصفحة.</p>';
            return;
        }

        const users = await Auth.getAllUsers();
        let userListHtml = '<ul>' + users.map(u => `<li>${u.username} (${u.role}) <button data-userid="${u.id}" class="delete-user-btn">حذف</button></li>`).join('') + '</ul>';

        let addUserFormHtml = `
            <hr>
            <h3>إضافة مستخدم جديد</h3>
            <form id="add-user-form">
                <input type="text" id="new-username" placeholder="اسم المستخدم" required>
                <input type="password" id="new-pin" placeholder="PIN" required>
                <select id="new-role">
                    <option value="Cashier">كاشير</option>
                    <option value="Manager">مدير</option>
                    <option value="Owner">مالك</option>
                </select>
                <button type="submit">إضافة</button>
                <p id="add-user-error" class="error-message"></p>
            </form>
        `;

        usersView.innerHTML = '<h2>إدارة المستخدمين</h2>' + userListHtml + addUserFormHtml;
    }

    // Event delegation for dynamically created buttons
    usersView.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-user-btn')) {
            const userId = e.target.dataset.userid;
            if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                try {
                    await Auth.deleteUser(userId);
                    log(`User ${userId} deleted.`);
                    renderUsersView(); // Re-render the list
                } catch (error) {
                    alert(error.message);
                    log(`Error deleting user: ${error.message}`);
                }
            }
        }
    });

    usersView.addEventListener('submit', async (e) => {
        if (e.target.id === 'add-user-form') {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const pin = document.getElementById('new-pin').value;
            const role = document.getElementById('new-role').value;
            const errorEl = document.getElementById('add-user-error');
            errorEl.textContent = '';

            try {
                await Auth.addUser(username, pin, role);
                log(`User ${username} added.`);
                renderUsersView();
            } catch (error) {
                errorEl.textContent = error.message;
                log(`Error adding user: ${error.message}`);
            }
        }
    });

    // --- Start the App ---
    init();
});
