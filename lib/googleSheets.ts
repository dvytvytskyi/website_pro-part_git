/**
 * Google Sheets Integration
 * 
 * This module handles sending form submissions to Google Sheets.
 * 
 * Setup Instructions:
 * 
 * OPTION 1: Google Apps Script (Recommended for simplicity)
 * 1. Create a new Google Sheet
 * 2. Open Tools > Script Editor
 * 3. Paste the following script:
 * 
 * function doPost(e) {
 *   const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   const data = JSON.parse(e.postData.contents);
 *   const row = [
 *     new Date(),
 *     data.formType || '',
 *     data.name || '',
 *     data.email || '',
 *     data.phone || '',
 *     data.message || '',
 *     JSON.stringify(data.additionalData || {})
 *   ];
 *   sheet.appendRow(row);
 *   return ContentService.createTextOutput(JSON.stringify({success: true}));
 * }
 * 
 * 4. Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * 5. Copy the Web App URL and set it as GOOGLE_SHEETS_WEBHOOK_URL
 * 
 * OPTION 2: Google Sheets API with Service Account
 * 1. Create a Service Account in Google Cloud Console
 * 2. Download the JSON key file
 * 3. Share your Google Sheet with the service account email
 * 4. Set GOOGLE_SHEETS_ID and upload the JSON key file
 */

export interface FormSubmissionData {
  formType: string; // e.g., 'contact', 'meeting', 'investment', etc.
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  additionalData?: Record<string, any>; // Any additional fields
}

/**
 * Submit form data to Google Sheets via Webhook (Google Apps Script)
 */
export async function submitToGoogleSheetsWebhook(data: FormSubmissionData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('Google Sheets Webhook URL is not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return false;
  }
}

/**
 * Submit form data to Google Sheets via API (Service Account)
 * This requires the googleapis package and service account credentials
 */
export async function submitToGoogleSheetsAPI(data: FormSubmissionData): Promise<boolean> {
  // This will be implemented if using Service Account approach
  // Requires: npm install googleapis
  // And service account JSON file
  
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  
  if (!sheetId) {
    console.error('Google Sheets ID is not configured');
    return false;
  }

  // Implementation would go here
  // For now, return false to indicate this method is not yet implemented
  console.warn('Google Sheets API method not yet implemented. Use Webhook method instead.');
  return false;
}

/**
 * Client-side function to submit form data via API route
 * This is the function that should be called from forms
 */
export async function submitFormToSheets(data: FormSubmissionData): Promise<boolean> {
  try {
    const response = await fetch('/api/submit-to-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error submitting form to Google Sheets:', error);
    return false;
  }
}

/**
 * Main function to submit form data to Google Sheets
 * Automatically chooses the best available method
 */
export async function submitToGoogleSheets(data: FormSubmissionData): Promise<boolean> {
  // Try webhook method first (simpler, no dependencies)
  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return await submitToGoogleSheetsWebhook(data);
  }
  
  // Fallback to API method if webhook is not configured
  if (process.env.GOOGLE_SHEETS_ID) {
    return await submitToGoogleSheetsAPI(data);
  }
  
  console.error('No Google Sheets configuration found');
  return false;
}

