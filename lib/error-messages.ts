/**
 * Backend error code → human-readable message map.
 * Only codes that would look bad shown raw to a user need entries here.
 * Anything not mapped falls through to the backend's own message string.
 */
export const errorMessages: Record<string, string> = {
  // Auth
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You don\'t have permission to access this resource.',
  PROFILE_INCOMPLETE: 'Please complete your profile before continuing.',
  PROFILE_ALREADY_COMPLETE: 'Your profile is already set up.',

  // Submissions
  SUBMISSION_NOT_FOUND: 'This submission could not be found.',
  SUBMISSION_ALREADY_EXISTS: 'You\'ve already submitted for this task.',
  SUBMISSION_NOT_PENDING: 'This submission can no longer be modified.',
  INVALID_SUBMISSION_STATUS: 'This action isn\'t available for the current submission status.',

  // Tasks
  TASK_NOT_FOUND: 'This task could not be found.',
  TASK_INACTIVE: 'This task is no longer accepting submissions.',
  RANK_REQUIREMENT_NOT_MET: 'You haven\'t reached the required rank for this task yet.',

  // Reviews
  REVIEW_NOT_FOUND: 'This review could not be found.',
  REVIEW_ALREADY_EXISTS: 'This submission has already been reviewed.',
  REVIEW_EDIT_WINDOW_CLOSED: 'The edit window for this review has passed.',

  // Judge
  JUDGE_NOT_FOUND: 'Judge not found.',
  NO_AVAILABLE_JUDGES: 'No judges are currently available for assignment.',

  // Users
  USER_NOT_FOUND: 'User not found.',

  // Posts
  POST_NOT_FOUND: 'This post could not be found.',

  // General
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: 'You\'re doing that too fast. Please slow down.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
};
