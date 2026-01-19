export interface LoadedContent {
  url: string
  type: 'image' | 'video' | 'other'
  blob?: Blob
  loaded: boolean
  error?: Error
}

export interface ContentLoaderOptions {
  maxConcurrent?: number
  timeout?: number
  onProgress?: (loaded: number, total: number) => void
  onError?: (url: string, error: Error) => void
}

export class ContentLoader {
  private cache = new Map<string, LoadedContent>()
  private loading = new Map<string, Promise<LoadedContent>>()
  private options: Required<ContentLoaderOptions>

  constructor(options: ContentLoaderOptions = {}) {
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      timeout: options.timeout ?? 30000,
      onProgress: options.onProgress ?? (() => {}),
      onError: options.onError ?? (() => {}),
    }
  }

  async preload(urls: string[]): Promise<LoadedContent[]> {
    const results: LoadedContent[] = []
    const total = urls.length
    let loaded = 0

    const chunks = this.chunkArray(urls, this.options.maxConcurrent)

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        try {
          const content = await this.load(url)
          loaded++
          this.options.onProgress(loaded, total)
          return content
        } catch (error) {
          loaded++
          this.options.onProgress(loaded, total)
          this.options.onError(url, error as Error)
          return {
            url,
            type: 'other' as const,
            loaded: false,
            error: error as Error,
          }
        }
      })

      const chunkResults = await Promise.all(promises)
      results.push(...chunkResults)
    }

    return results
  }

  async load(url: string): Promise<LoadedContent> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    if (this.loading.has(url)) {
      return this.loading.get(url)!
    }

    const loadPromise = this.fetchContent(url)
    this.loading.set(url, loadPromise)

    try {
      const content = await loadPromise
      this.cache.set(url, content)
      return content
    } finally {
      this.loading.delete(url)
    }
  }

  private async fetchContent(url: string): Promise<LoadedContent> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout)

    try {
      const response = await fetch(url, { signal: controller.signal })
      
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      const type = this.getContentType(contentType)
      const blob = await response.blob()

      return {
        url,
        type,
        blob,
        loaded: true,
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Timeout loading: ${url}`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private getContentType(mimeType: string): 'image' | 'video' | 'other' {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'other'
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  getFromCache(url: string): LoadedContent | undefined {
    return this.cache.get(url)
  }

  isLoaded(url: string): boolean {
    return this.cache.has(url) && this.cache.get(url)!.loaded
  }

  clearCache(): void {
    this.cache.clear()
  }

  removeFromCache(url: string): void {
    this.cache.delete(url)
  }
}
