window.addEventListener('DOMContentLoaded', () => {
    const log = DB.log; // Use the logger from db.js
    log('Application loaded. Initializing...');

    // --- 1. Register Service Worker ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => log(`Service Worker registered successfully.`))
            .catch(err => log(`Service Worker registration failed: ${err}`));
    }

    // --- 2. Initialize the Database ---
    DB.init().catch(err => log(`FATAL: Could not initialize DB: ${err}`));

    // --- 3. Setup UI Event Listeners ---
    const loadDataBtn = document.getElementById('load-data-btn');
    loadDataBtn.addEventListener('click', handleLoadData);

    async function handleLoadData() {
        log('Load Data button clicked.');
        loadDataBtn.disabled = true;
        loadDataBtn.textContent = 'جارٍ التحميل...';

        try {
            // Check if data already exists
            const productCount = await DB.count('products');
            if (productCount > 0) {
                if (!confirm('قاعدة البيانات تحتوي على بيانات بالفعل. هل تريد الكتابة فوقها؟')) {
                    log('Data loading cancelled by user.');
                    loadDataBtn.disabled = false;
                    loadDataBtn.textContent = 'تحميل بيانات عيّنة';
                    return;
                }
                log('User chose to overwrite existing data.');
            }

            log('Fetching sample data from JSON file...');
            const response = await fetch('cr_samples/sample-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            log('Sample data fetched successfully.');

            // Populate all stores
            log('Starting bulk data insertion...');
            await Promise.all([
                DB.bulkPut('products', data.products),
                DB.bulkPut('customers', data.customers),
                DB.bulkPut('suppliers', data.suppliers),
                DB.bulkPut('users', data.users),
                DB.bulkPut('settings', data.settings),
                DB.bulkPut('counters', data.counters)
            ]);

            log('SUCCESS: All sample data has been loaded into the database.');
            document.getElementById('view-container').innerHTML = '<p style="color: green;">تم تحميل البيانات بنجاح!</p>';

        } catch (error) {
            log(`ERROR loading data: ${error}`);
            document.getElementById('view-container').innerHTML = `<p style="color: red;">فشل تحميل البيانات. تحقق من وحدة التحكم لمزيد من التفاصيل.</p>`;
        } finally {
            loadDataBtn.disabled = false;
            loadDataBtn.textContent = 'تحميل بيانات عيّنة';
        }
    }
});
