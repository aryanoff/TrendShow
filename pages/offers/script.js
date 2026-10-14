/**
 * Offers Page Logic
 * Handles discount tier filtering, budget under 500 filtering, and counts.
 */

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("offersGrid");
    const countText = document.getElementById("offersCountText");
    const emptyState = document.getElementById("offersEmptyState");
    const resetBtn = document.getElementById("offersResetBtn");
    const tierBtns = document.querySelectorAll("#discountTiersRow .tier-btn");
    let activeTier = "all";

    function extractDiscount(offerStr) {
        if (!offerStr) return 0;
        const matches = String(offerStr).match(/(\d+)%/);
        return matches ? parseInt(matches[1], 10) : 0;
    }

    function filterOffers() {
        if (!grid || !window.ProductStore) return;
        let items = window.ProductStore.getAll();

        if (activeTier === "70") {
            items = items.filter(p => (p.discountPercent || 0) >= 70);
        } else if (activeTier === "60") {
            items = items.filter(p => (p.discountPercent || 0) >= 60);
        } else if (activeTier === "50") {
            items = items.filter(p => (p.discountPercent || 0) >= 50);
        } else if (activeTier === "budget") {
            items = items.filter(p => {
                const price = p.currentPrice || p.price || 0;
                return price > 0 && price <= 500;
            });
        }

        // Sort descending by discount percentage
        items = [...items].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));

        if (countText) {
            countText.textContent = `Showing ${items.length} verified discount deal${items.length === 1 ? '' : 's'}`;
        }

        if (items.length === 0) {
            grid.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
        } else {
            if (emptyState) emptyState.style.display = "none";
            grid.style.display = "grid";
            grid.innerHTML = items.map(p => window.createProductCardHTML(p, "../../")).join("");
        }
    }

    tierBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tierBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeTier = btn.dataset.tier;
            filterOffers();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            activeTier = "all";
            tierBtns.forEach(b => b.classList.toggle("active", b.dataset.tier === "all"));
            filterOffers();
        });
    }

    filterOffers();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        filterOffers();
    });
});
