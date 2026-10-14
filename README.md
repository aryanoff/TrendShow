# TrendShow

> Multi-Retailer Deals, Discounts & Fashion Trends Discovery Platform

TrendShow is a high-performance, responsive e-commerce affiliate and deal discovery platform that aggregates live curated deals across top retailers (Amazon, Flipkart, Meesho, JioMart, Myntra) directly from a central Google Sheets catalog.

---

## 🌟 Key Features

- **Live Google Sheets Integration**: Real-time product feeds utilizing Google Visualization (GViz) API with 5-minute browser caching (`stale-while-revalidate`).
- **Truth-in-Data Architecture**: Genuine listed prices, exact discount badges from spreadsheet records, and zero fabricated review counts or inflated MRPs.
- **Multi-Retailer Discovery**: Curated hubs for Amazon, Flipkart, Meesho, JioMart, and Myntra.
- **Dynamic Top Deals**: Automatically ranks and surfaces deals with 60%+ discounts from active catalog rows.
- **Responsive Grid Design**:
  - Large Desktop ($\ge 1536\text{px}$): 5-column balanced layout
  - Standard Desktop ($1150\text{px} - 1535\text{px}$, including 1366px): 4-column spacious grid
  - Tablets ($860\text{px} - 1149\text{px}$): 3 columns
  - Mobile ($480\text{px} - 859\text{px}$): 2 columns
  - Small Mobile ($< 480\text{px}$): 2 compact columns
- **Instant Live Search**: Relevance-scored multi-term search with keyboard navigation, clear query highlighting, and popular search chips.
- **Accessible Interactions**: Collapsible product descriptions with "Read full description" toggles, full keyboard support, and transparent affiliate redirection disclosures.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, CSS Grid, Flexbox), Vanilla JavaScript (ES6+).
- **Icons & Fonts**: Font Awesome 6.5, Google Fonts (Inter).
- **Data Source**: Live Google Sheet via GViz JSON / JSONP / CSV export.

---

## 🚀 Getting Started

Simply open `index.html` in your web browser, or serve it using any local web server:

```bash
# Using Node.js
npx serve .

# Or using Python
python -m http.server 3000
```

Navigate to `http://localhost:3000` to browse TrendShow.

---

## 📄 License & Attribution

Designed and engineered for practice, advanced UI/UX layout engineering, and responsive e-commerce affiliate architecture. Outbound merchant links route to official retailers with qualifying commission attribution.
