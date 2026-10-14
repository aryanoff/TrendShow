/**
 * Sales Page Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("saleHighlightsGrid");
    if (!grid || !window.ProductStore) return;

    function extractDiscount(offerStr) {
        if (!offerStr) return 0;
        const matches = String(offerStr).match(/(\d+)%/);
        return matches ? parseInt(matches[1], 10) : 0;
    }

    function renderHighlights() {
        // Show top festival deals (50%+ off) and sort by highest savings
        const highlights = window.ProductStore.getAll()
            .filter(p => (p.discountPercent || 0) >= 50)
            .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));

        grid.innerHTML = highlights.map(p => window.createProductCardHTML(p, "../../")).join("");
    }

    renderHighlights();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        renderHighlights();
    });
});
