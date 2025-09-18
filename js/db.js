const DB = (() => {
    const DB_NAME = 'baqalaDB';
    const DB_VERSION = 1;
    let db;

    // A simple UUID generator
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                console.log('Running onupgradeneeded');

                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productsStore = db.createObjectStore('products', { keyPath: 'id' });
                    productsStore.createIndex('name', 'name', { unique: false });
                    productsStore.createIndex('barcode', 'barcode', { unique: true });
                }

                // Sales store
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
                    salesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    salesStore.createIndex('customerId', 'customerId', { unique: false });
                }

                // Customers store
                if (!db.objectStoreNames.contains('customers')) {
                    const customersStore = db.createObjectStore('customers', { keyPath: 'id' });
                    customersStore.createIndex('name', 'name', { unique: false });
                }

                // Suppliers store
                if (!db.objectStoreNames.contains('suppliers')) {
                    const suppliersStore = db.createObjectStore('suppliers', { keyPath: 'id' });
                    suppliersStore.createIndex('name', 'name', { unique: false });
                }

                // Transactions store (for accounting)
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id' });
                    transactionsStore.createIndex('type', 'type', { unique: false });
                    transactionsStore.createIndex('partyId', 'partyId', { unique: false });
                    transactionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('Database opened successfully');
                resolve();
            };

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    function getStore(storeName, mode = 'readonly') {
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    function add(storeName, item) {
        return new Promise((resolve, reject) => {
            const store = getStore(storeName, 'readwrite');
            // Assign a UUID if no ID is provided
            if (!item.id) {
                item.id = generateUUID();
            }
            const request = store.add(item);
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
        add,
        put,
        get,
        getAll,
        count,
        generateUUID
    };
})();
