// Main application logic
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }

    // 2. Initialize the Database and populate with sample data if empty
    DB.init().then(async () => {
        console.log('Database initialized.');
        try {
            const productCount = await DB.count('products');
            if (productCount === 0) {
                console.log('Database is empty. Populating with sample data...');
                // Use Promise.all to wait for all data to be added
                await Promise.all([
                    ...sampleData.products.map(p => DB.add('products', p)),
                    ...sampleData.customers.map(c => DB.add('customers', c)),
                    ...sampleData.suppliers.map(s => DB.add('suppliers', s)),
                ]);
                console.log('Sample data populated successfully.');
            } else {
                console.log('Database already contains data.');
            }
        } catch (error) {
            console.error('Error during data population check:', error);
        }

        // Initial UI setup
        const viewContainer = document.getElementById('view-container');
        if (viewContainer) {
            viewContainer.innerHTML = '<p>التطبيق جاهز. اختر عرضًا من الأعلى.</p>';
        }
    });

    // 3. Add event listeners for navigation
    // (This is a placeholder for actual view switching logic)
    document.getElementById('pos-view-btn')?.addEventListener('click', () => {
        document.getElementById('view-container').innerHTML = '<h2>نقطة البيع</h2>';
    });
    document.getElementById('inventory-view-btn')?.addEventListener('click', () => {
        document.getElementById('view-container').innerHTML = '<h2>المخزون</h2>';
    });
    document.getElementById('reports-view-btn')?.addEventListener('click', () => {
        document.getElementById('view-container').innerHTML = '<h2>التقارير</h2>';
    });
});
