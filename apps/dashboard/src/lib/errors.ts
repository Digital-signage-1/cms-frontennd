import { ApiError } from '@signage/api-client'

export { ApiError } from '@signage/api-client'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NOT_FOUND':
        return 'The requested resource was not found.'
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.'
      case 'UNAUTHORIZED':
        return 'Please sign in to continue.'
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.'
      case 'CONFLICT':
        return 'This resource already exists.'
      default:
        return error.message || 'An error occurred'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function createApiError(response: Response, data?: any): ApiError {
  const statusCode = response.status
  let code = 'UNKNOWN'
  let message = data?.message || data?.detail || response.statusText || 'An error occurred'

  switch (statusCode) {
    case 400:
      code = 'VALIDATION_ERROR'
      break
    case 401:
      code = 'UNAUTHORIZED'
      message = 'Please sign in to continue.'
      break
    case 403:
      code = 'FORBIDDEN'
      break
    case 404:
      code = 'NOT_FOUND'
      break
    case 409:
      code = 'CONFLICT'
      break
    case 500:
      code = 'INTERNAL_ERROR'
      message = 'A server error occurred. Please try again later.'
      break
  }

  return new ApiError(message, code, statusCode)
}
