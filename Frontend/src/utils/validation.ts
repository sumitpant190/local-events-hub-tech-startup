// Deliberately loose: catches typos like missing "@" or domain, not full RFC 5322.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 60;

export interface LoginValues {
  email: string;
  password: string;
}

export interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}

function emailError(email: string): string | undefined {
  if (!email.trim()) return 'Email is required.';
  if (!isValidEmail(email)) return 'Enter a valid email address.';
  return undefined;
}

function passwordError(password: string): string | undefined {
  if (!password) return 'Password is required.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return undefined;
}

function nameError(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length > MAX_NAME_LENGTH) return `Name must be under ${MAX_NAME_LENGTH} characters.`;
  return undefined;
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  return {
    email: emailError(values.email),
    password: passwordError(values.password),
  };
}

export function validateSignup(values: SignupValues): FieldErrors<SignupValues> {
  const confirmPassword = !values.confirmPassword
    ? 'Please confirm your password.'
    : values.confirmPassword !== values.password
      ? 'Passwords do not match.'
      : undefined;

  return {
    name: nameError(values.name),
    email: emailError(values.email),
    password: passwordError(values.password),
    confirmPassword,
  };
}
