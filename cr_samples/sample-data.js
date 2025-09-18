const sampleData = {
    products: [
        { id: 'prod-1', name: 'لبن كامل الدسم', barcode: '6291003000111', purchasePrice: 2.50, salePrice: 3.00, stock: 100, unit: 'علبة' },
        { id: 'prod-2', name: 'خبز أبيض', barcode: '6291003000222', purchasePrice: 1.00, salePrice: 1.50, stock: 50, unit: 'كيس' },
        { id: 'prod-3', name: 'بيض (12 حبة)', barcode: '6291003000333', purchasePrice: 5.00, salePrice: 6.00, stock: 30, unit: 'طبق' },
        { id: 'prod-4', name: 'زيت طبخ', barcode: '6291003000444', purchasePrice: 10.00, salePrice: 12.00, stock: 40, unit: 'زجاجة' },
        { id: 'prod-5', name: 'أرز بسمتي', barcode: '6291003000555', purchasePrice: 25.00, salePrice: 30.00, stock: 20, unit: 'كيس 5 كج' }
    ],
    customers: [
        { id: 'cust-1', name: 'زبون عام', phone: '000-000-0000', balance: 0 },
        { id: 'cust-2', name: 'أحمد محمود', phone: '555-123-4567', balance: -50.00 } // owes 50
    ],
    suppliers: [
        { id: 'supp-1', name: 'شركة الألبان المتحدة', phone: '800-SUP-MILK', balance: 1500.00 }, // we owe them 1500
        { id: 'supp-2', name: 'مخابز المدينة', phone: '800-SUP-BRED', balance: 0 }
    ]
};

// This check is to prevent 'exports is not defined' in browser environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sampleData;
}
