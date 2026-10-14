/**
 * Shop Page Logic
 * Interactive multi-retailer & category filtering, sorting, and dynamic card generation.
 */

document.addEventListener("DOMContentLoaded", () => {
    let currentRetailer = "all";
    let currentCategory = "all";
    let currentSort = "featured";

    const grid = document.getElementById("shopProductsGrid");
    const emptyState = document.getElementById("shopEmptyState");
    const countEl = document.getElementById("resultsCount");
    const sortSelect = document.getElementById("sortSelect");
    const resetBtn = document.getElementById("resetFiltersBtn");

    const retailerPills = document.querySelectorAll("#retailerFilterPills .filter-pill");
    const categoryPills = document.querySelectorAll("#categoryFilterPills .filter-pill");

    function renderProducts() {
        let list = window.ProductStore ? window.ProductStore.getAll() : [];

        // Filter Retailer
        if (currentRetailer !== "all") {
            list = list.filter(p => p.retailer.toLowerCase() === currentRetailer.toLowerCase());
        }

        // Filter Category
        if (currentCategory !== "all") {
            list = list.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
        }

        // Sort
        if (currentSort === "name") {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (currentSort === "discount") {
            list.sort((a, b) => {
                const discA = (typeof a.discountPercent === "number") ? a.discountPercent : 0;
                const discB = (typeof b.discountPercent === "number") ? b.discountPercent : 0;
                return discB - discA;
            });
        }

        // Update Counter
        if (countEl) {
            countEl.textContent = `Showing ${list.length} product${list.length === 1 ? '' : 's'}`;
        }

        // Render or Show Empty State
        if (list.length === 0) {
            grid.style.display = "none";
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
            grid.style.display = "grid";
            grid.innerHTML = list.map(p => window.createProductCardHTML(p, "../../")).join("");
        }
    }

    // Retailer Pills Click
    retailerPills.forEach(pill => {
        pill.addEventListener("click", () => {
            retailerPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentRetailer = pill.dataset.retailer;
            renderProducts();
        });
    });

    // Category Pills Click
    categoryPills.forEach(pill => {
        pill.addEventListener("click", () => {
            categoryPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentCategory = pill.dataset.category;
            renderProducts();
        });
    });

    // Sort Change
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    // Reset Button
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            currentRetailer = "all";
            currentCategory = "all";
            retailerPills.forEach(p => p.classList.toggle("active", p.dataset.retailer === "all"));
            categoryPills.forEach(p => p.classList.toggle("active", p.dataset.category === "all"));
            renderProducts();
        });
    }

    // Initial render
    renderProducts();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        renderProducts();
    });
});
