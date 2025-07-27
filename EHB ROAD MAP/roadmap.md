
# 🌐 EHB Technologies – Full System Roadmap & Service Integration Guide

This document provides a complete development and connection roadmap for all EHB services, including their roles, internal API links, blockchain connections, and user flows. Designed for use by AI agents in development environments like Cursor.

---

## ✅ Phase-Based Development Strategy

### 📍 Phase 1: User Identity, Verification & Base System

| Service | Folder | Ports | Linked To | Role |
|--------|--------|--------|-----------|------|
| EHB Home Page | `ehb-home` | NA | Dashboard, JPS | Entry point, universal service navigation |
| EHB Dashboard | `ehb-dashboard` | All | All modules | Master container UI |
| EHB SQL | `ehb-sql` | Shared logic | PSS, EDR, EMO, JPS, GoSellr | Determines quality level of users/services |
| PSS | `pss` | 4001 | SQL | KYC, ID verification |
| EMO | `emo` | 4003 | SQL, Franchise | Business verification |
| EDR | `edr` | 4002 | SQL | Skill test for service providers |
| JPS | `jps` | 4005 | SQL, PSS, EDR | User profile, resumes, job links |

> 🔄 **SQL uses shared logic (via API or SDK)**. All services query user SQL level and feed updates back post-verification.

---

### 📍 Phase 2: Commercial & Franchise Layer

| Service | Folder | Ports | Linked To | Role |
|--------|--------|--------|-----------|------|
| GoSellr | `gosellr` | 4004 | Wallet, Franchise, SQL | E-commerce, order system |
| Wallet | `wallet` | 5001 | GoSellr, SQL, Blockchain | Transaction handler |
| Franchise | `franchise` | 4006 | Wallet, Complaint System | Local ops & control |
| Complaint System | Built-In | NA | SQL, Franchise | User trust pipeline |

> 🪙 Wallet connected to **EHBGC Coin**, supports service payments, SQL fines, and franchise earnings.

---

### 📍 Phase 3: Blockchain & Decentralization

| Item | Folder | Linked To | Role |
|------|--------|-----------|------|
| EHBGC Coin | `ehbgc` | Wallet, Trusty Wallet | Native token |
| Trusty Wallet | `trusty-wallet` | Wallet, SQL, Franchise | Coin locking, validator rewards |
| Validator Dashboard | `validator` | Franchise, Blockchain | Proof-of-service validators |
| Smart Contracts | `contracts` | Wallet, Coin, SQL | Earning/staking logic |

> ⚙️ Blockchain integration uses **Moonbeam (ERC/BEP)** in early phase → later shift to parachain like **Mosaic**.

---

### 📍 Phase 4: Marketplace & AI Economy

| Service | Folder | Ports | Linked To | Role |
|--------|--------|--------|-----------|------|
| AI Marketplace | `ai-marketplace` | NA | Wallet, JPS | Freelance services, tools |
| AM Affiliate | `am-affiliate` | NA | GoSellr, Ads | Referral income system |
| EHB Aid | `ehb-aid` | NA | Wallet | Verified ad platform |
| Ads Platform | `ehb-ads` | NA | Affiliate, Products | Paid promotion system |
| EHB Tube | `ehb-tube` | NA | Education, JPS | Video learning |
| OBS | `obs` | NA | HPS, Wallet | Online books |
| HPS | `hps` | NA | EDR, SQL | Learning, training |
| WMS | `wms` | NA | Wallet, SQL | Health services |
| OLS | `ols` | NA | Wallet, SQL | Law services |
| AGTS | `agts` | NA | Wallet, Franchise | Travel services |

---

## 🔗 Inter-Service API Links

- `SQL API`: Queried by all services for level check (`/get-sql/:userId`)
- `Wallet API`: Used by GoSellr, Franchise, Ads, Affiliate, AI marketplace
- `PSS/EMO/EDR` emit events to update SQL service
- `JPS` shares user ID with SQL, Wallet, and AI services
- `Franchise` API handles complaint resolution and earns income per order

---

## 👥 User Flow Summary

```mermaid
graph TD
  A[User Registration (JPS)] --> B[Verification (PSS/EDR/EMO)]
  B --> C[SQL Level Assigned]
  C --> D[Access Services (GoSellr, AI Marketplace)]
  D --> E[Payments via Wallet]
  E --> F[Franchise/Complaint handling]
  C --> G[Can Apply for Franchise or Validator]
  G --> H[Stake EHBGC in Trusty Wallet]
```

---

## 🧠 Smart Cursor AI Development Agent Tips

- Use each `md` file in folders as module guide
- Prioritize `ehb-sql`, `wallet`, `dashboard`, and `gosellr` first
- Connect all others via **shared user ID**, SQL level, and wallet tokens
- Monitor SQL-level upgrade through event hooks from PSS, EMO, EDR

---

## 📦 Folder Placement Recommendation

- All 25 service repos should include this `roadmap.md` for full reference
- This is the heart of the project linking every module

