export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

export async function uploadFileToS3(
  file: File,
  uploadUrl: string,
  options?: UploadOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload aborted'))
      })
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && options?.onProgress) {
        options.onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: (e.loaded / e.total) * 100,
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'))
    })

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}
