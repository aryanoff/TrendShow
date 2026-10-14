/**
 * TrendShow - Amazon Retailer Data Module
 * Dynamic client-side accessor connected to the central live ProductStore.
 * Zero static or fabricated fallback products.
 * Automatically synchronizes with live Google Sheets catalog updates.
 */

const AmazonProducts = {
    /**
     * Get all active Amazon products from the live catalog
     * @returns {Array} Array of normalized Amazon product records
     */
    getAll: function() {
        if (typeof window !== "undefined" && window.ProductStore) {
            return window.ProductStore.getByRetailer("amazon");
        }
        return [];
    },

    /**
     * Get Amazon deals matching a minimum discount threshold
     * @param {number} minDiscount Minimum percentage discount (default 50)
     * @returns {Array}
     */
    getDeals: function(minDiscount = 50) {
        return this.getAll().filter(p => (p.discountPercent || 0) >= minDiscount);
    },

    /**
     * Get Amazon products by category
     * @param {string} categoryId
     * @returns {Array}
     */
    getByCategory: function(categoryId) {
        if (!categoryId || categoryId === "all") return this.getAll();
        return this.getAll().filter(p => (p.category || "").toLowerCase() === categoryId.toLowerCase());
    },

    /**
     * Find a specific Amazon product by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getById: function(id) {
        if (!id) return null;
        return this.getAll().find(p => p.id === id) || null;
    },

    /**
     * Total number of live Amazon products
     */
    get count() {
        return this.getAll().length;
    }
};

/**
 * Backwards-compatibility wrapper for legacy boxData references
 */
const amazon_productData = {
    get boxData() {
        return AmazonProducts.getAll();
    }
};

// Global environment exports
if (typeof globalThis !== "undefined") {
    globalThis.AmazonProducts = AmazonProducts;
    globalThis.amazon_productData = amazon_productData;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        AmazonProducts,
        amazon_productData
    };
}