
/**
 * @fileOverview Security utility for cleaning inputs and validating data.
 */

/**
 * Strips HTML tags and trims text.
 */
export function sanitizeText(input: string, maxLength: number): string {
  if (!input) return "";
  let cleanStr = input.replace(/<[^>]*>/g, "");
  cleanStr = cleanStr.replace(/script|javascript|onload|onerror|eval/gi, "");
  return cleanStr.trim().substring(0, maxLength);
}

/**
 * Validates standard email pattern.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Tanzanian phone formats strictly.
 * Hardened: Handles +255, 255, and spaces automatically.
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  const cleanDigits = phone.trim().replace(/[^\d]/g, "");
  
  let finalPhone = cleanDigits;
  if (cleanDigits.startsWith("255")) {
    finalPhone = "0" + cleanDigits.slice(3);
  }
  
  const tzRegex = /^(07|06)[0-9]{8}$/;
  return tzRegex.test(finalPhone);
}

/**
 * Bulk sanitizes form data based on a schema.
 */
export function sanitizeFormData(
  data: Record<string, any>, 
  schema: Record<string, { maxLength?: number; required?: boolean; type?: string }>
): { sanitized: Record<string, any>; errors: Record<string, string> } {
  const sanitized: Record<string, any> = {};
  const errors: Record<string, string> = {};

  for (const key in schema) {
    const config = schema[key];
    const value = data[key];

    if (config.type === 'string') {
      const cleanVal = sanitizeText(value || "", config.maxLength || 1000);
      sanitized[key] = cleanVal;

      if (config.required && !cleanVal) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
      }
    } else {
      sanitized[key] = value;
      if (config.required && (value === undefined || value === null)) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
      }
    }
  }

  return { sanitized, errors };
}
