# RD Café AI — Business Plan & Pitch
### The Restaurant Operating System that predicts tomorrow

**Founder:** Rajan Dhakal
**Working prototype:** https://rd-cafe-bar.vercel.app
**Prepared:** July 2026

---

## 1. The One-Line Pitch

> **RD Café AI predicts tomorrow's demand from live weather and sales data, then automatically orders exactly what a restaurant needs — no more, no less.**

Small restaurants in Japan are closing at record rates because they cannot find staff and cannot control costs. We give a café owner the forecasting brain of a large chain, for ¥5,000 a month.

---

## 2. The Problem (with real numbers)

### 2.1 Japan's restaurants are failing at a record rate

- **411 food-service bankruptcies** in Jan–May alone — the highest ever recorded for that five-month period (Tokyo Shoko Research).
- Bankruptcies **directly linked to labor shortages doubled** year-on-year; those tied to soaring labor costs surged **6.6-fold**.
- Rising food and labor costs cannot be passed to customers: restaurants that raised prices **lost traffic**.

### 2.2 Nobody to hire

- **86% of Japanese restaurant owners** report a moderate-to-severe labor shortage.
- Turnover is **41.2%** — nearly half the staff leave every year.
- Japan's working-age population fell by ~900,000 in a decade; by 2040 the economy faces a shortfall of **6.4 million workers**.
- Result: shorter hours, closed days, fewer seats.

**Consequence:** the owner who used to have a manager doing the ordering is now doing it alone, at midnight, from memory.

### 2.3 The waste nobody is fixing ← *our wedge*

Japan cut business food waste by 58% from the 2000 baseline. Every category improved — **except one.**

| Category | FY2023 trend |
|---|---|
| Food manufacturers | ↓ down |
| Packaging | ↓ down |
| Retail | ↓ down |
| **Foodservice (restaurants)** | **↑ UP by 60,000 tons** |

Restaurants now waste **660,000 tons/year**, and MAFF has publicly stated it is "working to address" foodservice as the problem category. Japan's national target is a **60% cut in business food waste**.

Nationally, food waste costs **¥4 trillion** a year and 10.5 million tons of CO₂.

> **Restaurants are the only sector moving in the wrong direction — and they are the sector with no staff left to fix it.**

### 2.4 Why it happens

A café owner orders stock by intuition:
- Order too much → milk spoils, cake goes stale → money in the bin.
- Order too little → items sell out → lost revenue, angry customers.

Nobody has time to check tomorrow's weather, cross-reference last year's rainy Tuesday, and calculate how much milk that means. **Large chains have data teams for this. A 5-person café has nobody.**

**68% of Japan's 2.15 million food establishments are small-scale (1–5 employees).** That is our market.

---

## 3. The Solution

**RD Café AI** is a Restaurant Operating System with a forecasting engine at its core.

### The daily loop

```
   Live weather + day-of-week + past sales
                  ↓
        AI DEMAND FORECAST
   "Tomorrow: 309 guests. Cold Coffee +44%.
    Hot Coffee −25%. Rain → 50% delivery."
                  ↓
        AUTO PURCHASE ORDER
   "Milk 33 L · Coffee beans 4 kg · Ice 29 kg
    Delivery packaging 56 boxes (+40%, rain)"
                  ↓
     ONE CLICK → EMAIL TO SUPPLIER
                  ↓
     INVENTORY UPDATES · WASTE FALLS
```

### What is live today (working prototype)

| Module | Status |
|---|---|
| Customer ordering, cart, order tracking | ✅ Live |
| Online payment (eSewa, Khalti, card) | ✅ Live |
| Table reservation, reviews, loyalty points | ✅ Live |
| Admin dashboard, sales analytics | ✅ Live |
| **AI Demand Forecast (live weather)** | ✅ Live |
| **Auto Purchase Order + supplier email** | ✅ Live |
| **Inventory tracking + low-stock alerts** | ✅ Live |
| Multi-language (JP / EN / NP) | 🔜 Phase 2 |
| AI Business Advisor (natural-language Q&A) | 🔜 Phase 2 |

*Everything above is deployed and demonstrable, not a mockup.*

### How the forecast works

The engine reads live weather (Open-Meteo) and applies demand rules derived from café sales patterns:

- **Heat (≥28°C)** → cold drinks +70%, hot coffee −35%
- **Cold (≤16°C)** → hot coffee +55%, food +30%
- **Rain** → delivery share rises to 50%, packaging +40%
- **Weekend** → footfall +18%

It converts these into ingredient quantities, groups them by supplier, and drafts the order. The owner adjusts with ± buttons, flags items for auto-ordering, and sends.

**Honest note for judges:** the prototype is rules-based, calibrated on café sales patterns. Once a café accumulates ~3 months of its own order history, those rules are replaced by a model trained on that specific café. The rules are the cold-start; the data is the moat.

---

## 4. Why This Wins Where Others Don't

| | POS systems (Square, Airregi) | Delivery apps | **RD Café AI** |
|---|---|---|---|
| Records what happened | ✅ | ✅ | ✅ |
| **Predicts what will happen** | ❌ | ❌ | ✅ |
| **Acts on the prediction (orders stock)** | ❌ | ❌ | ✅ |
| Built for 1–5 person cafés | ⚠️ | ❌ | ✅ |
| Price | ¥3,000–15,000/mo | 30% commission | ¥5,000/mo |

Only **22% of Japanese restaurant operators use POS analytics** for menus and inventory. The rest are flying blind. We are not selling another dashboard — we are selling **a decision, already made**.

---

## 5. Business Model

### SaaS subscription

| Plan | Price | For | Includes |
|---|---|---|---|
| **Basic** | ¥5,000/mo | Single café | Ordering, inventory, forecast |
| **Premium** | ¥15,000/mo | Restaurant/bar | + purchase automation, multi-language, analytics |
| **Enterprise** | ¥50,000/mo | Small chains (2–10 stores) | + multi-store, staff management, custom model |
| **Custom** | Negotiated | Hotels, food courts | + integrations |

### Unit economics (Basic, per café/month)

| | |
|---|---|
| Revenue | ¥5,000 |
| Infrastructure (hosting, weather, email) | ¥300 |
| Support (amortized) | ¥700 |
| **Gross margin** | **¥4,000 (80%)** |

### Customer value (why they pay)

A café spending ¥300,000/month on ingredients with 8% waste loses **¥24,000/month**. A 30% cut in waste saves **¥7,200/month** — the software pays for itself **1.4× over** on waste alone, before counting sold-out items recovered and hours of ordering time saved.

### Market size (Japan)

- 2.15 million food establishments; **68% are small-scale** → ~1.46M addressable
- Conservative reachable market (cafés + small restaurants, digitally willing): **~200,000**
- At 1% penetration × ¥5,000/mo = **¥120M ARR**
- At 5% penetration, mixed plans = **~¥900M ARR**

---

## 6. Go-to-Market

**Phase 1 — Prove it (now):** RD Café & Bar, Sunwal, Nepal. Live store, live data, real waste numbers. Our own café is customer zero.

**Phase 2 — Japan beachhead (Year 1):** Independent cafés in one Tokyo/Kanagawa ward. Land 20 paying cafés. Free 3-month pilot in exchange for data + testimonial. Founder is Nepali and based in Japan — direct trust channel into the **Nepali, Indian, and Vietnamese-owned restaurant community**, which is large, underserved, and hit hardest by the current crisis.

**Phase 3 — Scale (Year 2–3):** Partner with local supplier networks (they benefit from cleaner, earlier orders). Expand to Osaka, Fukuoka. Add Japanese-language support and Japanese POS integrations.

**Phase 4 — Asia (Year 3+):** Nepal, Vietnam, Thailand — same structure, same problem, faster growth.

---

## 7. Traction

- ✅ Working full-stack product, **deployed and publicly accessible**
- ✅ Real café (RD Café & Bar) as pilot site
- ✅ AI forecast running on live weather for Sunwal, Kathmandu, and Tokyo
- ✅ Purchase orders successfully emailed to suppliers
- Built by a solo founder — demonstrating capital efficiency

---

## 8. Roadmap

| Phase | Timeline | Deliverable |
|---|---|---|
| **1. Prototype** | Complete | Ordering + admin + AI forecast + inventory + purchase orders |
| **2. Intelligence** | 3 months | AI Business Advisor, multi-language (JP/EN/NP), trained per-café model |
| **3. Commercialize** | 6 months | Japanese localization, POS integration, 20 paying pilots |
| **4. Scale** | 12 months | Multi-store, mobile app, supplier network partnerships |
| **Vision** | 3–5 years | Voice ordering, robot/kitchen integration, dynamic pricing, AR menu |

---

## 9. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Forecast inaccurate at first | Rules-based cold start works from day one; accuracy improves with each café's own data |
| Small cafés resist software | Free 3-month pilot; onboarding in under 30 minutes; owner sees waste savings in the first month |
| POS incumbents copy the feature | They optimize for chains; our wedge is the 1–5 person café they ignore. Data from small cafés is our moat |
| Language / cultural barrier in Japan | Founder lives in Japan; beachhead is the foreign-owned restaurant community first |
| Supplier resistance | Suppliers gain earlier, more predictable orders — they are beneficiaries, not obstacles |

---

## 10. The Ask

Seeking mentorship, market access, and seed funding to:
1. Localize fully for Japan (language, POS, supplier integrations)
2. Run 20 paid pilots in Kanagawa/Tokyo
3. Train the per-café forecasting model on real order history

---

## Appendix — Key Statistics for the Pitch

*Cite these on slides. All figures are from public sources; verify the latest numbers before submission.*

| Statistic | Source |
|---|---|
| 411 food-service bankruptcies Jan–May, record high | Tokyo Shoko Research |
| Labor-shortage bankruptcies doubled YoY; labor-cost cases up 6.6× | Tokyo Shoko Research |
| 86% of restaurant owners report labor shortage | Industry survey, 2026 |
| 41.2% staff turnover rate | Industry data, 2023 |
| Restaurant food waste 660,000 tons, **up 60,000 tons** — only category rising | MAFF, FY2023 |
| Total business food waste 2.31M tons, down 58% from 2000 | MAFF, FY2023 |
| National target: 60% reduction in business food waste | Basic Policy, March 2025 |
| Food waste = ¥4 trillion economic loss, 10.5M tons CO₂ | Consumer Affairs Agency |
| 2.15M food establishments; 68% small-scale (1–5 staff) | Economic Census |
| Only 22% of operators use POS analytics for inventory | Operator survey, 2023 |
| 27% adopted labor-saving systems | Operator survey, 2022 |
| Japan faces 6.4M worker shortfall by 2040 | Government projection |

---

## Suggested Slide Order (12 slides)

1. **Title** — RD Café AI · *The restaurant that knows tomorrow*
2. **Hook** — "411 restaurants went bankrupt in five months. Their kitchens were full of food nobody ate."
3. **Problem A** — No staff (86% shortage, 41% turnover, bankruptcies doubled)
4. **Problem B** — Rising waste (the one sector going the wrong way: +60,000 tons)
5. **Why** — The owner orders from memory at midnight
6. **Solution** — the daily loop diagram
7. **Live Demo** — the forecast screen, real weather, real numbers ← *spend time here*
8. **Demo** — one click → supplier order email
9. **Competition** — the "predicts / acts" table
10. **Business model** — pricing + unit economics + "pays for itself 1.4× on waste alone"
11. **Market & Go-to-market** — 1.46M establishments, beachhead strategy
12. **Ask + Vision** — Japan → Asia; robot kitchens, voice, dynamic pricing

**Demo is the centerpiece.** Change the city from Sunwal to Tokyo on stage. The weather changes, the forecast changes, the order changes. That single interaction is worth more than any slide.
