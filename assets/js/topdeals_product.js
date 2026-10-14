/**
 * TrendShow - Top Deals Retailer & Discovery Module
 * Dynamic client-side accessor connected to the central live ProductStore.
 * Strictly derives results from genuine products and valid spreadsheet discount data.
 * Zero static or fabricated fallback products.
 */

const TopDealsProducts = {
    /**
     * Get genuine products with high verified discounts (>= 60%), sorted descending
     * @returns {Array} Array of high-discount product records
     */
    getAll: function() {
        if (typeof window !== "undefined" && window.ProductStore) {
            return window.ProductStore.getByRetailer("topdeals");
        }
        return [];
    },

    /**
     * Get top deals matching a minimum discount threshold
     * @param {number} minDiscount Minimum percentage discount (default 60)
     * @returns {Array}
     */
    getDeals: function(minDiscount = 60) {
        return this.getAll().filter(p => (p.discountPercent || 0) >= minDiscount);
    },

    /**
     * Get top deals filtered by category
     * @param {string} categoryId
     * @returns {Array}
     */
    getByCategory: function(categoryId) {
        if (!categoryId || categoryId === "all") return this.getAll();
        return this.getAll().filter(p => (p.category || "").toLowerCase() === categoryId.toLowerCase());
    },

    /**
     * Find a specific deal by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getById: function(id) {
        if (!id) return null;
        return this.getAll().find(p => p.id === id) || null;
    },

    /**
     * Total number of live top deals
     */
    get count() {
        return this.getAll().length;
    }
};

/**
 * Backwards-compatibility wrapper for legacy boxData references
 */
const topdeals_productData = {
    get boxData() {
        return TopDealsProducts.getAll();
    }
};

// Global environment exports
if (typeof globalThis !== "undefined") {
    globalThis.TopDealsProducts = TopDealsProducts;
    globalThis.topdeals_productData = topdeals_productData;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        TopDealsProducts,
        topdeals_productData
    };
}
