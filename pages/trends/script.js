/**
 * Trends Page Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("trendsGrid");
    if (!grid || !window.ProductStore) return;

    function renderTrends() {
        // Filter featured and streetwear/ethnic/viral deals
        const trending = window.ProductStore.getAll().filter(p => 
            p.featured || 
            p.category === "streetwear" || 
            (p.tag && (p.tag.includes("Trend") || p.tag.includes("Hot") || p.tag.includes("Deal") || p.tag.includes("Lightning")))
        );

        grid.innerHTML = trending.map(p => window.createProductCardHTML(p, "../../")).join("");
    }

    renderTrends();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        renderTrends();
    });
});

