
# 🏁 Phase 25: GoSellr Revenue Engine + Commission Distribution System

📌 **GoSellr Expansion Phase 10 of 10**  
✅ **All phases complete after this step**

---

## 🎯 Goal:
Enable **automatic revenue splitting** between seller, delivery, company, and all franchise levels (Sub → Master → Corporate) on every successful order.

---

## 💸 Revenue Flow Breakdown:

| Role                | Commission %       | Notes                                                       |
|---------------------|--------------------|-------------------------------------------------------------|
| Seller              | Product Price – Platform Fee | Seller receives amount after deducting all platform fees |
| Sub-Franchise       | 1% to 2%            | Varies based on tier and SQL level                          |
| Master-Franchise    | 0.5% to 1%          | Gets cut from sub-franchise region                          |
| Corporate Franchise | 0.5%                | National level cut                                          |
| Delivery Rider      | Fixed / Variable    | Assigned per order or fixed rate by location                |
| Company             | Remaining Profit    | After all commission splits                                 |

> 💡 Example: On a $100 order  
> - $5 platform fee  
> - $2 Sub-Franchise  
> - $1 Master  
> - $0.5 Corporate  
> - $5 Rider  
> - Remaining to Seller + Company

---

## 🧠 Advanced Logic

- SQL level impacts commission:
  - High/VIP SQL sellers or franchises get reduced service fee
  - Low SQL = higher fee cut

- Rider & delivery franchise income tracked in `/delivery/revenue`
- Franchise dashboard shows daily/monthly cut in `/franchise/earnings`

---

## 🔐 Wallet Flow

Each user has:
- 💰 **Trusty Wallet** (auto-fills from earnings)
- 🧾 **Commission Logs** (visible on dashboard)
- 🪙 **Withdraw Request Panel** (for seller/franchise)

---

## 🔄 Automation Engine

- Automatically splits earnings in real-time on `ORDER_STATUS: Delivered`
- Uses smart contract or Node.js logic in future update with blockchain

---

## ⚙️ Backend APIs:

- `POST /api/order/complete` → triggers distribution
- `GET /api/franchise/earnings`
- `GET /api/wallet/:id`
- `POST /api/withdraw/request`

---

## 📊 Admin Panel Controls

- Override commission % for any seller/franchise
- View full earning history by role, date, or service
- Flag any fraudulent activity (e.g., fake delivery)

---

## ✅ Phase 25 Summary:

| Feature                              | Status   |
|--------------------------------------|----------|
| Auto commission distribution         | ✅ Planned |
| Wallet sync for seller/franchise     | ✅ Planned |
| Admin overrides and audit logs       | ✅ Planned |
| Franchise commission tiers           | ✅ Planned |
| Blockchain upgrade readiness         | ✅ Prepared |

---

🎉 **All 25 GoSellr Expansion Phases Completed!**
