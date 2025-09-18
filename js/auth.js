const Auth = (() => {
    const SESSION_KEY = 'baqala_session';
    const ROLES = {
        Owner: 3,
        Manager: 2,
        Cashier: 1
    };

    // --- Private Helper Functions ---

    // Hashes a string (PIN) using SHA-256
    async function hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // --- Public API ---

    async function login(username, pin) {
        const user = await DB.getUserByUsername(username);
        if (!user) {
            throw new Error('المستخدم غير موجود.');
        }

        const hashedPin = await hashPin(pin);
        if (hashedPin !== user.pinHash) {
            throw new Error('رقم التعريف الشخصي (PIN) غير صحيح.');
        }

        const session = {
            userId: user.id,
            username: user.username,
            role: user.role
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function getCurrentUser() {
        const session = sessionStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    function checkPermission(requiredRole) {
        const user = getCurrentUser();
        if (!user) return false;

        const userLevel = ROLES[user.role] || 0;
        const requiredLevel = ROLES[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }

    async function addUser(username, pin, role) {
        if (!username || !pin || !role) {
            throw new Error('الرجاء إدخال جميع الحقول.');
        }
        if (!ROLES[role]) {
            throw new Error('الدور غير صالح.');
        }

        const existingUser = await DB.getUserByUsername(username);
        if (existingUser) {
            throw new Error('اسم المستخدم موجود بالفعل.');
        }

        const pinHash = await hashPin(pin);
        const newUser = {
            id: `user-${Date.now()}`,
            username,
            pinHash,
            role,
            createdAt: new Date().toISOString()
        };
        await DB.put('users', newUser);
        return newUser;
    }

    async function updateUser(userId, updates) {
        const user = await DB.get('users', userId);
        if (!user) throw new Error("المستخدم غير موجود.");

        if (updates.pin) {
            updates.pinHash = await hashPin(updates.pin);
            delete updates.pin;
        }

        const updatedUser = { ...user, ...updates };
        await DB.put('users', updatedUser);
        return updatedUser;
    }

    async function deleteUser(userId) {
        // Prevent deleting the last owner
        const user = await DB.get('users', userId);
        if(user.role === 'Owner') {
            const allUsers = await DB.getAll('users');
            const ownerCount = allUsers.filter(u => u.role === 'Owner').length;
            if (ownerCount <= 1) {
                throw new Error('لا يمكن حذف المالك الأخير.');
            }
        }
        await DB.delete('users', userId);
    }

    function getAllUsers() {
        return DB.getAll('users');
    }


    return {
        login,
        logout,
        getCurrentUser,
        checkPermission,
        addUser,
        updateUser,
        deleteUser,
        getAllUsers,
        ROLES // Expose roles for UI building
    };
})();
