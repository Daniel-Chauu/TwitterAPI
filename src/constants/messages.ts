const USER_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_2_TO_100: 'Name length must be from 2 to 100 characters',
  PASSOWRD_IS_REQUIRED: 'Password is required',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50 characters',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must contain at least one uppercase, one lowercase and one special character, minimum length 6',
  CONFIRM_PASSWORD_DOESN_NOT_MATCH_PASSWORD: 'Confirm password does not match password',
  DATE_OF_BIRTH_MUST_BE_A_ISO8601: 'Date of birth must be a ISO8601',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  LOGIN_SUCCESS: 'Login is successfully',
  REGISTER_SUCCESS: 'Register is successfully'
} as const

export { USER_MESSAGES }
