/**
 * Validation utilities for forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate required field
 */
export function validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return {
      isValid: false,
      error: `กรุณากรอก${fieldName}`,
    };
  }
  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value.length < min || value.length > max) {
    return {
      isValid: false,
      error: `${fieldName}ต้องมี ${min}-${max} ตัวอักษร`,
    };
  }
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "รูปแบบอีเมลไม่ถูกต้อง",
    };
  }
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return {
      isValid: false,
      error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    };
  }
  return { isValid: true };
}

/**
 * Validate password match
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "รหัสผ่านไม่ตรงกัน",
    };
  }
  return { isValid: true };
}

/**
 * Validate max length
 */
export function validateMaxLength(value: string, max: number, fieldName: string): ValidationResult {
  if (value.length > max) {
    return {
      isValid: false,
      error: `${fieldName}ต้องไม่เกิน ${max} ตัวอักษร`,
    };
  }
  return { isValid: true };
}
