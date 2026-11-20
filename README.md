# Torchbearers Ministries International (TBMI) — Church Management System (ChMS)

A modern, mobile-first Progressive Web App (PWA) designed for **Torchbearers Ministries International (TBMI)**, enabling multi-center administration across **TBMI Osogbo Center** and **Torch Tribe Center**, WhatsApp-driven member onboarding, Termii SMS messaging, Paystack online giving, attendance tracking, and discipleship management.

> **Vision**: *"Raising a generation of people using power for purpose."*

---

## Key Modules & Features

### 1. WhatsApp Group Member Onboarding (`/join`)
- **Fast 90-Second Mobile Form**: Designed for members clicking links in TBMI WhatsApp groups.
- Captures Full Name, Phone, WhatsApp, Center in Osogbo, Residential Neighborhood, Birthday (Month/Day), and Ministry Units.
- Automatic Nigerian phone number sanitization (`234...`).
- Automated welcome SMS dispatched upon completion.
- Direct **"Share Link to Church WhatsApp Group"** button.

### 2. SMS Gateway Integration (Termii — Nigeria)
- **Direct Route Delivery**: Works across all Nigerian networks (MTN, Airtel, Glo, 9mobile) including DND lines.
- **Custom Sender ID**: Pre-configured for `TBMI-OSOGBO`.
- **Targeted Broadcasts**: Send SMS to:
  - All Church Members.
  - Members of a specific Osogbo center.
  - Members of a specific ministry unit (Choir, Ushers, Media, Prayer, etc.).
  - Individual phone numbers.
- **Live Counter & Templates**: Real-time character and page counter with 1-click templates (Sunday service reminders, Midweek alerts, All-Night Vigils).
- **Graceful Simulation Mode**: If `TERMII_API_KEY` is not provided in `.env`, the system runs in simulated mode for local testing without failing.

### 3. Paystack Online Giving & Digital Receipts (`/give`)
- **Multi-Category Giving**: Tithes, Sunday Offerings, Thanksgiving Seeds, Building Project (Camp/Cathedral), Missions, Welfare, and Pastor's Seed.
- **Center-Specific Allocation**: Donations are tagged to specific centers (Central HQ, Oke-Fia, Ring Road, Dada Estate, Osunjela).
- **Dual Payment Channels**:
  - **Paystack Online**: Cards, USSD, Bank Transfer, and Apple Pay.
  - **Direct Church Bank Accounts**: Displays verified church bank accounts (Zenith, GTBank, Access) with 1-click account copying.
- **Official Digital Giving Receipt (`/give/receipt`)**:
  - Automatically generated upon successful payment.
  - Displays church watermark, reference code, donor name, category, amount, center, and timestamp.
  - Printable / saveable as PDF (`window.print()`).

### 4. Secretariat & Pastoral Admin Console (`/admin`)
- **Center Switcher**: Global HQ oversight vs. localized center filtering.
- **Member Directory**: Instant search, department filtering, direct `wa.me` WhatsApp chat links, and CSV/Excel export.
- **SMS Gateway Tab**: Direct broadcast console.
- **Giving Ledger Tab**: Real-time totals, category breakdowns, and transaction history.
- **Service Attendance Tab**: Headcount logger (Men, Women, Youths, Children, First-timers).
- **WhatsApp Broadcast Tool**: Ready-to-copy announcement templates for church WhatsApp groups.

---

## Project Structure

```
tbmi-chms/
├── prisma/
│   ├── schema.prisma       # Center, Member, User, Attendance, GivingTransaction
│   ├── seed.mjs            # Seeds Osogbo centers & admin user
│   └── dev.db              # Local SQLite database (switchable to Postgres)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Public Church Portal & Center Showcase
│   │   ├── join/page.tsx   # WhatsApp-Optimized Member Registration
│   │   ├── give/page.tsx   # Paystack Giving & Church Bank Accounts
│   │   ├── give/receipt/   # Official Printable Giving Receipt
│   │   ├── admin/page.tsx  # Pastoral Console (Directory, SMS, Finance, Attendance)
│   │   ├── manifest.ts     # PWA Configuration
│   │   └── api/
│   │       ├── centers/    # Multi-Center management
│   │       ├── join/       # Member onboarding + Welcome SMS
│   │       ├── members/    # Search and filter directory
│   │       ├── sms/send/   # Termii SMS broadcast endpoint
│   │       ├── give/
│   │       │   ├── initialize/ # Paystack checkout initializer
│   │       │   └── verify/     # Paystack payment verifier & receipt
│   │       ├── finance/    # Giving ledger & financial summaries
│   │       └── attendance/ # Service headcount recording
│   └── lib/
│       ├── prisma.ts       # Prisma Client Singleton
│       ├── sms.ts          # Termii SMS Gateway Client
│       └── paystack.ts     # Paystack Payment Gateway Client
└── .env                    # Environment variables (Termii & Paystack keys)
```

---

## Configuring Live Gateways

Open the `.env` file in the project root:

```env
# Termii SMS Gateway (https://termii.com)
TERMII_API_KEY="your_termii_api_key_here"
TERMII_SENDER_ID="TBMI-OSOGBO"
TERMII_URL="https://api.ng.termii.com"

# Paystack Payment Gateway (https://paystack.com)
PAYSTACK_SECRET_KEY="sk_live_... or sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_... or pk_test_..."
```

*(Note: Without keys, both SMS and Paystack run in simulated test mode, enabling complete testing and demonstrations without charges.)*

---

## Running the Application

```powershell
cd C:\Users\Admin\.gemini\antigravity\scratch\tbmi-chms
npm run dev
```

- **Public Home Portal**: [http://localhost:3000](http://localhost:3000)
- **WhatsApp Member Registration**: [http://localhost:3000/join](http://localhost:3000/join)
- **Online Giving Portal**: [http://localhost:3000/give](http://localhost:3000/give)
- **Secretariat / Pastoral Console**: [http://localhost:3000/admin](http://localhost:3000/admin)
