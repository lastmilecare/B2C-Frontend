
# MHCU Adani — Client dashboard scope (APL view)

**Client slug:** `mhcu-adani`
**Program:** Mobile Health Care Unit (MHCU), Adani Anuppur (M.P.), 16 villages, Mon–Sat route (from ~23 Nov 2026).
**Audience:** APL / Adani management — **view-only** analytics (no revenue/cost tabs unless asked later).

This doc is **dashboard-only** (PRD §12 + Adani “Client Dashboard & Reports” expectations). Portal, doctor app, pharmacy, admin village CRUD, teleconsult booking, and Excel export **forms** are out of scope here but feed the same data later.

---

## Phase plan (agreed)

| Phase | Work                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------- |
| 1     | Gather info (PRD + tables TBD)                                                                          |
| 2     | **Finalize** tab list, filters, view models (this doc)                                            |
| 3     | Frontend + **dummy data** (`mhcu-adani` tenant, reuse `TenantDashboard`, cards/charts/tables) |
| 4     | Backend APIs (`tenant_id` TBD, likely new id e.g. `3`)                                              |
| 5     | Test against staging DB                                                                                 |

---

## Global dashboard concepts

### Village dimension (only geo tag in capture + dashboard)

Every patient, OPD, home visit, test, dispensing, feedback, and report is tagged to **one village**. The portal captures **village only** (not project area, gram panchayat, or block as separate user fields).

**Dashboard rule:** the only **location filter** is **Village** (`All` + 16 names). Do **not** add Project area / Panchayat / Block as filter bar controls.

The table below is **village master reference** (admin-editable list, static metadata for labels/columns). It may appear as **read-only columns** on tables (e.g. scorecard export context) but is **not** used to slice charts via extra filters.

| #  | Village        | Project area (reference)         | Gram panchayat (reference) | Block (reference) | Pop.  | Dist. (km) |
| -- | -------------- | -------------------------------- | -------------------------- | ----------------- | ----- | ---------- |
| 1  | Umarda         | Plant Area (Core)                | Umarda                     | Kotma             | 417   | 0.6        |
| 2  | Majhtoliya     | Plant Area (Core)                | Umarda                     | Kotma             | 480   | 2.2        |
| 3  | Bhalmudi       | Plant Area (Peripheral)          | Umarda                     | Kotma             | 244   | 5.8        |
| 4  | Saristal       | Plant Area (Peripheral)          | Umarda                     | Kotma             | 241   | 7.2        |
| 5  | Chandrauthi    | Plant Area (Peripheral)          | Umarda                     | Kotma             | 234   | 5.0        |
| 6  | Pakriha        | Plant Area (Peripheral)          | Umarda                     | Kotma             | 264   | 5.5        |
| 7  | Majhauli       | Plant Area (Peripheral)          | Majhauli                   | Kotma             | 352   | 0.7        |
| 8  | Chhatai        | RoU & Railway Project, Anicut-01 | Majhauli                   | Kotma             | 1,200 | 0.4        |
| 9  | Pipariya       | Plant Area (Peripheral)          | Majhauli                   | Kotma             | 434   | 4.0        |
| 10 | Gulidand       | RoU & Railway Project, Anicut-02 | Gulidand                   | Kotma             | 1,063 | 5.6        |
| 11 | Tarsily        | RoU & Railway Project            | Majhauli                   | Kotma             | 1,087 | 2.4        |
| 12 | Kothi          | RoU & Railway Project            | Kothi                      | Kotma             | 4,500 | 4.2        |
| 13 | Baihatola      | RoU & Railway Project            | Baihatola                  | Kotma             | 2,197 | 20         |
| 14 | Maintola       | RoU & Railway Project, Anicut-04 | Baihatola                  | Kotma             | 446   | 21         |
| 15 | Katkona        | RoU & Railway Project, Anicut-05 | Katkona                    | Kotma             | 3,303 | 24         |
| 16 | Dogariya Khurd | RoU & Railway Project            | Dogariya Khurd             | Kotma             | 973   | 18         |

**Total population (reference):** ~17,435.

**Tentative weekly visit day (Mon–Sat route):** optional village attribute for ops; not a dashboard filter unless product asks later.

### Global filters (per tab)

**Location**

- **Village** only — `all` + 16 village names (same list as capture dropdown)

**Non-location** (tab-specific)

- **Date range** (visit / dispense / session date)
- **Risk zone** (Red / Amber / Yellow / Green) — vitals tabs
- **Concern level** (High / Moderate / Normal) — concern cohort tab
- **Special category** (pregnant, U5, 60+, bedridden, physically challenged, home care)
- **Gender**, **Age group** — profile / disease tabs

**Excluded from dashboard filters:** project area, gram panchayat, block, hamlet/tola (hamlet may be captured on patient record later but not a dashboard slice in v1).

---

## Proposed tabs (Phase 3 MVP → full)

Maps to Honda/AMP patterns where possible.

| Tab id                | Label                | PRD / Adani source                                         | Reuse panel pattern                             |
| --------------------- | -------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `overview`          | Program overview     | Screened patients, new vs repeat, visits, villages covered | Custom KPI row + small multiples                |
| `patients`          | Patients & screening | Registrations, demographics, Ayushman, special categories  | `PatientsPanel` + new special-category donuts |
| `risk-zones`        | Risk zone & vitals   | BP, sugar, Hb, temp, pulse, SpO2 flags                     | New `RiskPanel` (stacked bars by zone)        |
| `disease`           | Disease & chronic    | Top diseases, village/month trends, chronic register       | `DiseasePanel` + village breakdown table      |
| `medicines`         | Medicine consumption | Daily/monthly consumption, village-wise                    | Bar trends + table (like complaints)            |
| `inventory`         | Stock & alerts       | Balance, low stock, 30/60/90 day expiry                    | KPI + table (new)                               |
| `home-care`         | Home care visits     | Visits per village/month, adherence, vitals trend          | New `HomeCarePanel`                           |
| `referrals`         | Referrals            | CHC/district/specialist, urgency, outcome                  | Table + bar by facility                         |
| `schemes`           | Govt scheme linkage  | Ayushman, immunisation, maternal — status funnel          | Bar / donut                                     |
| `awareness`         | Awareness sessions   | Topic, village, M/F participants                           | Table + trend                                   |
| `village-scorecard` | Village scorecard    | OPD, home visits, referrals, awareness, feedback           | Single table or heat row per village            |
| `feedback`          | Patient feedback     | Ratings 1–5, comments                                     | `FeedbackPanel` + dimension bars              |
| `concern`           | Concern cases        | High / moderate concern list                               | Table + KPI (export later)                      |

**Phase 3 MVP (recommended first slice):** `overview`, `patients`, `risk-zones`, `disease`, `village-scorecard`, `feedback` — covers Adani bullets 7–8 and §12 village-wise view without inventory backend complexity.

**Defer to Phase 3b:** `medicines`, `inventory`, `home-care`, `referrals`, `schemes`, `awareness`, `concern` (still scaffold tabs with dummy if Adani wants full nav early).

**Explicitly exclude (unless requested):** Revenue, cost, third-party (Honda-style).

---

## Tab detail (for dummy view models)

### 1. Overview

**KPIs:** Unique patients screened; OPD + home visits in period; New vs repeat patients; Villages visited (count/16); High + moderate concern counts; Medicine dispensings (total / unique).

**Charts:** Monthly screening trend; New vs repeat trend; Top 5 villages by visits (bar).

### 2. Patients & screening

**KPIs:** Unique patients; Gender split; Special category counts (tags).

**Charts:** Age/gender (reuse pies); Special category distribution; Village registration bar (top 10); Optional: Ayushman yes/no.

### 3. Risk zones & vitals

**Source:** Tests on OPD + home visit (Section 3).

**KPIs:** Patients with any abnormal vital; Count by zone (R/A/Y/G).

**Charts:** Stacked bar by test type × zone; Village heat (top abnormal villages); Trend of % in Red+.

### 4. Disease & chronic

**KPIs:** Top diagnosis; Chronic register size (HTN / DM / anaemia); Follow-up due / done.

**Charts:** Top 10 diseases (vertical bar); Monthly disease trend (top 5 lines); Village-wise top disease table; Chronic by village.

### 5. Medicines (later backend)

**KPIs:** Prescriptions dispensed; Short-supply count; Village-wise consumption.

**Charts:** Daily consumption trend; Top medicines bar.

### 6. Inventory (later backend)

**KPIs:** SKUs below min; Expiring 30/60/90; Last stock-check variance.

**Charts:** Table-first (medicine, batch, qty, expiry).

### 7. Home care

**KPIs:** Visits done in period; Patients on register; Adherence irregular/stopped counts.

**Charts:** Visits per village per month; Sample patient vitals sparkline list (table + link).

### 8. Referrals

**KPIs:** Total referrals; Pending outcome; Urgent count.

**Table:** Patient, village, referred to, reason, date, status.

### 9. Schemes & awareness

**Scheme:** Status buckets (awareness / registered / card received) by scheme name.

**Awareness:** Sessions by topic; participants M/F by village.

### 10. Village scorecard

One row per village (filterable period):

| Village | OPD | Home visits | Referrals | Awareness sessions | Avg feedback | Pop. |

### 11. Feedback

**Dimensions (1–5):** Doctor behaviour, waiting time, medicine availability, home care, overall.

**Filters:** Village, date, topic (awareness-linked sessions optional).

### 12. Concern cases

**Table:** Patient id, village, concern tier, key vitals snapshot, last visit, follow-up status.

Read-only; drill to “individual health report” is Phase 4+ (PDF/link).

---

## Technical frontend (Phase 3)

- Add route `/mhcu-adani` → `MhcuAdaniDashboardPage` → `TenantDashboard tenantId="mhcu-adani"`.
- Register `TENANTS.mhcuAdani` in `src/dashboard/tenants.js`.
- Add `src/data/dummy/tenants/mhcu-adani.js` (`mhcuAdaniTabs`) + extend `dashboardData.js`.
- New panels only where needed: `RiskZonePanel`, `VillageScorecardPanel`, `ConcernTablePanel`, `HomeCarePanel`; reuse `PatientsPanel`, `DiseasePanel`, `FeedbackPanel`, `ComplaintsPanel` patterns, `KpiRow`, `BarChartPanel`, `TrendLineChart`, `DataTableSimple`.
- **No API** in Phase 3 (`VITE_API_BASE_URL` unset → dummy only).

---

## Backend (Phase 4 — table hypotheses)

Confirm with DDL; many entities may live in **new MHCU tables** rather than Picaso/Honda sources.

| Domain               | Likely sources                                                      |
| -------------------- | ------------------------------------------------------------------- |
| Patient / village    | `DRIVERMASTERs` + village master + MHCU visit tables              |
| Vitals / risk        | Visit vitals table (8 tests + flags)                                |
| Disease              | Consulting sheet / diagnosis master (like AMP complaints taxonomy)  |
| Dispensing           | Pharmacy header (dispense reduces stock)                            |
| Stock                | Medicine master, stock received, balance, expiry                    |
| Home care            | Home visit entity per Section 7                                     |
| Referrals / schemes  | Referral + scheme linkage tables                                    |
| Awareness / feedback | Session + feedback forms                                            |
| New vs repeat        | First visit date per `UniquePatientID` on daily visit or OPD list |

**Tenant:** New `tenant_id` for Adani MHCU; single centre or `center_id` per deployment — confirm.

---

## Open questions (finalize before Phase 3 coding)

1. **Phase 3 MVP tab set** — all 13 nav items with dummy, or MVP six tabs first?
2. **`tenant_id` / `center_id`** for backend (placeholder `3` / one centre ok?).
3. **New vs repeat** — same rule as AMP (`first VisitDate` in period vs before)?
4. **Risk zone rules** — use PRD thresholds as fixed config in frontend dummy, or wait for medical sign-off?
5. **Weekly visit day** — show on village scorecard / filter now, or post-route-plan?
6. **Branding** — badge text/colour for Adani (e.g. amber/slate)?
7. **MIS Excel format** — when APL sends template, add “Download MIS” later (admin); not in Phase 3.

---

## Sign-off

When the open questions above are answered, Phase 3 can start in-repo without blocking on backend.
