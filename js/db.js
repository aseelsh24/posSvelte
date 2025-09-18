const DB = (() => {
    const DB_NAME = 'baqalaDB_v2'; // New DB name to avoid conflicts
    const DB_VERSION = 1;
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

                const stores = [
                    { name: 'products', key: 'id', indexes: ['name', 'barcode'] },
                    { name: 'sales', key: 'id', indexes: ['timestamp', 'customerId'] },
                    { name: 'purchases', key: 'id', indexes: ['timestamp', 'supplierId'] },
                    { name: 'suppliers', key: 'id', indexes: ['name'] },
                    { name: 'customers', key: 'id', indexes: ['name'] },
                    { name: 'users', key: 'id', indexes: ['username'] },
                    { name: 'settings', key: 'key' },
                    { name: 'counters', key: 'id' }
                ];

                stores.forEach(s => {
                    if (!db.objectStoreNames.contains(s.name)) {
                        const store = db.createObjectStore(s.name, { keyPath: s.key, autoIncrement: s.autoIncrement });
                        s.indexes?.forEach(idx => store.createIndex(idx, idx, { unique: false }));
                        log(`- Object store '${s.name}' created.`);
                    }
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

    return {
        init,
        bulkPut,
        count,
        log
    };
})();
