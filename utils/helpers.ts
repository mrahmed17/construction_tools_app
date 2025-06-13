// Helper functions for the app
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format currency in Bangladeshi Taka
export const formatCurrency = (amount: number) => {
  return `৳${amount.toLocaleString('bn-BD')}`;
};

// Format date in Bangla
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('bn-BD', options);
};

// Calculate roof area needed based on dimensions
export const calculateRoofMaterial = (length: number, width: number) => {
  // Add 10% extra for overlaps and wastage
  const area = length * width * 1.1;
  
  return {
    area, // in square feet
    tinSheets: Math.ceil(area / 8), // assuming standard tin sheet covers 8 sq feet
  };
};

// Calculate wall materials needed
export const calculateWallMaterial = (length: number, height: number, thickness: number) => {
  const wallArea = length * height;
  
  // Different calculations based on material type
  return {
    bricks: Math.ceil((wallArea * 12.5) / (1 - thickness/100)), // Rough estimate of bricks needed
    cement: Math.ceil((wallArea * thickness * 0.01) / 1.8), // in bags
    sand: Math.ceil((wallArea * thickness * 0.01) / 45), // in cubic feet
  };
};

// Check if a value is numeric
export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Safe parsing for numbers
export const safeParseFloat = (value: any, defaultValue: number = 0): number => {
  if (isNumeric(value)) {
    return parseFloat(value);
  }
  return defaultValue;
};

// Format date in yyyy-mm-dd format
export const formatDateForInput = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};