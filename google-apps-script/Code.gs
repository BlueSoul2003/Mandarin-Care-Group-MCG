/**
 * MCG 出游 Tabung 梦想基金 - Google Apps Script Webhook
 *
 * This script runs inside Google Sheets as a deployed Web App.
 * - doGet(e): Queries a member's savings progress and automatically detects current week.
 * - doPost(e): Records RM10 savings for a member by setting the checkbox in their corresponding row to TRUE.
 *              Automatically creates the new week column based on current date (e.g. 2 Nov -> "W12 (11月第1周)").
 */

function getCurrentWeekInfo() {
  var now = new Date();
  var month = now.getMonth() + 1; // 1-12
  var date = now.getDate();
  var weekOfMonth = Math.ceil(date / 7);
  var weekTag = month + "月第" + weekOfMonth + "周";
  return {
    month: month,
    date: date,
    weekOfMonth: weekOfMonth,
    weekTag: weekTag
  };
}

function findOrCreateCurrentWeekColumn(sheet) {
  var lastCol = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();
  var currentInfo = getCurrentWeekInfo();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  var highestWNumber = 0;
  var existingColIndex = -1;
  var existingLabel = "";

  for (var c = 1; c < headers.length; c++) {
    var headerText = String(headers[c]).trim();
    var wMatch = headerText.match(/^W(\d+)/i);
    if (wMatch) {
      var num = parseInt(wMatch[1], 10);
      if (num > highestWNumber) {
        highestWNumber = num;
      }
    }
    // Check if column for current week tag already exists (e.g. "11月第1周")
    if (headerText.indexOf(currentInfo.weekTag) !== -1) {
      existingColIndex = c + 1;
      existingLabel = headerText;
      break;
    }
  }

  if (existingColIndex !== -1) {
    var matchCode = existingLabel.match(/^(W\d+)/i);
    return {
      colIndex: existingColIndex,
      code: matchCode ? matchCode[1].toUpperCase() : "W" + highestWNumber,
      label: existingLabel,
      isNew: false
    };
  }

  // Column for current week does not exist yet -> Automatically create it!
  var nextWNumber = highestWNumber + 1;
  var newCode = "W" + nextWNumber;
  var newLabel = newCode + " (" + currentInfo.weekTag + ")";
  var newColIndex = lastCol + 1;

  sheet.getRange(1, newColIndex).setValue(newLabel);

  // Insert checkboxes for all member rows
  if (lastRow > 1) {
    sheet.getRange(2, newColIndex, lastRow - 1, 1).insertCheckboxes();
  }

  return {
    colIndex: newColIndex,
    code: newCode,
    label: newLabel,
    isNew: true
  };
}

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
            colIndex: c + 1,
            label: headerText
          });
        }
      }
    }

    var currentInfo = getCurrentWeekInfo();
    var activeWeek = null;
    // Check if a column matching current week tag exists
    for (var i = 0; i < weekColumns.length; i++) {
      if (weekColumns[i].label.indexOf(currentInfo.weekTag) !== -1) {
        activeWeek = weekColumns[i];
        break;
      }
    }

    // If current week not yet created, calculate what it will be
    if (!activeWeek) {
      var highestNum = 0;
      for (var j = 0; j < weekColumns.length; j++) {
        var numMatch = weekColumns[j].code.match(/\d+/);
        if (numMatch) {
          var n = parseInt(numMatch[0], 10);
          if (n > highestNum) highestNum = n;
        }
      }
      var nextNum = highestNum + 1;
      activeWeek = {
        code: "W" + nextNum,
        label: "W" + nextNum + " (" + currentInfo.weekTag + ")",
        isPendingCreation: true
      };
    }

    // If no name is supplied, return all available week headers and active current week
    if (!targetName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        currentWeek: activeWeek,
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
        currentWeek: activeWeek,
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
        currentWeek: activeWeek,
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
      currentWeek: activeWeek,
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
    var targetWeek = (data.week || "").trim().toUpperCase();

    if (!targetName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing required 'name' field"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    // 1. Locate or automatically create the week column
    var weekColIndex = -1;
    var finalWeekCode = targetWeek;

    // If week is "CURRENT" or matches current week, find or create automatically
    var currentInfo = getCurrentWeekInfo();
    var isCurrentTarget = !targetWeek || targetWeek === "CURRENT" || targetWeek.indexOf(currentInfo.weekTag) !== -1;

    if (isCurrentTarget) {
      var weekResult = findOrCreateCurrentWeekColumn(sheet);
      weekColIndex = weekResult.colIndex;
      finalWeekCode = weekResult.code;
    } else {
      // Find matching week header
      var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
      for (var c = 0; c < headers.length; c++) {
        var headerText = String(headers[c]).trim();
        if (headerText.toUpperCase().indexOf(targetWeek) === 0) {
          weekColIndex = c + 1;
          break;
        }
      }

      // If specified week not found, create it automatically
      if (weekColIndex === -1) {
        weekColIndex = lastCol + 1;
        var newLabel = data.weekLabel || targetWeek;
        sheet.getRange(1, weekColIndex).setValue(newLabel);
        if (lastRow > 1) {
          sheet.getRange(2, weekColIndex, lastRow - 1, 1).insertCheckboxes();
        }
      }
    }

    // Refresh last row and column after potential column addition
    lastRow = sheet.getLastRow();
    lastCol = sheet.getLastColumn();

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
        if (lastCol > 1) {
          sheet.getRange(targetRowIndex, 2, 1, lastCol - 1).insertCheckboxes();
        }
      }
    }

    // 4. Mark checkbox cell as TRUE
    var cell = sheet.getRange(targetRowIndex, weekColIndex);
    cell.setValue(true);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      name: targetName,
      week: finalWeekCode,
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
