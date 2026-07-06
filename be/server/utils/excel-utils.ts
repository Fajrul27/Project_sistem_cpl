/**
 * Extract plain text from an Excel cell value, handling rich text objects.
 */
export const getCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    // Handle rich text
    if (typeof value === 'object' && value.richText) {
        return value.richText.map((rt: any) => rt.text || '').join('');
    }
    
    // Handle formula results
    if (typeof value === 'object' && value.result !== undefined) {
        return String(value.result).trim();
    }
    
    // Handle hyperlink objects
    if (typeof value === 'object' && value.text !== undefined) {
        return String(value.text).trim();
    }
    
    // Handle other objects (unlikely for plain text)
    if (typeof value === 'object' && !Array.isArray(value)) {
        return '';
    }
    
    return String(value).trim();
};
