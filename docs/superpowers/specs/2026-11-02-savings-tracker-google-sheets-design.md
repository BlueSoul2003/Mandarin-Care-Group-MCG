# MCG Tabung 梦想基金 (Savings Tracker) Google Sheets Integration Design

## 1. Overview & Objectives

Mandarin Care Group (MCG) members participate in a weekly money-saving initiative ("MCG 出游 Tabung 梦想基金") where members save RM10 each week. The progress is tracked in a live Google Sheet using checkboxes per member row for each week (`W1` through `W11` and beyond), calculating cumulative savings via `=COUNTIF(..., TRUE)*10`.

This feature integrates the MCG Next.js website with the Google Sheet so members can record their weekly savings directly from the homepage.

---

## 2. Google Sheet Specification

* **Sheet Name**: `MCG 出游 Tabung 梦想基金` (or first sheet)
* **Name Column**: Column A with header `团员名字 (Name)`
* **Week Columns**: Headers beginning with week identifiers, e.g. `W1(...)`, `W5 (4月第4周)`, `W11 (6月第1周)`
* **Cell Types**: Native Google Sheets Checkboxes (Boolean `TRUE` / `FALSE`)
* **Existing Rows**:
  * Active members: e.g. `Gregory Hong`, `Jacelyn Wai`, `Brandon Chan`, `Martin Lau`, `Elwin Ee`, `Leon`, `Siaw Wei`, `Janet Ling`, `John Tan`
  * Placeholder slots: `[请填名字]`

---

## 3. Architecture & Data Flow

```
[User on Homepage]
       │
       ▼ (Submits Name + Selected Week)
[Next.js API Route: /api/savings]
       │
       ▼ (Validates input + forwards via secure POST)
[Google Apps Script Webhook (Code.gs)]
       │
       ▼ (Finds Row in Col A + Finds Week Col in Row 1)
[Google Sheet (Sets cell checkbox to TRUE)]
       │
       ▼ (Returns { success: true, name, week })
[Homepage shows clean success confirmation]
```

### Key Security & Privacy Measures:
1. The Google Apps Script Webhook URL is stored securely in `.env.local` as `GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL` and is never exposed to browser clients.
2. The `/api/savings` route sanitizes and validates input parameters (`name`, `week`) and applies in-memory rate limiting to prevent spam.

---

## 4. Google Apps Script Webhook (`Code.gs`)

The script is deployed as a Web App (`Execute as: Me`, `Who has access: Anyone`) in Google Sheets:

```javascript
function doGet(e) {
  try {
    var targetName = (e.parameter.name || "").trim();
    if (!targetName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing name parameter"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    // Headers
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var weekIndices = []; // array of { week: "W1", colIndex: number, label: string }
    for (var c = 1; c < headers.length; c++) {
      var headerText = String(headers[c]).trim();
      var match = headerText.match(/^(W\d+)/i);
      if (match) {
        weekIndices.push({
          code: match[1].toUpperCase(),
          colIndex: c + 1,
          label: headerText
        });
      }
    }

    // Locate member row in Column A
    var nameRange = sheet.getRange(2, 1, Math.max(lastRow - 1, 1), 1).getValues();
    var targetRow = -1;
    for (var r = 0; r < nameRange.length; r++) {
      var rowName = String(nameRange[r][0]).trim();
      if (rowName.toLowerCase() === targetName.toLowerCase()) {
        targetRow = r + 2;
        break;
      }
    }

    if (targetRow === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        exists: false,
        name: targetName,
        totalSaved: 0,
        savedWeeks: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Read member's week cells
    var rowValues = sheet.getRange(targetRow, 1, 1, lastCol).getValues()[0];
    var savedWeeks = [];
    for (var w = 0; w < weekIndices.length; w++) {
      var item = weekIndices[w];
      var cellVal = rowValues[item.colIndex - 1];
      if (cellVal === true || String(cellVal).toLowerCase() === "true" || cellVal === 1) {
        savedWeeks.push(item.code);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      exists: true,
      name: targetName,
      totalWeeksSaved: savedWeeks.length,
      totalSaved: savedWeeks.length * 10,
      savedWeeks: savedWeeks
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Wait up to 10 seconds for concurrent requests
    var data = JSON.parse(e.postData.contents);
    var targetName = (data.name || "").trim();
    var targetWeek = (data.week || "").trim(); // e.g. "W11"

    if (!targetName || !targetWeek) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing name or week"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    // 1. Identify Week Column from Row 1
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var weekColIndex = -1;
    for (var c = 0; c < headers.length; c++) {
      var headerText = String(headers[c]).trim();
      // Match exact prefix e.g. "W11" matches "W11 (6月第1周)"
      if (headerText.toLowerCase().indexOf(targetWeek.toLowerCase()) === 0) {
        weekColIndex = c + 1; // 1-based
        break;
      }
    }

    if (weekColIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Week column not found for: " + targetWeek
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Identify Name Row in Column A
    var nameRange = sheet.getRange(2, 1, Math.max(lastRow - 1, 1), 1).getValues();
    var targetRowIndex = -1;
    var firstPlaceholderRow = -1;

    for (var r = 0; r < nameRange.length; r++) {
      var rowName = String(nameRange[r][0]).trim();
      if (rowName.toLowerCase() === targetName.toLowerCase()) {
        targetRowIndex = r + 2; // Row numbers are 1-based
        break;
      }
      if (rowName === "[请填名字]" && firstPlaceholderRow === -1) {
        firstPlaceholderRow = r + 2;
      }
    }

    // 3. Handle New Member Insertion
    if (targetRowIndex === -1) {
      if (firstPlaceholderRow !== -1) {
        // Replace existing placeholder
        targetRowIndex = firstPlaceholderRow;
        sheet.getRange(targetRowIndex, 1).setValue(targetName);
      } else {
        // Append new row
        targetRowIndex = lastRow + 1;
        sheet.getRange(targetRowIndex, 1).setValue(targetName);
      }
    }

    // 4. Check the Checkbox for the selected week
    var targetCell = sheet.getRange(targetRowIndex, weekColIndex);
    targetCell.setValue(true);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Successfully recorded RM10 savings for " + targetName + " in " + targetWeek
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

---

## 5. Next.js API Routes (`src/app/api/savings/route.ts`)

* **Endpoints**:
  - `POST /api/savings`: Submits saving confirmation.
    - Body: `{ "name": "Brandon Chan", "week": "W11" }`
    - Validates inputs (`name`, `week`), checks rate limit, forwards to Google Webhook.
  - `GET /api/savings?name=Brandon+Chan`: Checks participant progress.
    - Validates name parameter.
    - Queries Google Apps Script Webhook.
    - Returns `{ exists: boolean, totalSaved: number, totalWeeksSaved: number, savedWeeks: string[] }`.
* **Rate Limiting**: IP-based rate limiting preventing more than 10 requests per 5 minutes.
* **Environment Variable**: `GOOGLE_SHEETS_SAVINGS_WEBHOOK_URL` in `.env.local`.

---

## 6. Homepage UI Component (`src/components/SavingsTrackerSection.tsx`)

* **Placement**: Directly below `LatestYouTubeVideo` in `src/app/[locale]/page.tsx`.
* **Design & Styling**:
  - Bordered card using `bg-card border-border/60 rounded-3xl p-6 sm:p-8`.
  - Iconography using Lucide (`PiggyBank`, `Coins`, `CheckCircle2`, `TrendingUp`, `Loader2`).
  - Professional, clean aesthetic with zero emoji spam.
* **Interactive Elements**:
  1. **Member Name**:
     - Auto-detects logged-in Supabase user metadata (e.g. `user_metadata.full_name` or email display name).
     - Text input with a dropdown/datalist of known member names (`Brandon Chan`, `Gregory Hong`, `Jacelyn Wai`, etc.) while also allowing custom input for new members.
  2. **Live Progress Overview Card**:
     - When a name is entered/selected, displays:
       - Total saved: `RM{totalSaved}` (e.g., `RM110`).
       - Completed weeks counter: `{totalWeeksSaved} weeks recorded`.
       - Status badge for currently selected week: `Already Saved` (with green checkmark) or `Pending Confirmation`.
  3. **Week Selector**:
     - Dropdown listing active and upcoming weeks, defaulting to the current week: `W11 (6月第1周)`.
  4. **Submit Button**:
     - Prominent button with text: *"Yes, I have saved RM10 for this week"* (*"确认已存入 RM10"*).
     - If the selected week is already marked as saved, displays *"Saved for Week {week}"* with disabled state or re-check indicator.
     - Disabled during request with a loading spinner.
* **Feedback States**:
  - Success banner with member name, week recorded, and checkmark.
  - Error banner if network fails or invalid input.

---

## 7. Internationalization (i18n)

Translations added to `messages/en.json` and `messages/zh-TW.json` under `"SavingsTracker"`:
- `title`: "MCG Tabung Dream Fund" / "MCG 出游 Tabung 梦想基金"
- `subtitle`: "Save RM10 every week towards our group outing journey." / "每周存入 RM10，携手迈向我们的团体出游梦想之旅。"
- `nameLabel`: "Member Name" / "团员名字"
- `namePlaceholder`: "Select or enter your name" / "选择或输入你的名字"
- `weekLabel`: "Week" / "周次"
- `submitButton`: "Yes, I have saved RM10 for this week" / "确认已存入 RM10"
- `submitting`: "Recording..." / "正在记录..."
- `successMessage`: "Record updated successfully for {name} ({week})!" / "已成功记录 {name} 的 {week} 储蓄！"
- `errorMessage`: "Failed to record. Please check your connection and try again." / "记录失败，请检查网络后重试。"

---

## 8. Verification & Testing Plan

1. **Unit / Route Verification**:
   - Test `POST /api/savings` with valid and invalid inputs.
   - Verify rate limiting and error responses.
2. **Component Testing**:
   - Verify autofill when user is logged in.
   - Verify manual name entry and week selection.
   - Verify loading and success feedback states without reload.
3. **End-to-End Sheets Verification**:
   - Test matching an existing member row (e.g. `Brandon Chan` + `W11`).
   - Test new member insertion replacing `[请填名字]`.
   - Verify Google Sheet checkbox turns `TRUE` and `=COUNTIF(..., TRUE)*10` formula updates accordingly.
