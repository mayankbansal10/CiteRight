import { useState } from 'react';
import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox } from 'pdf-lib';
import { useAiPdfAnalysis } from './useAiPdfAnalysis';

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  license_plate: string;
  citation_numbers: string[];
  citation_dates: string[];
  selected_reason_checkbox: string;
  statement_of_facts: string;
  signature_name: string;
  signature_date: string;
}

interface FillStatus {
  fieldName: string;
  success: boolean;
  actualFieldUsed?: string;
  value: string;
}

export function usePdfFiller() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fillStatus, setFillStatus] = useState<FillStatus[]>([]);
  const { analyzeFormData, analysisResult } = useAiPdfAnalysis();

  const fillPdfForm = async (formData: FormData): Promise<Uint8Array> => {
    setIsProcessing(true);
    const statusLog: FillStatus[] = [];

    try {
      // Load official SFMTA PDF template from public directory
      console.log('Loading official SFMTA PDF template...');
      console.log('Attempting to fetch PDF from: /sfmta-citation-protest-form.pdf');
      const response = await fetch('/sfmta-citation-protest-form.pdf');
      console.log('PDF fetch response status:', response.status);
      console.log('PDF fetch response ok:', response.ok);
      if (!response.ok) {
        console.error('Failed to load PDF template. Status:', response.status, 'StatusText:', response.statusText);
        throw new Error(`Failed to load PDF template: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const pdfSource = 'Official SFMTA Form (January 9, 2019)';
      console.log('Successfully loaded official SFMTA PDF template');
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();

      console.log(`Using official SFMTA form version: ${pdfSource}`);

      // Get all field names for debugging
      const fieldNames = form.getFields().map(field => field.getName());
      console.log('Available form fields:', fieldNames);

      // Use AI analysis for intelligent field mapping
      let aiAnalysis = null;
      try {
        aiAnalysis = await analyzeFormData(formData, fieldNames);
        if (aiAnalysis) {
          console.log('AI analysis results:', aiAnalysis);
          console.log('Field mapping suggestions:', aiAnalysis.fieldMappings);
          console.log('AI confidence level:', aiAnalysis.confidence);
        }
      } catch (error) {
        console.log('AI analysis failed, using default mapping:', error);
      }

      // Enhanced helper function to fill text fields using AI-suggested mappings
      const fillTextField = (logicalName: string, value: string, fallbackNames: string[] = []) => {
        if (!value || !value.trim()) {
          statusLog.push({ fieldName: logicalName, success: false, value: '' });
          return;
        }

        // Priority order: AI suggestion first, then fallbacks
        const fieldsToTry = [];
        
        // 1. Try AI-suggested field name first (highest priority)
        if (aiAnalysis?.fieldMappings[logicalName]) {
          fieldsToTry.push(aiAnalysis.fieldMappings[logicalName]);
        }
        
        // 2. Try fallback names
        fieldsToTry.push(...fallbackNames);
        
        // 3. Try the original logical name last
        fieldsToTry.push(logicalName);
        
        console.log(`\n--- Trying to fill "${logicalName}" with value: "${value}" ---`);
        console.log(`Fields to attempt: ${fieldsToTry.join(', ')}`);
        
        for (const fieldName of fieldsToTry) {
          try {
            const field = form.getTextField(fieldName);
            field.setText(value);
            console.log(`✓ SUCCESS: Filled field "${fieldName}" with: ${value}`);
            statusLog.push({ 
              fieldName: logicalName, 
              success: true, 
              actualFieldUsed: fieldName,
              value 
            });
            return;
          } catch (error) {
            console.log(`✗ FAILED: Could not fill field "${fieldName}"`);
          }
        }
        
        console.log(`❌ COMPLETE FAILURE: Could not fill "${logicalName}" with any of the attempted field names`);
        statusLog.push({ fieldName: logicalName, success: false, value });
      };

      // Enhanced helper function to check checkboxes with comprehensive mapping
      const checkCheckbox = (logicalName: string, shouldCheck: boolean = true) => {
        console.log(`\n=== CHECKBOX MAPPING DEBUG ===`);
        console.log(`Trying to check checkbox for logical name: "${logicalName}"`);
        console.log(`User selected reason: "${formData.selected_reason_checkbox}"`);
        
        // Get all checkbox field names for debugging
        const allCheckboxes = form.getFields()
          .filter(field => field.constructor.name === 'PDFCheckBox')
          .map(field => field.getName());
        console.log('Available checkbox fields:', allCheckboxes);
        
        // Priority mapping: Direct user selection first, then AI, then variations
        const fieldsToTry = [];
        
        // 1. Try the exact user selection first (highest priority for dispute reasons)
        if (logicalName === "Dispute Reason" && formData.selected_reason_checkbox) {
          fieldsToTry.push(formData.selected_reason_checkbox);
          
          // Add common variations of the user's selection
          const userReason = formData.selected_reason_checkbox;
          fieldsToTry.push(
            userReason.replace(/\//g, ' '),           // "SOLD/NOT OWNED YET" -> "SOLD NOT OWNED YET"
            userReason.replace(/\s/g, ''),            // Remove all spaces
            userReason.replace(/\//g, ''),            // Remove slashes
            userReason.replace(/\s+/g, '_'),          // Spaces to underscores
            userReason.replace(/\/|\s/g, ''),         // Remove slashes and spaces
            `${userReason.replace(/\//g, ' ')}`,      // Slash to space
            userReason.toUpperCase(),                 // Ensure uppercase
            userReason.toLowerCase()                  // Try lowercase
          );
        }
        
        // 2. Try AI-suggested field name
        if (aiAnalysis?.fieldMappings[logicalName]) {
          fieldsToTry.push(aiAnalysis.fieldMappings[logicalName]);
        }
        
        // 3. Try the original logical name and common variations
        fieldsToTry.push(
          logicalName,
          logicalName.replace(/\//g, '_'),
          logicalName.replace(/\s/g, '_'),
          logicalName.toLowerCase().replace(/\s/g, '_'),
          logicalName.toUpperCase()
        );
        
        // Remove duplicates while preserving order
        const uniqueFieldsToTry = [...new Set(fieldsToTry)];
        console.log(`Fields to try (in order): ${uniqueFieldsToTry.join(', ')}`);
        
        for (const fieldName of uniqueFieldsToTry) {
          try {
            console.log(`Attempting to find checkbox field: "${fieldName}"`);
            const field = form.getCheckBox(fieldName);
            if (shouldCheck) {
              field.check();
              console.log(`✓ SUCCESS: Checked checkbox "${fieldName}"`);
              statusLog.push({ 
                fieldName: logicalName, 
                success: true, 
                actualFieldUsed: fieldName,
                value: 'checked' 
              });
            } else {
              field.uncheck();
              console.log(`✓ SUCCESS: Unchecked checkbox "${fieldName}"`);
            }
            return;
          } catch (error) {
            console.log(`✗ Failed to find checkbox field: "${fieldName}"`);
          }
        }
        
        console.log(`❌ FAILED: Could not find any checkbox field for "${logicalName}"`);
        console.log(`Available checkboxes were: ${allCheckboxes.join(', ')}`);
        if (shouldCheck) {
          statusLog.push({ fieldName: logicalName, success: false, value: 'checkbox not found' });
        }
      };

      // Helper function to format phone number - extract just area code for Phone field
      const formatPhoneForPdf = (phone: string) => {
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');
        
        if (digits.length === 10) {
          return {
            areaCode: digits.slice(0, 3),        // Just area code for Phone field
            mainNumber: `${digits.slice(3, 6)}-${digits.slice(6)}`  // For potential other phone fields
          };
        }
        
        return {
          areaCode: phone.slice(0, 3),
          mainNumber: phone.slice(3)
        };
      };

      const phoneFormatted = formatPhoneForPdf(formData.phone);

      // Fill personal information with enhanced mapping
      fillTextField('name', formData.name, ['Name', 'full_name', 'applicant_name']);
      fillTextField('address', formData.address, ['Address', 'street_address', 'mailing_address']);
      fillTextField('city_state_zip', `${formData.city}, ${formData.state} ${formData.zip}`, ['CityStateZip Code', 'city_state_zip', 'city', 'state', 'zip']);
      
      // Phone field should get just the area code prefix
      fillTextField('phone', phoneFormatted.areaCode, ['Phone', 'phone_number', 'telephone']);
      
      // Field "2" should have a hardcoded "X"
      fillTextField('hardcoded_x_field', 'X', ['2']);
      
      fillTextField('email', formData.email, ['Email', 'email_address']);

      // License plate mapping
      const licensePlateField = aiAnalysis?.fieldMappings["License Plate"] || "License Plate";
      fillTextField('license_plate', formData.license_plate, [licensePlateField, 'License', 'plate', 'license_number']);

      // Fill citation numbers
      console.log('\n=== CITATION NUMBER MAPPING ===');
      formData.citation_numbers.forEach((number, index) => {
        if (number.trim()) {
          console.log(`Trying to map citation_number_${index + 1} = "${number}"`);
          
          const fallbackFields = [
            `${index + 1}_2`, // Use "1_2", "2_2", "3_2" fields  
            `citation_${index + 1}`,
            `citation_number${index + 1}`,
            "Citation number"
          ];
          
          const aiSuggestedField = aiAnalysis?.fieldMappings[`Citation Number ${index + 1}`] || 
                                  aiAnalysis?.fieldMappings["Citation Numbers"];
          
          if (aiSuggestedField) {
            console.log(`AI suggests field: "${aiSuggestedField}" for citation number ${index + 1}`);
            fallbackFields.unshift(aiSuggestedField);
          }
          
          fillTextField(`citation_number_${index + 1}`, number, fallbackFields);
        }
      });

      // Fill citation dates
      console.log('\n=== CITATION DATE MAPPING ===');
      formData.citation_dates.forEach((date, index) => {
        if (date.trim()) {
          const formattedDate = new Date(date).toLocaleDateString();
          console.log(`Trying to map citation_date_${index + 1} = "${formattedDate}"`);
          
          const fallbackFields = [
            "Text2", // PRIMARY: Citation dates go to Text2 field
            `date_${index + 1}`,
            `citation_date${index + 1}`,
            `date${index + 1}`
          ];
          
          const aiSuggestedField = aiAnalysis?.fieldMappings[`Citation Date ${index + 1}`] || 
                                  aiAnalysis?.fieldMappings["Citation Dates"];
          
          if (aiSuggestedField) {
            console.log(`AI suggests field: "${aiSuggestedField}" for citation date ${index + 1}`);
            fallbackFields.unshift(aiSuggestedField);
          }
          
          fillTextField(`citation_date_${index + 1}`, formattedDate, fallbackFields);
        }
      });

      // Statement of facts - PRIORITIZE "OTHER EXPLAIN DETAILS" FIELD
      console.log('\n=== STATEMENT OF FACTS FIELD MAPPING ===');
      const statementText = aiAnalysis?.enhancedStatement || formData.statement_of_facts;
      console.log(`Statement text to fill: "${statementText}"`);
      
      // PRIORITY ORDER: "OTHER EXPLAIN DETAILS" first (verified working), then AI suggestion, then fallbacks
      const statementFallbacks = [
        'OTHER EXPLAIN DETAILS', // HIGHEST PRIORITY - verified working field
        '1', 
        'STATEMENT OF FACTS', 
        'EXPLAIN SPECIFIC DETAILS', 
        'statement_of_facts', 
        'Text1', 
        'Text2', 
        'Text3', 
        '2', 
        '3', 
        '4'
      ];
      
      fillTextField('statement_of_facts', statementText, statementFallbacks);

      // Handle dispute reason checkbox mapping with exact PDF field names
      if (formData.selected_reason_checkbox) {
        console.log(`\n=== DISPUTE REASON CHECKBOX MAPPING ===`);
        console.log(`User selected: "${formData.selected_reason_checkbox}"`);
        
        // Direct mapping from user selection to exact PDF field names
        const reasonToFieldMap: { [key: string]: string } = {
          "SOLD/NOT OWNED YET": "SOLDNOT OWNED YET",
          "METER PAID/MALFUNCTION": "METER PAIDMALFUNCTION", 
          "MISSING/OBSCURED SIGN": "MISSINGOBSCURED SIGN",
          "STOLEN VEHICLE/PLATE": "STOLEN VEHICLEPLATE",
          "COMPLIANCE/FIX IT CITATION": "COMPLIANCEFIX IT CITATION",
          "OTHER EXPLAIN DETAILS": "OTHER EXPLAIN DETAILS"
        };
        
        const exactFieldName = reasonToFieldMap[formData.selected_reason_checkbox];
        if (exactFieldName) {
          try {
            const field = form.getCheckBox(exactFieldName);
            field.check();
            console.log(`✓ SUCCESS: Checked checkbox "${exactFieldName}" for reason "${formData.selected_reason_checkbox}"`);
            statusLog.push({ 
              fieldName: "Dispute Reason", 
              success: true, 
              actualFieldUsed: exactFieldName,
              value: 'checked' 
            });
          } catch (error) {
            console.log(`❌ FAILED: Could not check "${exactFieldName}" for reason "${formData.selected_reason_checkbox}"`);
            statusLog.push({ fieldName: "Dispute Reason", success: false, value: 'checkbox not found' });
          }
        } else {
          console.log(`❌ FAILED: No mapping found for reason "${formData.selected_reason_checkbox}"`);
          statusLog.push({ fieldName: "Dispute Reason", success: false, value: 'no mapping found' });
        }
      }

      if (aiAnalysis?.enhancedStatement) {
        console.log('✓ Using AI-enhanced statement of facts');
      }

      // Fill signature information
      fillTextField('signature_name', formData.signature_name, ['signature', 'signed_by']);
      fillTextField('signature_date', formData.signature_date, ['date', 'date_signed']);

      // Store fill status for review
      setFillStatus(statusLog);

      const pdfBytes = await pdfDoc.save();
      console.log('PDF successfully filled and saved');
      console.log('Fill status summary:', statusLog);
      return pdfBytes;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFilledPdf = (pdfBytes: Uint8Array, formData: FormData) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `completed-citation-protest-${formData.license_plate}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('PDF download initiated');
  };

  return {
    isProcessing,
    fillPdfForm,
    downloadFilledPdf,
    analysisResult,
    fillStatus
  };
}
