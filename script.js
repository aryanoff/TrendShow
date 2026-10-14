/**
 * TrendShow - Homepage Client Logic
 * Handles promotional carousel, Shop With tiles, and independent page-load shuffling for all product grids.
 */

// =========================================
// 1. SHOP WITH RETAILER LOGO TILES
// =========================================

const shopByBoxData = {
    amazon: {
        image: "https://static.vecteezy.com/system/resources/thumbnails/019/766/240/small/amazon-logo-amazon-icon-transparent-free-png.png",
        title: "Amazon",
        button: "Shop Now",
        alt: "Amazon Deals",
        target: "amazonSection"
    },
    flipkart: {
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Flipkart_logo_%282026%29.svg",
        title: "Flipkart",
        button: "Shop Now",
        alt: "Flipkart Assured",
        target: "flipkartSection"
    },
    meesho: {
        image: "https://cdn.iconscout.com/icon/free/png-256/free-meesho-icon-svg-download-png-10673438.png?f=webp",
        title: "Meesho",
        button: "Shop Now",
        alt: "Meesho Value Deals",
        target: "meeshoSection"
    },
    jiomart: {
        image: "https://palred.com/wp-content/uploads/2024/05/jiomart.png",
        title: "JioMart",
        button: "Shop Now",
        alt: "JioMart Super Savers",
        target: "jiomartSection"
    },
    topDeals: {
        image: "https://static.vecteezy.com/system/resources/thumbnails/026/976/930/small/best-deal-label-alphabet-3d-text-effect-promotion-discount-label-templates-png.png",
        title: "Top Deals",
        button: "Shop Now",
        alt: "Viral Top Deals",
        target: "topDealsSection"
    },
    myntra: {
        image: "https://logos-world.net/wp-content/uploads/2022/12/Myntra-Logo.png",
        title: "Myntra",
        button: "Shop Now",
        alt: "Myntra Runway Trends",
        target: "myntraSection"
    }
};

const shopByBoxContainer = document.getElementById("shopByBoxContainer");

if (shopByBoxContainer) {
    shopByBoxContainer.innerHTML = Object.keys(shopByBoxData).map(key => {
        const shop = shopByBoxData[key];
        const pageLink = (key === "topDeals") ? "pages/offers/index.html" : `pages/retailer/index.html?retailer=${key}`;
        return `
            <a href="${pageLink}" class="shop-by-box-link" data-target="${shop.target}" title="Explore ${shop.title} deals">
                <div class="shop-by-box">
                    <div class="shop-by-box-image">
                        <img src="${shop.image}" alt="${shop.alt}" loading="lazy">
                    </div>
                    <div class="shop-by-box-content">
                        <h3>${shop.title}</h3>
                        <p>${shop.button}</p>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    // Smooth-scroll if on homepage and section is currently visible
    shopByBoxContainer.querySelectorAll(".shop-by-box-link").forEach(link => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("data-target");
            const targetEl = targetId ? document.getElementById(targetId) : null;
            if (targetEl && targetEl.style.display !== "none") {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}


// =========================================
// 2. PROMOTIONAL SPLIT HERO CAROUSEL
// =========================================

const mainSaleData = {
    amazon: {
        image: "https://assets.aboutamazon.com/8a/3f/e7ebea4e453bb94dca93111d35ed/great-indian-festival-2026.jpeg",
        title: "Amazon",
        offer: "FLAT ₹500 OFF",
        offerSub: "Great Indian Festival",
        button: "Shop Now",
        alt: "Amazon Great Indian Festival",
        color: "#ff9900",
        link: "pages/retailer/index.html?retailer=amazon"
    },
    flipkart: {
        image: "https://assets.myntassets.com/w_980,c_limit,fl_progressive,dpr_2.0/assets/images/2022/7/25/9be788ff-39a4-4214-99d0-fc97505aae5a1658752545685-USPA_Desk_Banner.jpg",
        title: "Flipkart",
        offer: "UP TO 70% OFF",
        offerSub: "Big Billion Days",
        button: "Shop Now",
        alt: "Flipkart Big Billion Days",
        color: "#2874f0",
        link: "pages/retailer/index.html?retailer=flipkart"
    },
    meesho: {
        image: "https://flipshope.com/blog/wp-content/uploads/2026/10/ChatGPT-Image-Oct-8-2026-11_07_40-AM-1mb.jpeg",
        title: "Meesho",
        offer: "30-80% OFF",
        offerSub: "Mega Blockbuster Sale",
        button: "Shop Now",
        alt: "Meesho Mega Sale",
        color: "#e84393",
        link: "pages/retailer/index.html?retailer=meesho"
    },
    jiomart: {
        image: "https://inc42.com/wp-content/uploads/2022/10/jio-mart-social.png",
        title: "JioMart",
        offer: "FLAT 40% OFF",
        offerSub: "Festive Dhamaka",
        button: "Shop Now",
        alt: "JioMart Festive Sale",
        color: "#0a3d62",
        link: "pages/retailer/index.html?retailer=jiomart"
    },
    myntra: {
        image: "https://res.cloudinary.com/ams1rfsh/image/upload/v1791906056/fashion-hero_gs1lkw.jpg",
        title: "Myntra",
        offer: "50-90% OFF",
        offerSub: "Fashion Fiesta",
        button: "Shop Now",
        alt: "Myntra Fashion Sale",
        color: "#ff3f6c",
        link: "pages/retailer/index.html?retailer=myntra"
    }
};

const sliderTrack = document.getElementById("saleSliderTrack");
const sliderDots = document.getElementById("sliderDots");
const slides = Object.values(mainSaleData);
let currentSlide = 0;
let autoPlayTimer = null;

if (sliderTrack && sliderDots && slides.length > 0) {
    // Clear and build slides
    sliderTrack.innerHTML = "";
    sliderDots.innerHTML = "";

    slides.forEach((sale, index) => {
        // Build Slide
        const slide = document.createElement("div");
        slide.className = `sale-slide ${index === 0 ? "sale-slide--active" : ""}`;
        slide.innerHTML = `
            <div class="sale-slide-inner">
                <div class="slide-offer-strip" style="background: linear-gradient(135deg, ${sale.color}, ${sale.color}dd);">
                    <div class="slide-offer-strip-bg"></div>
                    <div class="slide-offer-text">
                        <span class="slide-offer-label">${sale.title}</span>
                        <span class="slide-offer-value">${sale.offer}</span>
                        <span class="slide-offer-sub">${sale.offerSub}</span>
                    </div>
                    <div class="slide-offer-seam">
                        <div class="seam-notch seam-notch--top"></div>
                        <div class="seam-line"></div>
                        <div class="seam-notch seam-notch--bottom"></div>
                    </div>
                    <a href="${sale.link || '#'}" class="slide-shop-btn">${sale.button} <i class="fa-solid fa-arrow-right"></i></a>
                </div>
                <div class="slide-hero">
                    <img class="slide-hero-img" src="${sale.image}" alt="${sale.alt}" loading="${index === 0 ? 'eager' : 'lazy'}" />
                    <div class="slide-hero-shade"></div>
                </div>
            </div>
        `;
        sliderTrack.appendChild(slide);

        // Build Dot
        const dot = document.createElement("button");
        dot.className = `slider-dot ${index === 0 ? "slider-dot--active" : ""}`;
        dot.setAttribute("aria-label", `Go to slide ${index + 1}: ${sale.title}`);
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
        dot.addEventListener("click", () => {
            goToSlide(index);
            resetAutoPlay();
        });
        sliderDots.appendChild(dot);
    });

    function goToSlide(index) {
        const allSlides = sliderTrack.querySelectorAll(".sale-slide");
        const allDots = sliderDots.querySelectorAll(".slider-dot");

        if (!allSlides[currentSlide] || !allDots[currentSlide]) return;

        allSlides[currentSlide].classList.remove("sale-slide--active");
        allDots[currentSlide].classList.remove("slider-dot--active");
        allDots[currentSlide].setAttribute("aria-selected", "false");

        currentSlide = index;

        if (allSlides[currentSlide] && allDots[currentSlide]) {
            allSlides[currentSlide].classList.add("sale-slide--active");
            allDots[currentSlide].classList.add("slider-dot--active");
            allDots[currentSlide].setAttribute("aria-selected", "true");
        }
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    // Button controls
    const nextBtn = document.getElementById("sliderNext");
    const prevBtn = document.getElementById("sliderPrev");

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    // Keyboard accessibility for slider
    document.addEventListener("keydown", (e) => {
        const slider = document.getElementById("saleSlider");
        if (!slider) return;
        const rect = slider.getBoundingClientRect();
        // Only trigger if slider is somewhat in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            if (e.key === "ArrowLeft") {
                prevSlide();
                resetAutoPlay();
            } else if (e.key === "ArrowRight") {
                nextSlide();
                resetAutoPlay();
            }
        }
    });

    // Auto-play timer management (prevents multiple intervals)
    function startAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, 6000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        startAutoPlay();
    }

    startAutoPlay();

    const saleSlider = document.getElementById("saleSlider");
    if (saleSlider) {
        saleSlider.addEventListener("mouseenter", () => clearInterval(autoPlayTimer));
        saleSlider.addEventListener("mouseleave", () => startAutoPlay());
    }
}


// =========================================
// 3. INDEPENDENT PRODUCT GRIDS & SHUFFLING
// =========================================

/**
 * Maps retailer keys to their corresponding homepage article section IDs
 */
const RETAILER_SECTION_MAP = {
    topDeals: "topDealsSection",
    amazon: "amazonSection",
    flipkart: "flipkartSection",
    meesho: "meeshoSection",
    jiomart: "jiomartSection",
    myntra: "myntraSection"
};

/**
 * Renders products into a specified container after performing
 * an independent Fisher-Yates shuffle on a copy of the dataset.
 * Automatically manages homepage section visibility for empty retailer datasets.
 */
function renderShuffledSection(containerId, retailerKey) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sectionId = RETAILER_SECTION_MAP[retailerKey];
    const sectionElement = sectionId ? document.getElementById(sectionId) : null;

    // Retrieve products from central ProductStore
    let products = [];
    if (typeof window.ProductStore !== "undefined") {
        products = window.ProductStore.getByRetailer(retailerKey);
    }

    // Phase 2.4 & Phase 10 Rule:
    // If a retailer currently has 0 products in the live Google Sheet,
    // hide the redundant empty section from the homepage to maintain visual polish,
    // while keeping retailer navigation intact.
    if (!products || products.length === 0) {
        if (sectionElement && retailerKey !== "topDeals" && retailerKey !== "amazon") {
            sectionElement.style.display = "none";
        } else if (container) {
            container.innerHTML = `
                <div class="retailer-empty-hint" style="grid-column: 1 / -1; padding: 36px 20px; text-align: center; color: #64748b; background: #ffffff; border-radius: 12px; border: 1.5px dashed #e2e8f0;">
                    <i class="fa-solid fa-store-slash" style="font-size: 28px; margin-bottom: 10px; color: #ff8a00; display: block;"></i>
                    <h4 style="margin: 0 0 6px 0; font-size: 16px; color: #1e293b; font-weight: 700;">No Products Listed Yet</h4>
                    <p style="margin: 0; font-size: 13.5px;">Curating fresh verified deals for this collection. Please check back shortly!</p>
                </div>
            `;
        }
        return;
    }

    // If products exist, ensure section is visible
    if (sectionElement) {
        sectionElement.style.display = "block";
    }

    // Use unbiased Fisher-Yates shuffle on an independent clone
    const shuffledProducts = typeof window.shuffleArray === "function" 
        ? window.shuffleArray(products) 
        : [...products].sort(() => Math.random() - 0.5);

    // Display 8 items for a balanced 2 full rows in 4-column desktop grid
    const displayProducts = shuffledProducts.slice(0, 8);

    // Render cards using shared card generator
    if (typeof window.createProductCardHTML === "function") {
        container.innerHTML = displayProducts.map(p => window.createProductCardHTML(p, "./")).join("");
    }
}

function renderAllSections() {
    renderShuffledSection("topDealsContainer", "topDeals");
    renderShuffledSection("amazonContainer", "amazon");
    renderShuffledSection("flipkartContainer", "flipkart");
    renderShuffledSection("meeshoContainer", "meesho");
    renderShuffledSection("jiomartContainer", "jiomart");
    renderShuffledSection("myntraContainer", "myntra");
}

// Execute independent shuffle & rendering for all containers on page load
document.addEventListener("DOMContentLoaded", () => {
    // Await ProductStore ready if available
    if (window.ProductStore && window.ProductStore.ready) {
        window.ProductStore.ready().then(() => {
            renderAllSections();
        });
    } else {
        renderAllSections();
    }
});

// Reactively re-render when live Google Sheet catalog is ready/updated
window.addEventListener("trendshow:catalog-updated", () => {
    renderAllSections();
});