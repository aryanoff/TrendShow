/**
 * Search Page Engine
 * Handles URL query parameter parsing, instant live search, retailer & category filters,
 * sorting, keyword chips, clear triggers, and seamless synchronization with header search.
 */

document.addEventListener("DOMContentLoaded", () => {
    const mainField = document.getElementById("mainSearchField");
    const mainBtn = document.getElementById("mainSearchBtn");
    const mainClearBtn = document.getElementById("mainSearchClearBtn");
    const titleEl = document.getElementById("searchQueryTitle");
    const subtitleEl = document.getElementById("searchQuerySubtitle");
    const grid = document.getElementById("searchResultsGrid");
    const emptyState = document.getElementById("searchEmptyState");
    const countEl = document.getElementById("resultsCountText");
    const kwBtns = document.querySelectorAll(".quick-keywords .kw-btn");
    const retailerPills = document.querySelectorAll("#searchRetailerPills .filter-pill");
    const categoryPills = document.querySelectorAll("#searchCategoryPills .filter-pill");
    const sortSelect = document.getElementById("searchSortSelect");
    const clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");
    const emptyResetBtn = document.getElementById("emptyResetBtn");
    const pageSearchInput = document.getElementById("pageSearchInput");

    // Read initial query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = (urlParams.get("q") || "").trim();

    // Search state
    const state = {
        query: initialQuery,
        retailer: "all",
        category: "all",
        sort: "relevance"
    };

    function extractDiscountPercent(offerStr) {
        if (!offerStr) return 0;
        const matches = String(offerStr).match(/(\d+)%/);
        return matches ? parseInt(matches[1], 10) : 0;
    }

    function updateUrlState() {
        const newUrl = new URL(window.location);
        if (state.query) {
            newUrl.searchParams.set("q", state.query);
        } else {
            newUrl.searchParams.delete("q");
        }
        window.history.replaceState({}, "", newUrl);
    }

    function applyAndRender() {
        updateUrlState();

        // Sync inputs
        if (mainField && mainField.value !== state.query) {
            mainField.value = state.query;
        }
        if (pageSearchInput && pageSearchInput.value !== state.query) {
            pageSearchInput.value = state.query;
        }

        // Toggle clear buttons
        if (mainClearBtn) {
            mainClearBtn.style.display = state.query ? "flex" : "none";
        }
        const headerClearBtn = document.querySelector(".head-bar .search-clear-btn");
        if (headerClearBtn) {
            headerClearBtn.style.display = state.query ? "flex" : "none";
        }

        // Highlight matching quick keyword chip
        kwBtns.forEach(btn => {
            const kw = (btn.dataset.kw || "").toLowerCase();
            const q = state.query.toLowerCase();
            btn.classList.toggle("active", Boolean(q && (q === kw || q.includes(kw))));
        });

        // Update filter pills active state
        retailerPills.forEach(pill => {
            pill.classList.toggle("active", pill.dataset.retailer === state.retailer);
        });
        categoryPills.forEach(pill => {
            pill.classList.toggle("active", pill.dataset.category === state.category);
        });

        // Toggle Reset Filters button
        const hasActiveFilters = Boolean(state.query || state.retailer !== "all" || state.category !== "all" || state.sort !== "relevance");
        if (clearAllFiltersBtn) {
            clearAllFiltersBtn.style.display = hasActiveFilters ? "inline-flex" : "none";
        }

        // Fetch products
        let items = [];
        if (window.ProductStore) {
            items = state.query ? window.ProductStore.search(state.query) : window.ProductStore.getAll();
        }

        // Apply retailer filter
        if (state.retailer !== "all") {
            items = items.filter(p => (p.retailer || "").toLowerCase() === state.retailer.toLowerCase());
        }

        // Apply category filter
        if (state.category !== "all") {
            items = items.filter(p => (p.category || "").toLowerCase() === state.category.toLowerCase());
        }

        // Apply sort
        if (state.sort === "discount") {
            items = [...items].sort((a, b) => extractDiscountPercent(b.offer) - extractDiscountPercent(a.offer));
        } else if (state.sort === "name") {
            items = [...items].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        }

        // Update titles & headers
        if (state.query) {
            if (titleEl) titleEl.textContent = `Results for "${state.query}"`;
            if (subtitleEl) {
                subtitleEl.textContent = items.length > 0 
                    ? `Found ${items.length} deal${items.length === 1 ? '' : 's'} matching your search and filter criteria.` 
                    : "Explore curated deals across Amazon, Flipkart, Myntra, Meesho, and JioMart.";
            }
        } else {
            if (titleEl) titleEl.textContent = "All Curated Deals & Products";
            if (subtitleEl) subtitleEl.textContent = "Explore our complete multi-retailer catalog of fashion and lifestyle discounts.";
        }

        if (countEl) {
            countEl.textContent = `Showing ${items.length} product${items.length === 1 ? '' : 's'}`;
        }

        // Render grid or single clear empty state
        if (items.length === 0) {
            if (grid) grid.style.display = "none";
            if (emptyState) {
                emptyState.style.display = "block";
                const emptyTitle = document.getElementById("emptyStateTitle");
                const emptyDesc = document.getElementById("emptyStateDesc");
                if (emptyTitle) {
                    emptyTitle.textContent = state.query 
                        ? `No matching products found for "${state.query}"` 
                        : "No products match the selected filters";
                }
                if (emptyDesc) {
                    emptyDesc.textContent = "We couldn't find any deals matching your query. Check your spelling, try one of the popular search terms below, or reset your filters.";
                }
            }
        } else {
            if (emptyState) emptyState.style.display = "none";
            if (grid) {
                grid.style.display = "grid";
                grid.innerHTML = items.map(p => window.createProductCardHTML(p, "../../")).join("");
            }
        }
    }

    // Expose global method for shared.js header search sync
    window.executeSearchPage = (newQuery) => {
        state.query = (newQuery || "").trim();
        applyAndRender();
    };

    // Live debounced search as user types in big box
    let liveSearchDebounce = null;
    if (mainField) {
        mainField.value = state.query;
        mainField.addEventListener("input", () => {
            clearTimeout(liveSearchDebounce);
            liveSearchDebounce = setTimeout(() => {
                state.query = mainField.value.trim();
                applyAndRender();
            }, 180);
        });

        mainField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                clearTimeout(liveSearchDebounce);
                state.query = mainField.value.trim();
                applyAndRender();
            }
        });
    }

    if (mainBtn && mainField) {
        mainBtn.addEventListener("click", () => {
            clearTimeout(liveSearchDebounce);
            state.query = mainField.value.trim();
            applyAndRender();
        });
    }

    // Big search clear button
    if (mainClearBtn && mainField) {
        mainClearBtn.addEventListener("click", () => {
            mainField.value = "";
            state.query = "";
            mainField.focus();
            applyAndRender();
        });
    }

    // Quick Keyword Chips
    kwBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const kw = btn.dataset.kw || btn.textContent.trim();
            state.query = kw;
            if (mainField) mainField.value = kw;
            applyAndRender();
        });
    });

    // Empty state suggestions
    const emptySuggestions = document.querySelectorAll("#emptyStateSuggestions .kw-btn");
    emptySuggestions.forEach(btn => {
        btn.addEventListener("click", () => {
            const kw = btn.dataset.kw || btn.textContent.trim();
            state.query = kw;
            state.retailer = "all";
            state.category = "all";
            if (mainField) mainField.value = kw;
            applyAndRender();
        });
    });

    // Retailer Filter Pills
    retailerPills.forEach(pill => {
        pill.addEventListener("click", () => {
            state.retailer = pill.dataset.retailer || "all";
            applyAndRender();
        });
    });

    // Category Filter Pills
    categoryPills.forEach(pill => {
        pill.addEventListener("click", () => {
            state.category = pill.dataset.category || "all";
            applyAndRender();
        });
    });

    // Sort Dropdown
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            state.sort = e.target.value;
            applyAndRender();
        });
    }

    // Reset Filters Actions
    const resetAllFilters = () => {
        state.query = "";
        state.retailer = "all";
        state.category = "all";
        state.sort = "relevance";
        if (mainField) mainField.value = "";
        if (pageSearchInput) pageSearchInput.value = "";
        if (sortSelect) sortSelect.value = "relevance";
        applyAndRender();
    };

    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener("click", resetAllFilters);
    }
    if (emptyResetBtn) {
        emptyResetBtn.addEventListener("click", resetAllFilters);
    }

    // Initial render
    applyAndRender();

    // Reactively update when live Google Sheets catalog is loaded or refreshed
    window.addEventListener("trendshow:catalog-updated", () => {
        applyAndRender();
    });
});
