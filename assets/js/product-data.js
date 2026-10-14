/**
 * TrendShow - Central Product & Retailer Data Service
 * Connects directly to the live Google Sheets product catalog:
 * https://docs.google.com/spreadsheets/d/1aw8tIA-a4UUHuTh6ur8fOB06x47TzbS_NdPh0qs3ebk/edit?gid=0#gid=0
 * 
 * Strict E-Commerce Integrity Standards:
 * - Google Sheets is the SINGLE SOURCE OF TRUTH. Zero fabricated fallback products.
 * - Dynamic GViz JSON & CORS-safe JSONP / CSV loader.
 * - 5-minute localStorage cache with stale-while-revalidate background refresh.
 * - Unified normalized schema for all retailer portals, category pages, search, and detail pages.
 * - Dispatches 'trendshow:catalog-updated' custom event for reactive UI updates.
 */

// =========================================
// 1. RETAILER & CATEGORY METADATA
// =========================================

const RETAILERS_DATA = {
    amazon: {
        id: "amazon",
        name: "Amazon",
        tagline: "Great Indian Festival & Prime Deals",
        color: "#ff9900",
        darkColor: "#131921",
        lightColor: "#fffcf5",
        borderColor: "#ffd699",
        badge: "Amazon Exclusive",
        icon: "fa-brands fa-amazon",
        logo: "https://static.vecteezy.com/system/resources/thumbnails/019/766/240/small/amazon-logo-amazon-icon-transparent-free-png.png",
        banner: "https://assets.aboutamazon.com/8a/3f/e7ebea4e453bb94dca93111d35ed/great-indian-festival-2026.jpeg",
        affiliateBase: "https://www.amazon.in"
    },
    flipkart: {
        id: "flipkart",
        name: "Flipkart",
        tagline: "Big Billion Days & Flipkart Assured",
        color: "#2874f0",
        darkColor: "#185ecc",
        lightColor: "#f2f7ff",
        borderColor: "#bed8ff",
        badge: "Flipkart Assured",
        icon: "fa-solid fa-bolt",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Flipkart_logo_%282026%29.svg",
        banner: "https://assets.myntassets.com/w_980,c_limit,fl_progressive,dpr_2.0/assets/images/2022/7/25/9be788ff-39a4-4214-99d0-fc97505aae5a1658752545685-USPA_Desk_Banner.jpg",
        affiliateBase: "https://www.flipkart.com"
    },
    meesho: {
        id: "meesho",
        name: "Meesho",
        tagline: "Mega Blockbuster & Lowest Prices Guaranteed",
        color: "#9f2089",
        darkColor: "#580f49",
        lightColor: "#fdf2fa",
        borderColor: "#f6bede",
        badge: "Lowest Price",
        icon: "fa-solid fa-tag",
        logo: "https://cdn.iconscout.com/icon/free/png-256/free-meesho-icon-svg-download-png-10673438.png?f=webp",
        banner: "https://flipshope.com/blog/wp-content/uploads/2026/10/ChatGPT-Image-Oct-8-2026-11_07_40-AM-1mb.jpeg",
        affiliateBase: "https://www.meesho.com"
    },
    jiomart: {
        id: "jiomart",
        name: "JioMart",
        tagline: "Festive Dhamaka & Everyday Super Savers",
        color: "#0078ad",
        darkColor: "#0a3d62",
        lightColor: "#f0f8fd",
        borderColor: "#bce1f7",
        badge: "Super Saver",
        icon: "fa-solid fa-basket-shopping",
        logo: "https://palred.com/wp-content/uploads/2024/05/jiomart.png",
        banner: "https://inc42.com/wp-content/uploads/2022/10/jio-mart-social.png",
        affiliateBase: "https://www.jiomart.com"
    },
    topDeals: {
        id: "topDeals",
        name: "Top Deals",
        tagline: "Curated Live Deals with High Discounts",
        color: "#ff5722",
        darkColor: "#d84315",
        lightColor: "#fff7f2",
        borderColor: "#ffccba",
        badge: "Top Discount",
        icon: "fa-solid fa-fire",
        logo: "https://static.vecteezy.com/system/resources/thumbnails/026/976/930/small/best-deal-label-alphabet-3d-text-effect-promotion-discount-label-templates-png.png",
        banner: "https://assets.myntassets.com/w_980,c_limit,fl_progressive,dpr_2.0/assets/images/2026/OCTOBER/6/66e76e2f18ae4a88ac668d763981077f.gif",
        affiliateBase: "https://www.trendshow.com/deals"
    },
    myntra: {
        id: "myntra",
        name: "Myntra",
        tagline: "Fashion Fiesta & Runway Collections",
        color: "#ff3f6c",
        darkColor: "#e02f5a",
        lightColor: "#fff2f5",
        borderColor: "#ffc2d1",
        badge: "Runway Trends",
        icon: "fa-solid fa-crown",
        logo: "https://logos-world.net/wp-content/uploads/2022/12/Myntra-Logo.png",
        banner: "https://res.cloudinary.com/ams1rfsh/image/upload/v1791906056/fashion-hero_gs1lkw.jpg",
        affiliateBase: "https://www.myntra.com"
    }
};

const CATEGORIES_DATA = [
    { id: "streetwear", name: "Streetwear & Casuals", icon: "fa-solid fa-shirt", count: 0 },
    { id: "ethnic", name: "Ethnic & Festive Wear", icon: "fa-solid fa-vest-patches", count: 0 },
    { id: "footwear", name: "Sneakers & Footwear", icon: "fa-solid fa-shoe-prints", count: 0 },
    { id: "activewear", name: "Sport & Athleisure", icon: "fa-solid fa-person-running", count: 0 },
    { id: "accessories", name: "Watches, Tech & Bags", icon: "fa-solid fa-clock", count: 0 },
    { id: "home-living", name: "Home, Living & Decor", icon: "fa-solid fa-couch", count: 0 }
];

// =========================================
// 2. GOOGLE SHEETS CONFIG & STATE
// =========================================

const GOOGLE_SHEET_CONFIG = {
    spreadsheetId: "1aw8tIA-a4UUHuTh6ur8fOB06x47TzbS_NdPh0qs3ebk",
    gid: "0",
    tabName: "Sheet1",
    cacheKey: "trendshow_catalog_cache_v3",
    cacheTtlMs: 5 * 60 * 1000 // 5 minutes cache TTL
};

// Internal canonical product catalog (starts empty until live sheet or cache is loaded)
let ALL_PRODUCTS = [];

// Diagnostics and integration status
let catalogStatus = {
    isLive: false,
    source: "initializing",
    spreadsheetId: GOOGLE_SHEET_CONFIG.spreadsheetId,
    sheetName: GOOGLE_SHEET_CONFIG.tabName,
    validRecordCount: 0,
    rejectedRecordCount: 0,
    rejectedRecords: [],
    retailerCounts: {
        amazon: 0,
        flipkart: 0,
        meesho: 0,
        jiomart: 0,
        myntra: 0
    },
    lastUpdated: null,
    error: null
};

// =========================================
// 3. INTELLIGENT PARSING & NORMALIZATION
// =========================================

/**
 * Brand extraction based strictly on title prefix and curated dictionary
 */
function extractBrand(title) {
    if (!title || typeof title !== "string") return "";
    const cleaned = title.trim();
    const knownBrands = [
        "OnePlus", "vivo", "iQOO", "Apple", "Lenovo", "Samsung", "Redragon",
        "Orient Electric", "Wakefit", "SOFTSPUN", "ANNI Designer", "GoSriKi",
        "Campus", "AAZEEM", "VAS COLLECTIONS", "haus & kinder", "Anupam",
        "BLINKIN", "Amazon Basics", "Wooum", "ZEBRONICS", "GOVO", "Kraasa",
        "Safari", "Niwlix", "DEELMO", "Mehrang", "CIPZI", "Hallstatt",
        "Story@Home", "Dream Weaverz", "Pinkmint", "Reebok", "Metronaut",
        "Roadster", "Tokyo Talkies", "Provogue", "HRX", "Mast & Harbour",
        "Symbol", "Solimo", "Inkast Denim Co.", "Eden & Ivy", "Jam & Honey"
    ];
    for (const b of knownBrands) {
        if (new RegExp(`^${b}\\b`, "i").test(cleaned)) {
            return b;
        }
    }
    if (/^Amazon Brand - /i.test(cleaned)) {
        const parts = cleaned.split("-");
        if (parts[1]) return `Amazon ${parts[1].trim().split(" ")[0]}`;
        return "Amazon Brand";
    }
    // Return empty if no confident brand can be identified, rather than guessing
    return "";
}

/**
 * Infer retailer conservatively from affiliate link or type column
 */
function detectRetailer(affiliateLink, type, imageUrl) {
    if (type && typeof type === "string" && type.trim()) {
        const t = type.toLowerCase().trim();
        if (["amazon", "flipkart", "meesho", "jiomart", "myntra"].includes(t)) {
            return t;
        }
    }
    const link = (affiliateLink || "").toLowerCase();
    if (link.includes("amazon.") || link.includes("amzn.") || link.includes("link.amazon")) return "amazon";
    if (link.includes("flipkart.") || link.includes("fkrt.")) return "flipkart";
    if (link.includes("meesho.")) return "meesho";
    if (link.includes("jiomart.")) return "jiomart";
    if (link.includes("myntra.")) return "myntra";

    // Conservative fallback: check image URL host
    const img = (imageUrl || "").toLowerCase();
    if (img.includes("amazon.com") || img.includes("media-amazon.com")) return "amazon";
    if (img.includes("flixcart.com")) return "flipkart";

    return "amazon";
}

/**
 * Category detection from title keywords
 */
function detectCategory(title, type) {
    if (type && typeof type === "string") {
        const t = type.toLowerCase().trim();
        if (["streetwear", "ethnic", "footwear", "activewear", "accessories", "home-living"].includes(t)) {
            return t;
        }
    }
    const text = (title || "").toLowerCase();
    if (/\b(kurti|kurta|anarkali|saree|ethnic|dupatta|palazzo|lehenga)\b/.test(text)) return "ethnic";
    if (/\b(shoe|shoes|runner|sneaker|sneakers|boots|loafer|loafers|footwear)\b/.test(text)) return "footwear";
    if (/\b(gym|workout|track pant|fitness|yoga|tights|waist belt|belly belt)\b/.test(text)) return "activewear";
    if (/\b(bedsheet|pillow|blanket|mattress|towel|duster|cleaning|cloths|cushion|mat|door mat|oil sprayer|iron|refrigerator|bottle)\b/.test(text)) return "home-living";
    if (/\b(phone|mobile|5g|iphone|oneplus|vivo|iqoo|laptop|tab|tablet|soundbar|speaker|keyboard|trolley|suitcase|bag|sling|pouch|sketchbook)\b/.test(text)) return "accessories";
    if (/\b(shirt|shirts|jeans|trousers|pant|pants|dress|jacket|tunic|tops|casual)\b/.test(text)) return "streetwear";
    return "streetwear";
}

/**
 * Validate outbound URL format
 */
function isValidUrl(string) {
    if (!string || typeof string !== "string") return false;
    const clean = string.trim();
    return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(clean);
}

/**
 * Parse Google Sheets GViz table rows into canonical normalized product records
 */
function parseGvizRows(rawRows) {
    const validProducts = [];
    const rejectedRows = [];
    const seenIds = new Set();
    const retailerCounts = { amazon: 0, flipkart: 0, meesho: 0, jiomart: 0, myntra: 0 };

    if (!Array.isArray(rawRows)) {
        return { validProducts, rejectedRows, retailerCounts };
    }

    rawRows.forEach((row, index) => {
        const rowNum = index + 2; // Row 1 is header in sheet
        const c = (row && row.c) ? row.c : [];

        const title = c[0] && c[0].v !== null ? String(c[0].v).trim() : "";
        const details = c[1] && c[1].v !== null ? String(c[1].v).trim() : "";
        const image = c[2] && c[2].v !== null ? String(c[2].v).trim() : "";

        // Parse discount percent
        let discountNum = 0;
        let offerStr = "";
        if (c[3]) {
            if (typeof c[3].v === "number") {
                discountNum = Math.round(Math.abs(c[3].v) * 100);
            } else if (c[3].f) {
                const m = String(c[3].f).match(/\d+/);
                if (m) discountNum = parseInt(m[0], 10);
            }
        }
        if (discountNum > 0) {
            offerStr = `${discountNum}% OFF`;
        }

        // Parse price
        let priceNum = 0;
        let priceStr = "";
        if (c[4]) {
            if (typeof c[4].v === "number") {
                priceNum = c[4].v;
                priceStr = `₹${priceNum.toLocaleString("en-IN")}`;
            } else if (c[4].f) {
                const numeric = String(c[4].f).replace(/[^0-9]/g, "");
                if (numeric) {
                    priceNum = parseInt(numeric, 10);
                    priceStr = `₹${priceNum.toLocaleString("en-IN")}`;
                }
            }
        }

        const affiliateUrl = c[5] && c[5].v !== null ? String(c[5].v).trim() : "";
        const typeCol = c[6] && c[6].v !== null ? String(c[6].v).trim() : "";

        // Reject empty or incomplete divider rows (e.g., Row 51 "FlipKart")
        if (!title || (!image && !affiliateUrl && !priceNum)) {
            rejectedRows.push({
                rowNum,
                title: title || "(empty row)",
                reason: "Incomplete row lacking price, image, and outbound URL"
            });
            return;
        }

        // Generate deterministic, stable product ID
        let rawId = "";
        if (affiliateUrl) {
            const asinMatch = affiliateUrl.match(/[A-Z0-9]{9,10}/i);
            if (asinMatch) rawId = `gs-${asinMatch[0]}`;
        }
        if (!rawId) {
            rawId = `gs-row-${rowNum}`;
        }

        let finalId = rawId;
        let idCounter = 1;
        while (seenIds.has(finalId)) {
            idCounter++;
            finalId = `${rawId}-${idCounter}`;
        }
        seenIds.add(finalId);

        const retailer = detectRetailer(affiliateUrl, typeCol, image);
        retailerCounts[retailer] = (retailerCounts[retailer] || 0) + 1;

        const brand = extractBrand(title);
        const category = detectCategory(title, typeCol);
        const isFeatured = discountNum >= 70;

        // Valid image or neutral placeholder
        const validImage = image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80";

        // Retailer display name
        const retailerMeta = RETAILERS_DATA[retailer] || RETAILERS_DATA.amazon;
        const retailerName = retailerMeta.name;

        // Canonical Product Record
        validProducts.push({
            id: finalId,
            title,
            brand,
            retailer,
            retailerName,
            category,
            tag: offerStr || "",
            offer: offerStr || "",
            discountPercent: discountNum,
            price: priceNum || null,
            currentPrice: priceNum || null,
            priceRange: priceStr || (priceNum ? `₹${priceNum}` : "Check Price"),
            image: validImage,
            imageUrl: validImage,
            alt: brand ? `${brand} - ${title}` : title,
            description: details || "Explore current pricing, verified specifications, and available options directly on the official merchant site.",
            affiliateUrl: isValidUrl(affiliateUrl) ? affiliateUrl : "",
            button: `Shop ${retailerName}`,
            featured: isFeatured,
            availability: "In Stock",
            rowNumber: rowNum,
            updatedAt: new Date().toISOString()
        });
    });

    return { validProducts, rejectedRows, retailerCounts };
}

/**
 * Set active catalog and update category counts
 */
function applyCatalog(products, sourceName) {
    ALL_PRODUCTS = Array.isArray(products) ? [...products] : [];

    // Recalculate dynamic category counts
    CATEGORIES_DATA.forEach(cat => {
        cat.count = ALL_PRODUCTS.filter(p => p.category.toLowerCase() === cat.id.toLowerCase()).length;
    });

    // Save to localStorage cache
    if (typeof window !== "undefined" && window.localStorage && ALL_PRODUCTS.length > 0) {
        try {
            const cachePayload = {
                timestamp: Date.now(),
                source: sourceName,
                products: ALL_PRODUCTS,
                sheetId: GOOGLE_SHEET_CONFIG.spreadsheetId
            };
            window.localStorage.setItem(GOOGLE_SHEET_CONFIG.cacheKey, JSON.stringify(cachePayload));
        } catch (e) {
            console.warn("[TrendShow] Failed to write cache to localStorage:", e);
        }
    }
}

// =========================================
// 4. FETCH WORKFLOWS (GVIZ JSON / JSONP / CSV)
// =========================================

async function fetchViaGvizJson() {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_CONFIG.spreadsheetId}/gviz/tq?tqx=out:json&gid=${GOOGLE_SHEET_CONFIG.gid}`;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 12000) : null;

    try {
        const response = await fetch(url, { signal: controller ? controller.signal : undefined });
        if (timeoutId) clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const text = await response.text();
        const jsonStr = text.replace(/^[^(]*\(/, "").replace(/\);?\s*$/, "");
        const data = JSON.parse(jsonStr);
        return data.table.rows;
    } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        throw err;
    }
}

function fetchViaJsonp() {
    return new Promise((resolve, reject) => {
        if (typeof document === "undefined" || !document.head || typeof document.head.appendChild !== "function") {
            return reject(new Error("JSONP only available in browser"));
        }

        const callbackName = `trendshow_gviz_cb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const script = document.createElement("script");
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("JSONP request timed out"));
        }, 12000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = (data) => {
            cleanup();
            if (data && data.table && data.table.rows) {
                resolve(data.table.rows);
            } else {
                reject(new Error("Invalid JSONP response table"));
            }
        };

        script.src = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_CONFIG.spreadsheetId}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${GOOGLE_SHEET_CONFIG.gid}`;
        script.onerror = () => {
            cleanup();
            reject(new Error("Failed to load Google Sheets via JSONP"));
        };

        document.head.appendChild(script);
    });
}

function parseCsvToGvizRows(csvText) {
    const lines = [];
    let currentLine = [];
    let currentToken = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentToken += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            currentLine.push(currentToken.trim());
            currentToken = "";
        } else if ((char === "\r" || char === "\n") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") i++;
            currentLine.push(currentToken.trim());
            currentToken = "";
            if (currentLine.some(token => token.length > 0)) {
                lines.push(currentLine);
            }
            currentLine = [];
        } else {
            currentToken += char;
        }
    }
    if (currentToken || currentLine.length > 0) {
        currentLine.push(currentToken.trim());
        if (currentLine.some(token => token.length > 0)) {
            lines.push(currentLine);
        }
    }

    if (lines.length <= 1) return [];

    return lines.slice(1).map(tokens => ({
        c: [
            tokens[0] ? { v: tokens[0] } : null,
            tokens[1] ? { v: tokens[1] } : null,
            tokens[2] ? { v: tokens[2] } : null,
            tokens[3] ? { v: tokens[3], f: tokens[3] } : null,
            tokens[4] ? { v: tokens[4], f: tokens[4] } : null,
            tokens[5] ? { v: tokens[5] } : null,
            tokens[6] ? { v: tokens[6] } : null
        ]
    }));
}

async function fetchViaCsv() {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_CONFIG.spreadsheetId}/export?format=csv&gid=${GOOGLE_SHEET_CONFIG.gid}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CSV HTTP error ${response.status}`);
    const csvText = await response.text();
    return parseCsvToGvizRows(csvText);
}

/**
 * Load Google Sheets catalog with cache revalidation
 */
let readyPromise = null;

async function loadCatalog(forceRefresh = false) {
    // 1. Check localStorage Cache
    if (!forceRefresh && typeof window !== "undefined" && window.localStorage) {
        try {
            const rawCache = window.localStorage.getItem(GOOGLE_SHEET_CONFIG.cacheKey);
            if (rawCache) {
                const cache = JSON.parse(rawCache);
                const age = Date.now() - (cache.timestamp || 0);
                if (cache.products && Array.isArray(cache.products) && cache.products.length > 0) {
                    applyCatalog(cache.products, "localStorage_cache");
                    catalogStatus = {
                        isLive: true,
                        source: "localStorage_cache",
                        spreadsheetId: GOOGLE_SHEET_CONFIG.spreadsheetId,
                        sheetName: GOOGLE_SHEET_CONFIG.tabName,
                        validRecordCount: cache.products.length,
                        rejectedRecordCount: 0,
                        rejectedRecords: [],
                        retailerCounts: {
                            amazon: cache.products.filter(p => p.retailer === "amazon").length,
                            flipkart: cache.products.filter(p => p.retailer === "flipkart").length,
                            meesho: cache.products.filter(p => p.retailer === "meesho").length,
                            jiomart: cache.products.filter(p => p.retailer === "jiomart").length,
                            myntra: cache.products.filter(p => p.retailer === "myntra").length
                        },
                        lastUpdated: new Date(cache.timestamp).toISOString(),
                        error: null
                    };

                    // Fresh cache (< 5 min) resolves immediately
                    if (age < GOOGLE_SHEET_CONFIG.cacheTtlMs) {
                        return ALL_PRODUCTS;
                    }
                }
            }
        } catch (e) {
            console.warn("[TrendShow] Error reading localStorage cache:", e);
        }
    }

    // 2. Fetch live data from Google Sheets
    try {
        let rawRows = null;
        try {
            rawRows = await fetchViaGvizJson();
        } catch (fetchErr) {
            try {
                rawRows = await fetchViaJsonp();
            } catch (jsonpErr) {
                rawRows = await fetchViaCsv();
            }
        }

        const { validProducts, rejectedRows, retailerCounts } = parseGvizRows(rawRows);

        if (validProducts.length === 0) {
            throw new Error("Spreadsheet returned 0 valid product records");
        }

        applyCatalog(validProducts, "google_sheets_live");

        catalogStatus = {
            isLive: true,
            source: "google_sheets_live",
            spreadsheetId: GOOGLE_SHEET_CONFIG.spreadsheetId,
            sheetName: GOOGLE_SHEET_CONFIG.tabName,
            validRecordCount: validProducts.length,
            rejectedRecordCount: rejectedRows.length,
            rejectedRecords: rejectedRows,
            retailerCounts,
            lastUpdated: new Date().toISOString(),
            error: null
        };

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("trendshow:catalog-updated", {
                detail: { ...catalogStatus, products: ALL_PRODUCTS }
            }));
        }

        return ALL_PRODUCTS;
    } catch (err) {
        console.error("[TrendShow] Live catalog fetch failed:", err);
        catalogStatus.error = err.message;

        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("trendshow:catalog-updated", {
                detail: { ...catalogStatus, products: ALL_PRODUCTS }
            }));
        }

        return ALL_PRODUCTS;
    }
}

// Auto-start load in browser environments
if (typeof window !== "undefined") {
    readyPromise = loadCatalog();
}

// =========================================
// 5. CENTRAL PRODUCTSTORE QUERY API
// =========================================

const ProductStore = {
    /**
     * Resolves when catalog has loaded
     */
    ready: () => readyPromise || Promise.resolve(ALL_PRODUCTS),

    /**
     * Retrieve all active products
     */
    getAll: () => [...ALL_PRODUCTS],

    /**
     * Retrieve products for a specific retailer
     */
    getByRetailer: (retailerKey) => {
        if (!retailerKey) return [];
        const key = retailerKey.toLowerCase();

        if (key === "topdeals" || key === "top-deals") {
            // Live Data-Driven Top Deals: products with >= 60% discount, sorted descending
            return ALL_PRODUCTS
                .filter(p => (p.discountPercent || 0) >= 60)
                .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        }

        return ALL_PRODUCTS.filter(p => (p.retailer || "").toLowerCase() === key);
    },

    /**
     * Retrieve products by category
     */
    getByCategory: (catId) => {
        if (!catId || catId === "all") return [...ALL_PRODUCTS];
        return ALL_PRODUCTS.filter(p => (p.category || "").toLowerCase() === catId.toLowerCase());
    },

    /**
     * Retrieve single product by unique ID
     */
    getById: (id) => {
        if (!id) return null;
        return ALL_PRODUCTS.find(p => p.id === id) || null;
    },

    /**
     * Retrieve featured high-discount products
     */
    getFeatured: () => ALL_PRODUCTS.filter(p => p.featured),

    /**
     * Retrieve ranked top deals
     */
    getTopDeals: (limit = 12) => {
        return ALL_PRODUCTS
            .filter(p => (p.discountPercent || 0) >= 60)
            .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
            .slice(0, limit);
    },

    /**
     * Multi-term relevance-scored product search
     */
    search: (query) => {
        if (!query || typeof query !== "string" || !query.trim()) return [];
        const cleanQuery = query.toLowerCase().trim();
        const terms = cleanQuery.split(/\s+/).filter(Boolean);

        const scored = [];

        for (const p of ALL_PRODUCTS) {
            const title = (p.title || "").toLowerCase();
            const brand = (p.brand || "").toLowerCase();
            const retailer = (p.retailer || "").toLowerCase();
            const category = (p.category || "").toLowerCase();
            const description = (p.description || "").toLowerCase();
            const offer = (p.offer || "").toLowerCase();

            const fullText = `${title} ${brand} ${retailer} ${category} ${description} ${offer}`;

            const allTermsMatch = terms.every(term => fullText.includes(term));
            if (!allTermsMatch) continue;

            let score = 0;
            if (title === cleanQuery) score += 120;
            else if (title.startsWith(cleanQuery)) score += 80;
            else if (title.includes(cleanQuery)) score += 50;

            if (brand && brand === cleanQuery) score += 60;
            else if (brand && brand.includes(cleanQuery)) score += 35;

            if (retailer === cleanQuery) score += 40;
            if (category === cleanQuery) score += 30;

            terms.forEach(term => {
                if (title.includes(term)) score += 20;
                if (brand && brand.includes(term)) score += 15;
                if (retailer.includes(term)) score += 10;
                if (category.includes(term)) score += 10;
                if (description.includes(term)) score += 4;
            });

            if (p.featured) score += 5;

            scored.push({ product: p, score });
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.map(item => item.product);
    },

    getPopularSearches: () => [
        "Kurtis",
        "Microfiber Duster",
        "Bedsheets",
        "Air Fryer Bottle",
        "Slim Fit Trousers",
        "Waist Belt",
        "Cotton Shirt"
    ],

    getFeaturedRetailers: () => [
        { key: "amazon", name: "Amazon" },
        { key: "flipkart", name: "Flipkart" },
        { key: "myntra", name: "Myntra" },
        { key: "meesho", name: "Meesho" },
        { key: "jiomart", name: "JioMart" }
    ],

    getRetailerMeta: (retailerKey) => {
        if (!retailerKey) return null;
        return RETAILERS_DATA[retailerKey.toLowerCase()] || null;
    },

    refreshCatalog: (force = true) => loadCatalog(force),

    getStatus: () => ({ ...catalogStatus })
};

// =========================================
// 6. GLOBAL & MODULE EXPORTS
// =========================================

if (typeof globalThis !== "undefined") {
    globalThis.RETAILERS_DATA = RETAILERS_DATA;
    globalThis.CATEGORIES_DATA = CATEGORIES_DATA;
    globalThis.ALL_PRODUCTS = ALL_PRODUCTS;
    globalThis.ProductStore = ProductStore;
    globalThis.GOOGLE_SHEET_CONFIG = GOOGLE_SHEET_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        RETAILERS_DATA,
        CATEGORIES_DATA,
        ALL_PRODUCTS,
        ProductStore,
        GOOGLE_SHEET_CONFIG,
        loadCatalog,
        parseGvizRows,
        extractBrand,
        detectRetailer,
        detectCategory
    };
}
