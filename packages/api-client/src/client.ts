type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export class ApiClient {
  private baseUrl: string
  private getToken: () => Promise<string | null>

  constructor(baseUrl: string, getToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.getToken = getToken
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const token = await this.getToken()
    
    const url = new URL(`${this.baseUrl}${path}`)
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const result = await response.json()

    if (!response.ok) {
      const apiResult = result as ApiResponse<T>
      throw new ApiError(
        apiResult.error || result.detail || 'An error occurred',
        apiResult.code || 'UNKNOWN_ERROR',
        response.status
      )
    }

    if ('success' in result && result.success === true && 'data' in result) {
      return result.data as T
    }

    return result as T
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options)
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options)
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options)
  }

  private async requestUnauth<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const result = await response.json()

    if (!response.ok) {
      const apiResult = result as ApiResponse<T>
      throw new ApiError(
        apiResult.error || result.detail || 'An error occurred',
        apiResult.code || 'UNKNOWN_ERROR',
        response.status
      )
    }

    if ('success' in result && result.success === true && 'data' in result) {
      return result.data as T
    }

    return result as T
  }

  postUnauth<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.requestUnauth<T>('POST', path, body, options)
  }

  async upload(url: string, file: File, fields: Record<string, string>): Promise<void> {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })
    formData.append('file', file)

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new ApiError('Upload failed', 'UPLOAD_ERROR', response.status)
    }
  }
}

export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export function createApiClient(
  baseUrl: string,
  getToken: () => Promise<string | null>
): ApiClient {
  return new ApiClient(baseUrl, getToken)
}
