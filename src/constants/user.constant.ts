export const USER_REGISTRATION_LIMIT = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 20,
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/,
} as const;
