/**
 * Categories Page Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    const tilesGrid = document.getElementById("categoryTilesGrid");
    const productsGrid = document.getElementById("categoryProductsGrid");
    const headingEl = document.getElementById("activeCategoryHeading");
    const descEl = document.getElementById("activeCategoryDesc");

    // Check query param for default category
    const urlParams = new URLSearchParams(window.location.search);
    let selectedCat = urlParams.get("cat") || "all";

    const categories = window.CATEGORIES_DATA || [];

    function renderTiles() {
        if (!tilesGrid) return;
        tilesGrid.innerHTML = "";
        const categories = window.CATEGORIES_DATA || [];

        // Add "All" option
        const allTile = document.createElement("div");
        allTile.className = `category-tile ${selectedCat === "all" ? "active" : ""}`;
        allTile.dataset.catId = "all";
        allTile.innerHTML = `
            <div class="category-icon-box"><i class="fa-solid fa-shapes"></i></div>
            <h4>All Categories</h4>
            <span>Full Catalog</span>
        `;
        allTile.addEventListener("click", () => selectCategory("all", "All Categories", "Showing top curated products across all categories"));
        tilesGrid.appendChild(allTile);

        // Render each category
        categories.forEach(cat => {
            const tile = document.createElement("div");
            tile.className = `category-tile ${selectedCat === cat.id ? "active" : ""}`;
            tile.dataset.catId = cat.id;
            tile.innerHTML = `
                <div class="category-icon-box"><i class="${cat.icon}"></i></div>
                <h4>${cat.name}</h4>
                <span>${cat.count} Deals</span>
            `;
            tile.addEventListener("click", () => selectCategory(cat.id, cat.name, `Top deals and discounts in ${cat.name}`));
            tilesGrid.appendChild(tile);
        });
    }

    function selectCategory(catId, catName, catDesc) {
        selectedCat = catId;

        // Update active class
        document.querySelectorAll(".category-tile").forEach(t => {
            t.classList.toggle("active", t.dataset.catId === catId);
        });

        if (headingEl) headingEl.textContent = catName;
        if (descEl) descEl.textContent = catDesc;

        renderCategoryProducts();
    }

    function renderCategoryProducts() {
        if (!productsGrid || !window.ProductStore) return;

        let items = [];
        if (selectedCat === "all") {
            items = window.ProductStore.getAll();
        } else {
            items = window.ProductStore.getByCategory(selectedCat);
        }

        if (items.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: #696b79; background: #fafafa; border-radius: 12px; border: 1px dashed #e2e8f0;">
                    <i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; color: #94a3b8; display: block;"></i>
                    <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #1e293b;">No Products Found</h4>
                    <p style="margin: 0; font-size: 13px;">No deals currently listed in this category.</p>
                </div>
            `;
        } else {
            productsGrid.innerHTML = items.map(p => window.createProductCardHTML(p, "../../")).join("");
        }
    }

    // Initial render
    renderTiles();
    renderCategoryProducts();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        renderTiles();
        renderCategoryProducts();
    });
});
