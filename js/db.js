const DB = (() => {
    const DB_NAME = 'baqalaDB_v2'; // Keeping name same, bumping version
    const DB_VERSION = 2; // INCREMENTED VERSION
    let db;

    // --- Helper for logging to the screen ---
    const log = (message) => {
        const logContainer = document.getElementById('status-log');
        if (logContainer) {
            logContainer.textContent += `${new Date().toLocaleTimeString()}: ${message}\n`;
            logContainer.scrollTop = logContainer.scrollHeight;
        }
        console.log(message);
    };

    function init() {
        return new Promise((resolve, reject) => {
            log('Opening database...');
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                log('Database upgrade needed. Creating object stores...');

                // Re-defining stores to ensure schema is updated correctly
                const stores = [
                    { name: 'products', key: 'id', indexes: [{name: 'name'}, {name: 'barcode'}] },
                    { name: 'sales', key: 'id', indexes: [{name: 'timestamp'}, {name: 'customerId'}] },
                    { name: 'purchases', key: 'id', indexes: [{name: 'timestamp'}, {name: 'supplierId'}] },
                    { name: 'suppliers', key: 'id', indexes: [{name: 'name'}] },
                    { name: 'customers', key: 'id', indexes: [{name: 'name'}] },
                    { name: 'users', key: 'id', indexes: [{name: 'username', unique: true}] }, // USERNAME IS NOW UNIQUE
                    { name: 'settings', key: 'key' },
                    { name: 'counters', key: 'id' }
                ];

                stores.forEach(s => {
                    let store;
                    if (!db.objectStoreNames.contains(s.name)) {
                        store = db.createObjectStore(s.name, { keyPath: s.key });
                        log(`- Object store '${s.name}' created.`);
                    } else {
                        store = event.target.transaction.objectStore(s.name);
                    }

                    s.indexes?.forEach(idx => {
                        if (!store.indexNames.contains(idx.name)) {
                            store.createIndex(idx.name, idx.name, { unique: !!idx.unique });
                            log(`- Index '${idx.name}' created on store '${s.name}'.`);
                        }
                    });
                });
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                log('Database opened successfully.');
                resolve();
            };

            request.onerror = (event) => {
                log(`Database error: ${event.target.error}`);
                reject(event.target.error);
            };
        });
    }

    function getStore(storeName, mode = 'readonly') {
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    function bulkPut(storeName, items) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const promises = items.map(item => {
                return new Promise((res, rej) => {
                    const request = store.put(item);
                    request.onsuccess = () => res(request.result);
                    request.onerror = () => rej(request.error);
                });
            });
            Promise.all(promises).then(resolve).catch(reject);
        });
    }

    function count(storeName) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // --- Generic CRUD Functions ---

    function get(storeName, id) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function getAll(storeName) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function put(storeName, item) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const request = store.put(item);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function del(storeName, id) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // --- Specific Getters ---

    function getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const store = getStore('users');
            const index = store.index('username');
            const request = index.get(username);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    return {
        init,
        bulkPut,
        count,
        log,
        get,
        getAll,
        put,
        delete: del,
        getUserByUsername
    };
})();
