# HardLister: High-Precision Hardware Inventory Intelligence

HardLister is a professional-grade, mobile-first inventory management system designed specifically for high-value hardware, electronics, and technical assets. It bridges the gap between rugged physical inspection and structured digital cataloging.

## 🚀 Core Architecture: The Dual-Stage Flow

Unlike generic inventory apps, HardLister uses a **Two-Stage (Dual-Stage) Synchronization Workflow** to ensure professional-grade data integrity and zero-bloat media management.

### Stage 1: Visual Asset Capture (Binary Stream)
When you capture a photo (Front, Back, Serial Tag, etc.), the app doesn't just save a local file. It immediately initiates a **Stage 1 Upload**:
- **Direct-to-Cloud:** The image is streamed as raw binary to a secure Google Drive repository.
- **ID-Linking:** Upon successful upload, the server returns a unique `fileId`. This ID is instantly injected into your local form state.
- **Zero Bloat:** This avoids the "Base64 bloat" seen in many apps, keeping your mobile device storage clean and your sync speeds high.

### Stage 2: Metadata Commitment (Structured JSON)
Once your visual assets are secured, you perform the **Stage 2 Append**:
- **Atomic Transactions:** The app sends the complete, validated JSON manifest (SKU, Brand, Model, Condition, Pricing, and the captured `fileId`s).
- **Sheet Synchronization:** A Google Apps Script backend validates the data against a strict schema before committing it to your Google Sheet.
- **Single Source of Truth:** Your Google Sheet becomes an intelligent relational database, linking text rows to physical files in Drive.

---

## 🧠 Intelligent Features

### 🔎 AI Research & Logistics Agent
Integrated directly into the workflow, the AI agent performs real-time market analysis:
- **Price Discovery:** Automatically estimates "New" vs "Used" market values based on Brand and Model.
- **Logistics Intelligence:** Estimates shipping weight and box dimensions for high-precision logistics planning.
- **Automated Verbiage:** Generates professional, technical, and highly structured product descriptions tailored to the asset's category.

### 📊 High-Precision State Mapping
HardLister enforces a "Terminal State String" to prevent data drift. Every entry is codified into a numeric representation (e.g., `ITEM:CONDITION:OP_STATE:COMP_STATE:PKG_METHOD`), ensuring that your inventory data is machine-readable and perfectly consistent for reporting.

### 🛡️ Quality & Authenticity Gating
For high-value items, the app supports gated quality protocols. You can enforce mandatory checks (e.g., "Zipper Verification," "Serial Tag Legibility") before the app allows the final manifest sync.

---

## 🛠️ Tech Stack

- **Mobile:** React Native / Expo (Managed Workflow)
- **Backend:** Google Workspace (Apps Script + Sheets + Drive API)
- **Communication:** Secure HTTPS/REST with HMAC handshake validation
- **Intelligence:** LLM-driven pricing and description generation

---

## 📋 Getting Started (Developer Guide)

1. **Backend Deployment:**
   - Copy `backend/apps-script-secure.js` into a new Google Apps Script project.
   - Authorize the script to access Google Drive and Sheets.
   - Deploy as a **Web App** and set access to "Anyone, even anonymous" (The `secretToken` handles the security).
   - Copy the Web App URL into the app's settings.

2. **Mobile Setup:**
   - Install dependencies: `npm install`.
   - Start the environment: `npx expo start`.
   - Configure the Google Web App URL in the app's settings storage.

3. **Verification:**
   - Capture a photo $\rightarrow$ Verify `fileId` appears in the local state.
   - Hit "Commit" $\rightarrow$ Verify the row and files appear in your Google Sheet and Drive.
