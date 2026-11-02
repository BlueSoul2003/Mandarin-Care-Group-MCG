/**
 * MCG 出游 Tabung 梦想基金 - Google Apps Script Webhook
 *
 * This script runs inside Google Sheets as a deployed Web App.
 * - doGet(e): Queries a member's savings progress and retrieves all available week columns.
 * - doPost(e): Records RM10 savings for a member by setting the checkbox in their corresponding row/week to TRUE.
 *              If the week column does not exist yet, it automatically creates the new week column and inserts checkboxes!
 */

function doGet(e) {
  try {
    var targetName = (e.parameter && e.parameter.name ? e.parameter.name : "").trim();

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    // 1. Map all week column headers in Row 1 (e.g., W1, W5, W11)
    var weekColumns = [];
    if (lastCol >= 2) {
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      for (var c = 1; c < headers.length; c++) {
        var headerText = String(headers[c]).trim();
        var match = headerText.match(/^(W\d+)/i);
        if (match) {
          weekColumns.push({
            code: match[1].toUpperCase(),
            colIndex: c + 1, // 1-based index
            label: headerText
          });
        }
      }
    }

    // If no name is supplied, return all available week headers
    if (!targetName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        allWeeks: weekColumns
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        exists: false,
        name: targetName,
        totalWeeksSaved: 0,
        totalSaved: 0,
        savedWeeks: [],
        allWeeks: weekColumns
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Locate member row in Column A (Row 2 onwards)
    var nameRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
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
        totalWeeksSaved: 0,
        totalSaved: 0,
        savedWeeks: [],
        allWeeks: weekColumns
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Inspect saved status for all week columns
    var rowValues = sheet.getRange(targetRow, 1, 1, lastCol).getValues()[0];
    var savedWeeks = [];
    for (var w = 0; w < weekColumns.length; w++) {
      var colInfo = weekColumns[w];
      var cellVal = rowValues[colInfo.colIndex - 1];
      if (cellVal === true || String(cellVal).toLowerCase() === "true" || cellVal === 1) {
        savedWeeks.push(colInfo.code);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      exists: true,
      name: targetName,
      totalWeeksSaved: savedWeeks.length,
      totalSaved: savedWeeks.length * 10,
      savedWeeks: savedWeeks,
      allWeeks: weekColumns
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
    // Wait up to 10 seconds for concurrent executions
    lock.waitLock(10000);

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Invalid JSON payload"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var targetName = (data.name || "").trim();
    var targetWeek = (data.week || "").trim().toUpperCase(); // e.g. "W11"
    var weekLabel = (data.weekLabel || "").trim(); // e.g. "W12 (6月第2周)"

    if (!targetName || !targetWeek) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing required 'name' or 'week' field"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    // 1. Locate matching week column in Row 1
    var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var weekColIndex = -1;
    for (var c = 0; c < headers.length; c++) {
      var headerText = String(headers[c]).trim();
      if (headerText.toUpperCase().indexOf(targetWeek) === 0) {
        weekColIndex = c + 1; // 1-based index
        break;
      }
    }

    var newColumnCreated = false;
    // If the week column doesn't exist yet, automatically create it!
    if (weekColIndex === -1) {
      weekColIndex = lastCol + 1;
      var newHeader = weekLabel || targetWeek;
      sheet.getRange(1, weekColIndex).setValue(newHeader);
      newColumnCreated = true;

      // Insert checkboxes for all existing rows
      if (lastRow > 1) {
        var colRange = sheet.getRange(2, weekColIndex, lastRow - 1, 1);
        colRange.insertCheckboxes();
      }
    }

    // 2. Locate member row in Column A
    var nameRange = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues() : [];
    var targetRowIndex = -1;
    var firstPlaceholderRow = -1;

    for (var r = 0; r < nameRange.length; r++) {
      var rowName = String(nameRange[r][0]).trim();
      if (rowName.toLowerCase() === targetName.toLowerCase()) {
        targetRowIndex = r + 2;
        break;
      }
      if (rowName === "[请填名字]" && firstPlaceholderRow === -1) {
        firstPlaceholderRow = r + 2;
      }
    }

    // 3. New member placement: replace placeholder or append new row
    if (targetRowIndex === -1) {
      if (firstPlaceholderRow !== -1) {
        targetRowIndex = firstPlaceholderRow;
        sheet.getRange(targetRowIndex, 1).setValue(targetName);
      } else {
        targetRowIndex = lastRow + 1;
        sheet.getRange(targetRowIndex, 1).setValue(targetName);
        // Ensure checkboxes exist on newly appended row
        if (lastCol > 1) {
          sheet.getRange(targetRowIndex, 2, 1, Math.max(weekColIndex - 1, lastCol - 1)).insertCheckboxes();
        }
      }
    }

    // 4. Mark checkbox cell as TRUE
    var cell = sheet.getRange(targetRowIndex, weekColIndex);
    cell.setValue(true);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      name: targetName,
      week: targetWeek,
      newColumnCreated: newColumnCreated,
      message: "Savings recorded successfully"
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
