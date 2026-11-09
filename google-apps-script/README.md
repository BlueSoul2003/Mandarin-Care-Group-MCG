# Google Apps Script Setup Guide: MCG Tabung 梦想基金

This guide explains how to deploy the Google Apps Script webhook to connect your Google Sheet with the website.

---

## 1. Open Apps Script in your Google Sheet
1. Open your Google Sheet: `✈️ MCG 出游 Tabung 梦想基金 🌴`.
2. In the top navigation menu, click **Extensions** > **Apps Script** (扩展程序 > Apps 脚本).

---

## 2. Paste the Code
1. Delete any boilerplate code inside the editor (`myFunction() { ... }`).
2. Copy the entire contents of [`google-apps-script/Code.gs`](./Code.gs) and paste it into the editor.
3. Click the **Save** icon (💾) or press `Ctrl + S` / `Cmd + S`.

---

## 3. Deploy as a Web App
1. In the top right corner of the Apps Script window, click the blue **Deploy** button > **New deployment** (部署 > 新建部署).
2. Click the gear icon (**Select type**) next to "Select type" and choose **Web app** (网页应用).
3. Fill in the deployment details:
   - **Description**: `MCG Savings Tracker Webhook`
   - **Execute as**: **Me (your-email@gmail.com)** *(我)*
   - **Who has access**: **Anyone** *(任何人)*
4. Click **Deploy**.
5. Google will ask for authorization on the first deployment:
   - Click **Authorize access** (授权访问).
   - Choose your Google account.
   - Click **Advanced** (高级) > **Go to Untitled project (unsafe)** (前往项目（不安全）).
   - Click **Allow** (允许).
6. Copy the generated **Web App URL** (ends with `/exec`).

---

## 4. Add the URL to `.env.local`
In your website project root, open or create `.env.local` and add:

```env
GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

Restart your local dev server (`npm run dev`) if running. That's it!
