/**
 * TrendShow - Meesho Retailer Data Module
 * Dynamic client-side accessor connected to the central live ProductStore.
 * Zero static or fabricated fallback products.
 * Automatically synchronizes with live Google Sheets catalog updates.
 */

const MeeshoProducts = {
    getAll: function() {
        if (typeof window !== "undefined" && window.ProductStore) {
            return window.ProductStore.getByRetailer("meesho");
        }
        return [];
    },

    getDeals: function(minDiscount = 50) {
        return this.getAll().filter(p => (p.discountPercent || 0) >= minDiscount);
    },

    getByCategory: function(categoryId) {
        if (!categoryId || categoryId === "all") return this.getAll();
        return this.getAll().filter(p => (p.category || "").toLowerCase() === categoryId.toLowerCase());
    },

    getById: function(id) {
        if (!id) return null;
        return this.getAll().find(p => p.id === id) || null;
    },

    get count() {
        return this.getAll().length;
    }
};

const meesho_productData = {
    get boxData() {
        return MeeshoProducts.getAll();
    }
};

if (typeof globalThis !== "undefined") {
    globalThis.MeeshoProducts = MeeshoProducts;
    globalThis.meesho_productData = meesho_productData;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        MeeshoProducts,
        meesho_productData
    };
}
