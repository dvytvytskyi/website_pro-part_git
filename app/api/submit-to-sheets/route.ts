import { NextRequest, NextResponse } from 'next/server';
import { submitToGoogleSheets, FormSubmissionData } from '@/lib/googleSheets';

/**
 * API Route for submitting form data to Google Sheets
 * 
 * POST /api/submit-to-sheets
 * Body: FormSubmissionData
 */
export async function POST(request: NextRequest) {
  try {
    const data: FormSubmissionData = await request.json();

    // Validate required fields
    if (!data.formType) {
      return NextResponse.json(
        { error: 'formType is required' },
        { status: 400 }
      );
    }

    // Submit to Google Sheets
    const success = await submitToGoogleSheets(data);

    if (success) {
      return NextResponse.json(
        { success: true, message: 'Data submitted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to submit to Google Sheets' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in submit-to-sheets API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

