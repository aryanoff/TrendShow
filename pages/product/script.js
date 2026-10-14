/**
 * TrendShow - Product Detail Page Logic
 * Retrieves product by ID parameter, displays truthful catalog data,
 * handles accessible Read More / Show Less for long descriptions,
 * and renders category-relevant recommendations from the live store.
 */

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const layout = document.getElementById("productLayout");
    const notFound = document.getElementById("productNotFound");
    const relatedSection = document.getElementById("relatedProductsSection");
    const relatedGrid = document.getElementById("relatedProductsGrid");
    const descWrapper = document.getElementById("productDescWrapper");
    const descToggleBtn = document.getElementById("btnDescToggle");

    async function populateProduct() {
        if (!productId || !window.ProductStore) {
            showNotFound();
            return;
        }

        let product = window.ProductStore.getById(productId);
        if (!product && window.ProductStore.ready) {
            await window.ProductStore.ready();
            product = window.ProductStore.getById(productId);
        }

        if (!product) {
            showNotFound();
            return;
        }

        if (layout) layout.style.display = "grid";
        if (notFound) notFound.style.display = "none";

        // Page title & breadcrumb
        document.title = `${product.title} — TrendShow`;

        const breadcrumbTitle = document.getElementById("breadcrumbCurrentTitle");
        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = product.title.length > 40 
                ? product.title.substring(0, 37) + "…" 
                : product.title;
        }

        // Product image
        const mainImg = document.getElementById("productMainImage");
        if (mainImg) {
            mainImg.src = product.image;
            mainImg.alt = product.alt || product.title;
            mainImg.onerror = function() {
                this.onerror = null;
                this.src = "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80";
            };
        }

        // Tag badge
        const tagBadge = document.getElementById("productTagBadge");
        if (tagBadge) {
            if (product.offer) {
                tagBadge.textContent = product.offer;
                tagBadge.style.display = "inline-block";
            } else {
                tagBadge.style.display = "none";
            }
        }

        // Retailer chip
        const retailerNameEl = document.getElementById("productRetailerName");
        if (retailerNameEl) {
            retailerNameEl.textContent = (product.retailerName || product.retailer || "Merchant").toUpperCase();
        }

        // Title and brand
        const mainTitle = document.getElementById("productMainTitle");
        if (mainTitle) mainTitle.textContent = product.title;

        const brandSubtitle = document.getElementById("productBrandSubtitle");
        if (brandSubtitle) {
            brandSubtitle.textContent = product.brand ? `Brand: ${product.brand}` : "";
        }

        // Price and discount
        const priceRange = document.getElementById("productPriceRange");
        if (priceRange) {
            if (product.currentPrice && product.currentPrice > 0) {
                priceRange.textContent = `₹${product.currentPrice.toLocaleString("en-IN")}`;
            } else if (product.priceRange) {
                priceRange.textContent = product.priceRange;
            } else {
                priceRange.textContent = "Check at Merchant";
            }
        }

        const offerTag = document.getElementById("productOfferTag");
        if (offerTag) {
            if (product.offer) {
                offerTag.textContent = product.offer;
                offerTag.style.display = "inline-block";
            } else {
                offerTag.style.display = "none";
            }
        }

        // Description with truthful catalog presentation & accessible Read More / Show Less
        const descText = document.getElementById("productDescriptionText");
        const hasCatalogDescription = Boolean(product.description && product.description.trim());
        const fullDesc = hasCatalogDescription 
            ? product.description.trim() 
            : "No supplier description provided in the catalog. View full specifications, customer reviews, and live product details directly on the merchant site.";

        if (descText) {
            descText.textContent = fullDesc;
            if (!hasCatalogDescription) {
                descText.style.fontStyle = "italic";
                descText.style.color = "#6c727f";
            } else {
                descText.style.fontStyle = "normal";
                descText.style.color = "#4a5568";
            }
        }

        if (descWrapper && descToggleBtn) {
            // Only show toggle if original description is present and sufficiently long (> 180 chars)
            if (hasCatalogDescription && fullDesc.length > 180) {
                descToggleBtn.style.display = "inline-flex";
                descWrapper.classList.remove("is-expanded");
                descToggleBtn.setAttribute("aria-expanded", "false");
                descToggleBtn.innerHTML = '<span>Read full description</span> <i class="fa-solid fa-chevron-down"></i>';

                descToggleBtn.onclick = function() {
                    const isExpanded = descWrapper.classList.toggle("is-expanded");
                    descToggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
                    descToggleBtn.innerHTML = isExpanded 
                        ? '<span>Show less</span> <i class="fa-solid fa-chevron-up"></i>' 
                        : '<span>Read full description</span> <i class="fa-solid fa-chevron-down"></i>';
                };
            } else {
                descToggleBtn.style.display = "none";
                descWrapper.classList.add("is-expanded");
            }
        }

        // Outbound affiliate link
        const affiliateBtn = document.getElementById("productAffiliateBtn");
        if (affiliateBtn) {
            const hasValidAffiliate = product.affiliateUrl && 
                product.affiliateUrl !== "#" && 
                /^https?:\/\//i.test(product.affiliateUrl);

            const merchantName = product.retailerName || "Merchant";

            if (hasValidAffiliate) {
                affiliateBtn.href = product.affiliateUrl;
                affiliateBtn.setAttribute("target", "_blank");
                affiliateBtn.setAttribute("rel", "sponsored nofollow noopener");
                affiliateBtn.classList.remove("btn-disabled");
                affiliateBtn.innerHTML = `<span>Shop on ${escapeHtml(merchantName)}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
            } else {
                affiliateBtn.removeAttribute("href");
                affiliateBtn.classList.add("btn-disabled");
                affiliateBtn.innerHTML = `<span>Destination Link Currently Unavailable</span>`;
            }
        }

        // Render Relevant Similar Deals (category-matched first)
        if (relatedGrid) {
            const allProducts = window.ProductStore.getAll();
            
            // Prioritize matching category
            let similar = allProducts.filter(p => p.id !== product.id && p.category === product.category);
            
            // If fewer than 4, supplement with high discount deals from same retailer
            if (similar.length < 4) {
                const sameRetailer = allProducts.filter(p => p.id !== product.id && p.retailer === product.retailer && !similar.includes(p));
                similar = [...similar, ...sameRetailer];
            }

            // Limit to 4 cards for a clean, balanced single row
            const displaySimilar = similar.slice(0, 4);

            if (displaySimilar.length > 0) {
                if (relatedSection) relatedSection.style.display = "block";
                relatedGrid.innerHTML = displaySimilar.map(p => window.createProductCardHTML(p, "../../")).join("");
            } else {
                if (relatedSection) relatedSection.style.display = "none";
            }
        }
    }

    function showNotFound() {
        if (layout) layout.style.display = "none";
        if (notFound) notFound.style.display = "block";
        if (relatedSection) relatedSection.style.display = "none";
    }

    populateProduct();

    // Reactively re-populate when live catalog loads/updates
    window.addEventListener("trendshow:catalog-updated", () => {
        populateProduct();
    });
});
