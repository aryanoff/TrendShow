/**
 * TrendShow - Shared Client-Side Utilities
 * Used across the homepage and all dedicated pages.
 */

// Unbiased Fisher-Yates shuffle
function shuffleArray(items) {
    if (!Array.isArray(items)) return [];
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Determine relative base path to project root
function getBasePath() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (path.includes("/pages/")) {
        return "../../";
    }
    return "./";
}

// Escape HTML utility to prevent injection
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Format price for display
 */
function formatPrice(product) {
    if (product.currentPrice && product.currentPrice > 0) {
        return `₹${product.currentPrice.toLocaleString("en-IN")}`;
    }
    if (product.price && product.price > 0) {
        return `₹${product.price.toLocaleString("en-IN")}`;
    }
    if (product.priceRange) {
        return product.priceRange;
    }
    return "Check Price";
}

// Generate uniform product card HTML — honest, data-driven e-commerce style
function createProductCardHTML(product, customBasePath) {
    const basePath = customBasePath !== undefined ? customBasePath : getBasePath();
    const productUrl = `${basePath}pages/product/index.html?id=${encodeURIComponent(product.id)}`;
    const hasOutboundLink = Boolean(
        product.affiliateUrl && 
        product.affiliateUrl !== "#" && 
        /^https?:\/\//i.test(product.affiliateUrl)
    );

    const price = formatPrice(product);
    const retailerMeta = (window.ProductStore && window.ProductStore.getRetailerMeta) 
        ? window.ProductStore.getRetailerMeta(product.retailer) 
        : null;
    const retailerName = retailerMeta ? retailerMeta.name : (product.retailerName || product.retailer || "Merchant");
    const outboundBtnText = hasOutboundLink ? (product.button || `Shop ${retailerName}`) : "View Details";

    // Clean truncated title (up to 55 characters) for balanced card height
    const truncatedTitle = product.title && product.title.length > 55 
        ? product.title.substring(0, 52) + "…" 
        : product.title;

    return `
        <div class="fashion-card" data-product-id="${escapeHtml(product.id)}" data-retailer="${escapeHtml(product.retailer)}">
            ${product.offer ? `<span class="card-tag card-tag--discount">${escapeHtml(product.offer)}</span>` : ""}
            <a href="${productUrl}" class="fashion-image-link" aria-label="View details for ${escapeHtml(product.title)}">
                <div class="fashion-image">
                    <img 
                        src="${escapeHtml(product.image)}" 
                        alt="${escapeHtml(product.alt || product.title)}" 
                        loading="lazy"
                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80';"
                    />
                    <div class="card-image-overlay">
                        <span class="card-quick-view"><i class="fa-regular fa-eye"></i> View Details</span>
                    </div>
                </div>
            </a>
            <div class="fashion-content">
                <div class="card-meta-row">
                    ${retailerName ? `<span class="card-retailer-pill">${escapeHtml(retailerName)}</span>` : ""}
                    ${product.brand ? `<span class="card-brand">${escapeHtml(product.brand)}</span>` : ""}
                </div>
                <a href="${productUrl}" class="card-title-link" title="${escapeHtml(product.title)}">
                    <h3>${escapeHtml(truncatedTitle)}</h3>
                </a>
                <div class="card-price-row">
                    <div class="card-price-stack">
                        <span class="card-price-label">Listed Price</span>
                        <span class="card-price-current">${escapeHtml(price)}</span>
                    </div>
                    ${product.offer ? `<span class="card-discount-badge">${escapeHtml(product.offer)}</span>` : ""}
                </div>
                <div class="card-actions">
                    <a href="${productUrl}" class="card-btn-details" aria-label="View details for ${escapeHtml(product.title)}">
                        <i class="fa-regular fa-eye"></i> Details
                    </a>
                    ${hasOutboundLink ? `
                        <a 
                            href="${escapeHtml(product.affiliateUrl)}" 
                            target="_blank" 
                            rel="sponsored nofollow noopener"
                            class="card-cta"
                            aria-label="Shop this deal on ${escapeHtml(retailerName)} (opens in new tab)"
                        >
                            <span>${escapeHtml(outboundBtnText)}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    ` : `
                        <a href="${productUrl}" class="card-cta card-cta--secondary">
                            <span>Details</span> <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Highlight search matches within a string safely
function highlightQueryMatch(text, query) {
    if (!query || !text) return escapeHtml(text);
    const terms = String(query).toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return escapeHtml(text);
    const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");
    const parts = String(text).split(pattern);
    return parts.map(part => {
        if (terms.some(t => t.toLowerCase() === part.toLowerCase())) {
            return `<mark class="search-highlight">${escapeHtml(part)}</mark>`;
        }
        return escapeHtml(part);
    }).join("");
}

// Initialize shared Header & Navigation features
function initHeaderAndNav() {
    const basePath = getBasePath();

    // 1. Search Box Integration
    const searchBoxes = document.querySelectorAll(".search");
    searchBoxes.forEach(searchBox => {
        if (searchBox.dataset.searchInit === "true") return;
        searchBox.dataset.searchInit = "true";

        const input = searchBox.querySelector("input[type='search'], input[type='text'], input");
        if (!input) return;

        input.setAttribute("autocomplete", "off");

        const searchIcon = searchBox.querySelector(".search-icon");

        // Create or get clear button
        let clearBtn = searchBox.querySelector(".search-clear-btn");
        if (!clearBtn) {
            clearBtn = document.createElement("button");
            clearBtn.type = "button";
            clearBtn.className = "search-clear-btn";
            clearBtn.setAttribute("aria-label", "Clear search query");
            clearBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            searchBox.appendChild(clearBtn);
        }

        // Create or get dropdown
        let dropdown = searchBox.querySelector(".search-dropdown");
        if (!dropdown) {
            dropdown = document.createElement("div");
            dropdown.className = "search-dropdown";
            dropdown.style.display = "none";
            dropdown.setAttribute("role", "listbox");
            searchBox.appendChild(dropdown);
        }

        // Pre-fill from URL if on search page or ?q= is present
        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get("q");
        if (queryFromUrl && !input.value) {
            input.value = queryFromUrl;
            clearBtn.style.display = "flex";
        } else if (input.value.trim()) {
            clearBtn.style.display = "flex";
        }

        let debounceTimer = null;
        let selectedIndex = -1;

        const openDropdown = () => {
            if (input.value.trim()) {
                renderLiveSuggestions(input.value.trim());
            } else {
                renderDefaultDropdown();
            }
        };

        const closeDropdown = () => {
            dropdown.style.display = "none";
            dropdown.innerHTML = "";
            selectedIndex = -1;
        };

        const performSearch = (rawQuery) => {
            const q = (rawQuery !== undefined ? rawQuery : input.value).trim();
            if (!q) return;
            closeDropdown();

            // If we are currently on the search page and window.executeSearchPage is exposed
            if (typeof window.executeSearchPage === "function") {
                input.value = q;
                clearBtn.style.display = "flex";
                window.executeSearchPage(q);
                return;
            }

            // Otherwise, navigate to search page
            window.location.href = `${basePath}pages/search/index.html?q=${encodeURIComponent(q)}`;
        };

        const getNavigableItems = () => {
            return Array.from(dropdown.querySelectorAll(".search-dd-product, .search-dd-chip, .search-dd-store-btn, .search-dd-footer"));
        };

        const updateSelectedHighlight = (items) => {
            items.forEach((item, idx) => {
                if (idx === selectedIndex) {
                    item.classList.add("is-selected");
                    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
                } else {
                    item.classList.remove("is-selected");
                }
            });
        };

        const bindDropdownEvents = () => {
            // Chips click
            dropdown.querySelectorAll(".search-dd-chip, .search-dd-store-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const term = btn.getAttribute("data-search-term") || btn.textContent.trim();
                    input.value = term;
                    clearBtn.style.display = "flex";
                    performSearch(term);
                });
            });

            // Product links click
            dropdown.querySelectorAll(".search-dd-product").forEach(link => {
                link.addEventListener("click", (e) => {
                    // Let normal link navigation happen, just close dropdown
                    closeDropdown();
                });
            });

            // View all footer link
            const footerLink = dropdown.querySelector(".search-dd-footer");
            if (footerLink) {
                footerLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    performSearch(input.value);
                });
            }
        };

        const renderDefaultDropdown = () => {
            const popular = (window.ProductStore && window.ProductStore.getPopularSearches)
                ? window.ProductStore.getPopularSearches()
                : ["Kurtis", "Denim Jeans", "Running Shoes", "Smartwatches", "Amazon Brands", "Myntra Fashion", "Handbags"];
            const stores = (window.ProductStore && window.ProductStore.getFeaturedRetailers)
                ? window.ProductStore.getFeaturedRetailers()
                : [
                    { key: "amazon", name: "Amazon" },
                    { key: "flipkart", name: "Flipkart" },
                    { key: "myntra", name: "Myntra" },
                    { key: "meesho", name: "Meesho" },
                    { key: "jiomart", name: "JioMart" }
                ];

            dropdown.innerHTML = `
                <div class="search-dd-header">
                    <span><i class="fa-solid fa-fire" style="color: #ff3f6c;"></i> Popular Searches</span>
                </div>
                <div class="search-dd-chips">
                    ${popular.map(kw => `
                        <button type="button" class="search-dd-chip" data-search-term="${escapeHtml(kw)}">
                            <i class="fa-solid fa-magnifying-glass"></i> ${escapeHtml(kw)}
                        </button>
                    `).join("")}
                </div>
                <div class="search-dd-header">
                    <span><i class="fa-solid fa-store" style="color: #ff8a00;"></i> Shop by Retailer</span>
                </div>
                <div class="search-dd-retailers">
                    ${stores.map(s => `
                        <button type="button" class="search-dd-store-btn" data-search-term="${escapeHtml(s.name)}">
                            ${escapeHtml(s.name)}
                        </button>
                    `).join("")}
                </div>
            `;
            dropdown.style.display = "flex";
            selectedIndex = -1;
            bindDropdownEvents();
        };

        const renderLiveSuggestions = (query) => {
            const q = query.trim();
            if (!q) {
                renderDefaultDropdown();
                return;
            }

            if (!window.ProductStore || !window.ProductStore.search) {
                dropdown.innerHTML = `
                    <a href="${basePath}pages/search/index.html?q=${encodeURIComponent(q)}" class="search-dd-footer">
                        <span>Press Enter to search for "<strong>${escapeHtml(q)}</strong>"</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                `;
                dropdown.style.display = "flex";
                bindDropdownEvents();
                return;
            }

            const results = window.ProductStore.search(q);

            if (results.length === 0) {
                dropdown.innerHTML = `
                    <div class="search-dd-empty">
                        <i class="fa-regular fa-face-frown"></i>
                        <div>No matches found for "<strong>${escapeHtml(q)}</strong>"</div>
                        <div style="font-size: 11.5px; color: #878b94;">Try broader terms like "shirt", "shoes", "kurti", or "amazon".</div>
                    </div>
                    <a href="${basePath}pages/search/index.html?q=${encodeURIComponent(q)}" class="search-dd-footer">
                        <span>Search catalog for "<strong>${escapeHtml(q)}</strong>"</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                `;
                dropdown.style.display = "flex";
                bindDropdownEvents();
                return;
            }

            const topProducts = results.slice(0, 5);
            const retailerMeta = (retailerKey) => (window.ProductStore.getRetailerMeta ? window.ProductStore.getRetailerMeta(retailerKey) : null);

            let html = `
                <div class="search-dd-header">
                    <span><i class="fa-solid fa-bolt" style="color: #ff3f6c;"></i> Top Deals (${results.length} found)</span>
                    <span style="font-size: 10px; font-weight: 500; text-transform: none; color: #878b94;">Press Enter to view all</span>
                </div>
                <div class="search-dd-products">
                    ${topProducts.map(p => {
                        const productUrl = `${basePath}pages/product/index.html?id=${encodeURIComponent(p.id)}`;
                        const meta = retailerMeta(p.retailer);
                        const retailerName = meta ? meta.name : (p.retailer || "");
                        return `
                            <a href="${productUrl}" class="search-dd-product" data-product-url="${productUrl}" role="option">
                                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="search-dd-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80';" />
                                <div class="search-dd-info">
                                    <div class="search-dd-title">${highlightQueryMatch(p.title, q)}</div>
                                    <div class="search-dd-meta">
                                        <span class="search-dd-badge">${escapeHtml(retailerName)}</span>
                                        <span>${escapeHtml(p.brand || "")}</span>
                                    </div>
                                </div>
                                <div class="search-dd-offer">${escapeHtml(p.offer || "")}</div>
                            </a>
                        `;
                    }).join("")}
                </div>
                <a href="${basePath}pages/search/index.html?q=${encodeURIComponent(q)}" class="search-dd-footer">
                    <span>View all <strong>${results.length}</strong> matching deals for "${escapeHtml(q)}"</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            `;

            dropdown.innerHTML = html;
            dropdown.style.display = "flex";
            selectedIndex = -1;
            bindDropdownEvents();
        };

        // Event: Focus & Click on input
        input.addEventListener("focus", () => {
            openDropdown();
        });

        input.addEventListener("click", () => {
            if (dropdown.style.display === "none") {
                openDropdown();
            }
        });

        // Event: Live input typing
        input.addEventListener("input", () => {
            const val = input.value;
            clearBtn.style.display = val.trim() ? "flex" : "none";

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (val.trim()) {
                    renderLiveSuggestions(val);
                } else {
                    renderDefaultDropdown();
                }
            }, 120);
        });

        // Event: Keyboard Navigation
        input.addEventListener("keydown", (e) => {
            const isDropdownOpen = dropdown.style.display !== "none";
            const items = isDropdownOpen ? getNavigableItems() : [];

            if (e.key === "ArrowDown") {
                if (!isDropdownOpen) {
                    openDropdown();
                    return;
                }
                e.preventDefault();
                if (items.length > 0) {
                    selectedIndex = (selectedIndex + 1) % items.length;
                    updateSelectedHighlight(items);
                }
            } else if (e.key === "ArrowUp") {
                if (!isDropdownOpen) return;
                e.preventDefault();
                if (items.length > 0) {
                    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                    updateSelectedHighlight(items);
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (isDropdownOpen && selectedIndex >= 0 && items[selectedIndex]) {
                    const selectedItem = items[selectedIndex];
                    if (selectedItem.tagName === "A" && selectedItem.href) {
                        window.location.href = selectedItem.href;
                    } else if (selectedItem.tagName === "BUTTON") {
                        selectedItem.click();
                    } else {
                        performSearch(input.value);
                    }
                } else {
                    performSearch(input.value);
                }
            } else if (e.key === "Escape") {
                closeDropdown();
                input.blur();
            }
        });

        // Event: Clear button click
        clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            input.value = "";
            clearBtn.style.display = "none";
            input.focus();
            renderDefaultDropdown();
            if (typeof window.executeSearchPage === "function") {
                window.executeSearchPage("");
            }
        });

        // Event: Search icon click
        if (searchIcon) {
            searchIcon.style.cursor = "pointer";
            searchIcon.addEventListener("click", () => {
                performSearch(input.value);
            });
        }

        // Event: Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!searchBox.contains(e.target)) {
                closeDropdown();
            }
        });
    });

    // 2. Mobile Navigation Toggle
    const headerNav = document.querySelector(".head-bar nav");
    const menu = document.querySelector(".head-bar .menu");

    if (headerNav && menu && !document.querySelector(".mobile-menu-toggle")) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "mobile-menu-toggle";
        toggleBtn.setAttribute("aria-label", "Toggle navigation menu");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';

        headerNav.appendChild(toggleBtn);

        toggleBtn.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("menu--open");
            toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            toggleBtn.innerHTML = isOpen 
                ? '<i class="fa-solid fa-xmark"></i>' 
                : '<i class="fa-solid fa-bars"></i>';
        });

        // Close on ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && menu.classList.contains("menu--open")) {
                menu.classList.remove("menu--open");
                toggleBtn.setAttribute("aria-expanded", "false");
                toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (menu.classList.contains("menu--open") && !headerNav.contains(e.target)) {
                menu.classList.remove("menu--open");
                toggleBtn.setAttribute("aria-expanded", "false");
                toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    }
}

// Auto-initialize when DOM is ready in browser
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        initHeaderAndNav();
    });
}

// Export globally for browser & node
if (typeof globalThis !== "undefined") {
    globalThis.shuffleArray = shuffleArray;
    globalThis.getBasePath = getBasePath;
    globalThis.escapeHtml = escapeHtml;
    globalThis.createProductCardHTML = createProductCardHTML;
    globalThis.initHeaderAndNav = initHeaderAndNav;
    globalThis.formatPrice = formatPrice;
    globalThis.highlightQueryMatch = highlightQueryMatch;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = { shuffleArray, getBasePath, escapeHtml, createProductCardHTML, initHeaderAndNav, formatPrice, highlightQueryMatch };
}
