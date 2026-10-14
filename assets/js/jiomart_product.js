/**
 * TrendShow - JioMart Retailer Data Module
 * Dynamic client-side accessor connected to the central live ProductStore.
 * Zero static or fabricated fallback products.
 * Automatically synchronizes with live Google Sheets catalog updates.
 */

const JioMartProducts = {
    /**
     * Get all active JioMart products from the live catalog
     * @returns {Array} Array of normalized JioMart product records
     */
    getAll: function() {
        if (typeof window !== "undefined" && window.ProductStore) {
            return window.ProductStore.getByRetailer("jiomart");
        }
        return [];
    },

    /**
     * Get JioMart deals matching a minimum discount threshold
     * @param {number} minDiscount Minimum percentage discount (default 50)
     * @returns {Array}
     */
    getDeals: function(minDiscount = 50) {
        return this.getAll().filter(p => (p.discountPercent || 0) >= minDiscount);
    },

    /**
     * Get JioMart products by category
     * @param {string} categoryId
     * @returns {Array}
     */
    getByCategory: function(categoryId) {
        if (!categoryId || categoryId === "all") return this.getAll();
        return this.getAll().filter(p => (p.category || "").toLowerCase() === categoryId.toLowerCase());
    },

    /**
     * Find a specific JioMart product by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getById: function(id) {
        if (!id) return null;
        return this.getAll().find(p => p.id === id) || null;
    },

    /**
     * Total number of live JioMart products
     */
    get count() {
        return this.getAll().length;
    }
};

/**
 * Backwards-compatibility wrapper for legacy boxData references
 */
const jiomart_productData = {
    get boxData() {
        return JioMartProducts.getAll();
    }
};

// Global environment exports
if (typeof globalThis !== "undefined") {
    globalThis.JioMartProducts = JioMartProducts;
    globalThis.jiomart_productData = jiomart_productData;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        JioMartProducts,
        jiomart_productData
    };
}
