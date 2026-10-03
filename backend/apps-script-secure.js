/**
 * HardLister Secure Serverless Core
 * Implements a Two-Stage (Dual-Stage) workflow for Photos + Metadata.
 * 
 * Stage 1: Upload Photo -> Returns fileId
 * Stage 2: Append Metadata -> Saves to Sheet (including fileId)
 */

const SECURE_CONFIG = {
  SPREADSHEET_ID: '1QHrXKkuh-6bNUyeYgp8jZrdP3t8MzBSyx-8k-GjFOcI',
  SHEET_NAME: 'Inventory',
  EXPECTED_COLUMNS: 12,
  SHARED_SECRET_KEY: 'HL_SECURE_HMAC_PASSTHROUGH_TOKEN',
  // Root folder for all HardLister uploads
  UPLOAD_FOLDER_NAME: 'HardLister_Photos'
};

function doPost(e) {
  try {
    const contentType = e.postData?.type || '';

    // --- STAGE 1: MULTIPART PHOTO UPLOAD ---
    // Note: Apps Script's doPost(e) makes multipart parsing notoriously difficult 
    // because the blob is often pre-parsed in ways that strip boundaries.
    // A much more reliable "Lean" approach is to use a JSON payload containing 
    // the Base64 string for single-image uploads, or a serialized string.
    // However, to adhere to the "Zero-Bloat" goal, we will use the e.postData.contents 
    // approach for multipart if available, or a custom delimiter.
    
    if (contentType.includes('multipart/form-data')) {
       return handleMultipartUpload(e);
    }

    // --- STAGE 2: JSON METADATA APPEND ---
    const payload = JSON.parse(e.postData.contents);

    // Guard 1: Authorization
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

/**
 * Handle Stage 1: Multipart Upload
 * Uses primitive parsing to extract the file and secret token from the blob.
 */
function handleMultipartUpload(e) {
  const blob = e.postData.blob;
  const boundary = extractBoundary(e.postData.type);
  if (!boundary) return errorResponse('Bad Request: Missing multipart boundary.', 400);

  const content = blob.getDataAsString();
  // Extracting the secretToken from the multipart body
  const tokenMatch = content.match(/name="secretToken"\r\n\r\n(.*?)\r\n/);
  const token = tokenMatch ? tokenMatch[1] : '';

  if (token !== SECURE_CONFIG.SHARED_SECRET_KEY) {
    return errorResponse('Forbidden: Invalid token in multipart.', 403);
  }

  // Extracting the file
  // This is the "High-Risk" area in GAS. We take the raw bytes of the blob
  // and slice them based on the multipart structure.
  const bytes = blob.getBytes();
  const headerEndMatch = content.match(/\r\n\r\n/g); 
  // This is a simplification; a production parser would be more precise.
  // We look for the file part which typically follows the headers.
  
  // Find the "file" part's end (the next boundary)
  const boundaryString = '--' + boundary;
  const boundaryIndex = content.indexOf(boundaryString);
  
  // Find where headers end and body begins for the file part
  // This is a heuristic: looking for the first occurrence of file headers
  const filePartHeaderMatch = content.match(/name="file"\r\n\r\n/);
  if (!filePartHeaderMatch) return errorResponse('Bad Request: File part not found.', 400);
  
  const fileStartInString = filePartHeaderMatch.index + filePartHeaderMatch[0].length;
  const fileEndInString = content.indexOf(boundaryString, fileStartInString);
  
  // Precise byte calculation
  // Note: We must account for the fact that getDataAsString() might have mangled 
  // non-UTF8 bytes. In a perfect world, we'd use the raw bytes only.
  // Since GAS is limited, we use the string indices as a guide for the byte slice.
  // This works if the filenames/headers are standard ASCII.
  const fileBytes = bytes.slice(fileStartInString, fileEndInString);
  const fileBlob = Utilities.newBlob(fileBytes, 'image/jpeg', 'upload_' + Date.now() + '.jpg');

  // Save to Drive
  const folder = getOrCreateFolder(SECURE_CONFIG.UPLOAD_FOLDER_NAME);
  const file = folder.createFile(fileBlob);
  
  return jsonResponse({
    success: true,
    fileId: file.getId(),
    url: file.getUrl()
  });
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function extractBoundary(contentType) {
  const match = contentType.match(/boundary=(.+)/);
  return match ? match[1] : null;
}

/**
 * Stage 2: Commit Row
 */
function commitValidatedRow(rowDataArray) {
  if (!Array.isArray(rowDataArray) || rowDataArray.length !== SECURE_CONFIG.EXPECTED_COLUMNS) {
    return errorResponse('Data Integrity Fault: Array length mismatch.', 422);
  }

  const activeBook = SpreadsheetApp.openById(SECURE_CONFIG.SPREADSHEET_ID);
  const targetSheet = activeBook.getSheetByName(SECURE_CONFIG.SHEET_NAME);
  
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
