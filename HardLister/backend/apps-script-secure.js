/**
 * HardLister Secure Serverless Core
 * Validates payloads and applies data boundaries before commitment.
 */

const SECURE_CONFIG = {
  SPREADSHEET_ID: '1QHrXKkuh-6bNUyeYgp8jZrdP3t8MzBSyx-8k-GjFOcI',
  SHEET_NAME: 'Inventory',
  EXPECTED_COLUMNS: 12,
  SHARED_SECRET_KEY: 'HL_SECURE_HMAC_PASSTHROUGH_TOKEN' // Simple handshake validation
};

function doPost(e) {
  try {
    const contentType = e.postData?.type || '';

    // Secure boundary check for multi-part binary streaming files
    if (contentType.includes('multipart/form-data')) {
      return handleSecureFileStream(e);
    }

    const payload = JSON.parse(e.postData.contents);

    // Guard 1: Authorization Header Check
    if (payload.secretToken !== SECURE_CONFIG.SHARED_SECRET_KEY) {
      return errorResponse('Forbidden: Transaction signature validation failed.', 403);
    }

    if (payload.action === 'append') {
      return commitValidatedRow(payload.data);
    }

    return errorResponse('Bad Request: Invalid operation token.', 400);

  } catch (err) {
    return errorResponse('Internal System Error: ' + err.toString(), 500);
  }
}

function commitValidatedRow(rowDataArray) {
  // Guard 2: Structural Width Alignment Validation
  if (!Array.isArray(rowDataArray) || rowDataArray.length !== SECURE_CONFIG.EXPECTED_COLUMNS) {
    return errorResponse('Data Integrity Fault: Array length mismatch against target schema index.', 422);
  }

  // Guard 3: Strict Data Type Enforcement
  const targetPrice = Number(rowDataArray[7]);
  if (isNaN(targetPrice) || targetPrice < 0) {
    return errorResponse('Data Integrity Fault: Negative or invalid numerical values rejected.', 400);
  }

  const activeBook = SpreadsheetApp.openById(SECURE_CONFIG.SPREADSHEET_ID);
  const targetSheet = activeBook.getSheetByName(SECURE_CONFIG.SHEET_NAME);
  
  // Sanitize fields cleanly against cell injection scripts
  const sanitizedRow = rowDataArray.map(cell => {
    const strCell = String(cell);
    return strCell.startsWith('=') ? "'" + strCell : cell;
  });

  targetSheet.appendRow(sanitizedRow);
  return jsonResponse({ success: true, rowId: targetSheet.getLastRow() });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg, code) {
  return jsonResponse({ success: false, error: msg, code: code });
}