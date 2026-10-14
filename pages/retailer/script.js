/**
 * Retailer Page Logic
 * Retrieves retailer from URL parameter, applies custom branding,
 * and handles category filtering, sorting, and empty state rendering.
 */

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rawParam = urlParams.get("retailer") || urlParams.get("store") || "amazon";
    const retailerKey = rawParam.toLowerCase().trim();

    const meta = window.ProductStore ? window.ProductStore.getRetailerMeta(retailerKey) : null;
    const bannerSection = document.getElementById("retailerBannerSection");
    const logoImg = document.getElementById("retailerHeaderLogo");
    const badgeEl = document.getElementById("retailerExclusiveBadge");
    const titleEl = document.getElementById("retailerHeaderTitle");
    const taglineEl = document.getElementById("retailerHeaderTagline");
    const grid = document.getElementById("retailerProductsGrid");
    const headingEl = document.getElementById("retailerGridHeading");
    const breadcrumbName = document.getElementById("retailerBreadcrumbName");
    const emptyState = document.getElementById("retailerEmptyState");
    const categoryPills = document.querySelectorAll("#retailerCategoryPills .filter-pill");
    const sortSelect = document.getElementById("retailerSortSelect");
    const resetFiltersBtn = document.getElementById("retailerResetFiltersBtn");

    let currentCategory = "all";
    let currentSort = "featured";

    function extractDiscount(offerStr) {
        if (!offerStr) return 0;
        const matches = String(offerStr).match(/(\d+)%/);
        return matches ? parseInt(matches[1], 10) : 0;
    }

    // Highlight active retailer switch pill
    document.querySelectorAll(".r-pill").forEach(pill => {
        if (pill.dataset.key.toLowerCase() === retailerKey.toLowerCase()) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });

    if (meta) {
        document.title = `${meta.name} Deals & Offers — TrendShow`;

        if (breadcrumbName) breadcrumbName.textContent = meta.name;
        if (logoImg) logoImg.src = meta.logo;
        if (titleEl) titleEl.textContent = `${meta.name} Deals Hub`;
        if (taglineEl) taglineEl.textContent = meta.tagline;
        if (badgeEl) {
            badgeEl.textContent = meta.badge;
            badgeEl.style.backgroundColor = meta.color;
            badgeEl.style.color = "#ffffff";
        }

        if (bannerSection) {
            bannerSection.style.borderTop = `4px solid ${meta.color}`;
            bannerSection.style.background = `linear-gradient(180deg, ${meta.lightColor} 0%, #ffffff 100px)`;
        }

        if (headingEl) headingEl.textContent = `Curated Deals from ${meta.name}`;
    } else {
        if (breadcrumbName) breadcrumbName.textContent = "All Retailers";
        if (titleEl) titleEl.textContent = "Retailer Catalog";
    }

    function renderProducts() {
        if (!grid || !window.ProductStore) return;

        let products = window.ProductStore.getByRetailer(retailerKey);

        // Apply category filter
        if (currentCategory !== "all") {
            products = products.filter(p => (p.category || "").toLowerCase() === currentCategory.toLowerCase());
        }

        // Apply sort
        if (currentSort === "discount") {
            products = [...products].sort((a, b) => extractDiscount(b.offer) - extractDiscount(a.offer));
        } else if (currentSort === "name") {
            products = [...products].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        }

        if (products.length === 0) {
            grid.style.display = "none";
            if (emptyState) {
                const totalRetailerProducts = window.ProductStore.getByRetailer(retailerKey);
                const retailerName = meta ? meta.name : "this retailer";
                
                if (totalRetailerProducts.length === 0) {
                    emptyState.innerHTML = `
                        <i class="fa-solid fa-boxes-packing" style="font-size: 38px; color: #ff8a00; margin-bottom: 14px; display: block;"></i>
                        <h3 style="font-size: 20px; color: #282c3f; margin-bottom: 8px;">No Products Listed Yet for ${escapeHtml(retailerName)}</h3>
                        <p style="font-size: 14px; color: #64748b; max-width: 480px; margin: 0 auto 18px; line-height: 1.5;">
                            Our catalog is synchronized directly with our live Google Sheet. Products for ${escapeHtml(retailerName)} have not yet been added to the sheet. Discover today's live deals on Amazon in the meantime.
                        </p>
                        <a href="index.html?retailer=amazon" class="btn-primary" style="display: inline-block; padding: 10px 24px; border-radius: 9999px; background: #ff3f6c; color: #fff; font-weight: 700; text-decoration: none;">
                            Explore Amazon Deals
                        </a>
                    `;
                } else {
                    emptyState.innerHTML = `
                        <i class="fa-solid fa-filter-circle-xmark" style="font-size: 36px; color: #94a3b8; margin-bottom: 14px; display: block;"></i>
                        <h3 style="font-size: 19px; color: #282c3f; margin-bottom: 8px;">No Matching Deals in this Category</h3>
                        <p style="font-size: 14px; color: #64748b; max-width: 460px; margin: 0 auto 18px;">
                            No deals match the selected category for ${escapeHtml(retailerName)}. Try clearing your category filter.
                        </p>
                        <button type="button" id="retailerResetFiltersBtn" class="btn-primary" style="display: inline-block; padding: 10px 22px; border-radius: 9999px; background: #ff3f6c; color: #fff; font-weight: 700; border: none; cursor: pointer;">
                            Show All ${escapeHtml(retailerName)} Deals
                        </button>
                    `;
                    const dynamicResetBtn = document.getElementById("retailerResetFiltersBtn");
                    if (dynamicResetBtn) {
                        dynamicResetBtn.addEventListener("click", () => {
                            currentCategory = "all";
                            categoryPills.forEach(p => p.classList.toggle("active", p.dataset.category === "all"));
                            renderProducts();
                        });
                    }
                }
                emptyState.style.display = "block";
            }
        } else {
            if (emptyState) emptyState.style.display = "none";
            grid.style.display = "grid";
            grid.innerHTML = products.map(p => window.createProductCardHTML(p, "../../")).join("");
        }
    }

    // Category pill click
    categoryPills.forEach(pill => {
        pill.addEventListener("click", () => {
            categoryPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentCategory = pill.dataset.category || "all";
            renderProducts();
        });
    });

    // Sort select change
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderProducts();
        });
    }

    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            currentCategory = "all";
            currentSort = "featured";
            categoryPills.forEach(p => p.classList.toggle("active", p.dataset.category === "all"));
            if (sortSelect) sortSelect.value = "featured";
            renderProducts();
        });
    }

    renderProducts();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        renderProducts();
    });
});
