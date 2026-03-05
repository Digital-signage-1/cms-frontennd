'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface WeatherConfig {
  location: string
  units?: 'metric' | 'imperial'
  show_forecast?: boolean
  show_humidity?: boolean
  show_wind?: boolean
  show_feels_like?: boolean
  theme?: 'dark' | 'light' | 'transparent' | 'gradient'
  layout?: 'standard' | 'compact' | 'detailed' | 'large_icon'
  refresh_interval?: number
  background_mode?: 'weather_dynamic' | 'custom_image' | 'solid_color'
  background_image_url?: string
  background_color?: string
  text_color?: string
  api_base_url?: string // Backend URL override for weather API calls
}

/**
 * Resolve the backend API base URL.
 * Priority: config override > Vite env > window global > same-origin fallback
 */
function getApiBaseUrl(config: WeatherConfig): string {
  if (config.api_base_url) return config.api_base_url.replace(/\/+$/, '')
  // Vite player
  try {
    const viteUrl = (import.meta as any).env?.VITE_API_URL as string | undefined
    if (viteUrl) return viteUrl.replace(/\/api\/v1\/?$/, '')
  } catch { /* not in Vite */ }
  // Global override (host app can set window.__API_BASE_URL__)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return ((window as any).__API_BASE_URL__ as string).replace(/\/+$/, '')
  }
  return ''
}

interface WeatherRendererProps {
  config: WeatherConfig
  onError?: (error: Error) => void
}

interface WeatherData {
  temperature: number
  feels_like: number
  temp_min: number
  temp_max: number
  condition: string
  condition_description: string
  condition_code: number
  icon: string
  icon_code: string
  humidity: number
  wind_speed: number
  wind_direction: number
  location_name: string
  country: string
  sunrise: number
  sunset: number
  units: string
  background_key: string
  forecast?: ForecastDay[]
}

interface ForecastDay {
  date: string
  temperature: number
  temp_min: number
  temp_max: number
  condition: string
  condition_code: number
  icon: string
  icon_code: string
  humidity: number
}

// Weather background images served from /public/weather-bg/
// Keys match backend's _get_background_key() output
const WEATHER_BG_IMAGES: Record<string, string> = {
  // Clear
  clear: '/weather-bg/clear.jpg',
  clear_night: '/weather-bg/clear_night.jpg',
  // Clouds
  few_clouds: '/weather-bg/few_clouds.jpg',
  few_clouds_night: '/weather-bg/few_clouds_night.jpg',
  scattered_clouds: '/weather-bg/scattered_clouds.jpg',
  scattered_clouds_night: '/weather-bg/scattered_clouds_night.jpg',
  overcast: '/weather-bg/overcast.jpg',
  overcast_night: '/weather-bg/overcast_night.jpg',
  // Rain
  drizzle: '/weather-bg/drizzle.jpg',
  drizzle_night: '/weather-bg/drizzle_night.jpg',
  light_rain: '/weather-bg/light_rain.jpg',
  light_rain_night: '/weather-bg/light_rain_night.jpg',
  heavy_rain: '/weather-bg/heavy_rain.jpg',
  heavy_rain_night: '/weather-bg/heavy_rain_night.jpg',
  // Thunderstorm
  thunderstorm: '/weather-bg/thunderstorm.jpg',
  thunderstorm_night: '/weather-bg/thunderstorm_night.jpg',
  // Snow
  light_snow: '/weather-bg/light_snow.jpg',
  light_snow_night: '/weather-bg/light_snow_night.jpg',
  heavy_snow: '/weather-bg/heavy_snow.jpg',
  heavy_snow_night: '/weather-bg/heavy_snow_night.jpg',
  // Atmosphere
  fog: '/weather-bg/fog.jpg',
  fog_night: '/weather-bg/fog_night.jpg',
  haze: '/weather-bg/haze.jpg',
  haze_night: '/weather-bg/haze_night.jpg',
}

// Fallback: if a specific key isn't found, try these broader matches
function getWeatherBg(key: string): string {
  if (WEATHER_BG_IMAGES[key]) return WEATHER_BG_IMAGES[key]
  // Fallback to broader category
  if (key.includes('cloud') || key.includes('overcast')) return WEATHER_BG_IMAGES[key.includes('night') ? 'scattered_clouds_night' : 'scattered_clouds']
  if (key.includes('rain') || key.includes('drizzle')) return WEATHER_BG_IMAGES[key.includes('night') ? 'light_rain_night' : 'light_rain']
  if (key.includes('snow')) return WEATHER_BG_IMAGES[key.includes('night') ? 'light_snow_night' : 'light_snow']
  if (key.includes('fog') || key.includes('haze') || key.includes('mist')) return WEATHER_BG_IMAGES[key.includes('night') ? 'fog_night' : 'fog']
  if (key.includes('thunder') || key.includes('storm')) return WEATHER_BG_IMAGES[key.includes('night') ? 'thunderstorm_night' : 'thunderstorm']
  return WEATHER_BG_IMAGES[key.includes('night') ? 'clear_night' : 'clear']
}

// Weather condition emoji icons
const CONDITION_ICONS: Record<string, string> = {
  clear: '☀️',
  clear_night: '🌙',
  few_clouds: '🌤️',
  few_clouds_night: '☁️',
  scattered_clouds: '⛅',
  scattered_clouds_night: '☁️',
  overcast: '☁️',
  overcast_night: '☁️',
  drizzle: '🌦️',
  drizzle_night: '🌧️',
  light_rain: '🌦️',
  light_rain_night: '🌧️',
  heavy_rain: '🌧️',
  heavy_rain_night: '🌧️',
  thunderstorm: '⛈️',
  thunderstorm_night: '⛈️',
  light_snow: '🌨️',
  light_snow_night: '🌨️',
  heavy_snow: '❄️',
  heavy_snow_night: '❄️',
  fog: '🌫️',
  fog_night: '🌫️',
  haze: '🌫️',
  haze_night: '🌫️',
}

function getConditionIcon(key: string): string {
  return CONDITION_ICONS[key] || (key.includes('night') ? '🌙' : '🌤️')
}

function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function WeatherRenderer({ config, onError }: WeatherRendererProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bgImageLoaded, setBgImageLoaded] = useState(false)
  const [bgImageError, setBgImageError] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    location,
    units = 'metric',
    show_forecast = false,
    show_humidity = true,
    show_wind = true,
    show_feels_like = false,
    layout = 'standard',
    refresh_interval = 30,
    background_mode = 'weather_dynamic',
    background_image_url,
    background_color = '#1a1a2e',
    text_color = '#ffffff',
  } = config

  const tempUnit = units === 'metric' ? '°C' : '°F'
  const speedUnit = units === 'metric' ? 'km/h' : 'mph'

  const fetchWeather = useCallback(async () => {
    if (!location) {
      setError('No location configured')
      setLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({
        location,
        units,
        include_forecast: show_forecast ? 'true' : 'false',
      })

      const baseUrl = getApiBaseUrl(config)
      const headers: Record<string, string> = {}
      // Include auth token if available (dashboard context)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('signage_access_token')
        if (token) headers['Authorization'] = `Bearer ${token}`
      }
      const resp = await fetch(`${baseUrl}/api/v1/weather?${params}`, { headers })

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body.detail || `HTTP ${resp.status}`)
      }

      const json = await resp.json()
      setWeather(json.data)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather'
      setError(message)
      onError?.(err instanceof Error ? err : new Error(message))
    } finally {
      setLoading(false)
    }
  }, [location, units, show_forecast, onError])

  // If weather data is embedded in config (from manifest), use it directly
  useEffect(() => {
    const configAny = config as unknown as Record<string, unknown>
    if (configAny.temperature !== undefined && configAny.condition_code !== undefined) {
      setWeather(configAny as unknown as WeatherData)
      setLoading(false)
      return
    }
    fetchWeather()
  }, [fetchWeather, config])

  // Refresh interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const ms = refresh_interval * 60 * 1000
    intervalRef.current = setInterval(fetchWeather, ms)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchWeather, refresh_interval])

  // Preload custom background image
  useEffect(() => {
    if (background_mode !== 'custom_image' || !background_image_url) return
    setBgImageLoaded(false)
    setBgImageError(false)
    const img = new Image()
    img.onload = () => setBgImageLoaded(true)
    img.onerror = () => setBgImageError(true)
    img.src = background_image_url
  }, [background_mode, background_image_url])

  // --- Background ---
  const getBackground = (): React.CSSProperties => {
    if (background_mode === 'solid_color') {
      return { backgroundColor: background_color }
    }

    if (
      background_mode === 'custom_image' &&
      background_image_url &&
      bgImageLoaded &&
      !bgImageError
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }

    // weather_dynamic (default) or custom_image fallback
    const key = weather?.background_key || 'clear'
    const bgImg = getWeatherBg(key)
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  // --- Loading ---
  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getWeatherBg('clear')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Loading weather...</span>
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error || !weather) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${getWeatherBg('fog')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span className="text-4xl">⚠️</span>
        <span className="text-white text-sm text-center px-4">
          {error || 'Unable to load weather'}
        </span>
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            fetchWeather()
          }}
          className="mt-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const bgKey = weather.background_key || 'clear'
  const conditionIcon = getConditionIcon(bgKey)

  // --- Compact layout ---
  if (layout === 'compact') {
    return (
      <div
        className="w-full h-full flex items-center justify-center p-4"
        style={{ ...getBackground(), color: text_color }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{conditionIcon}</span>
          <div>
            <div className="text-3xl font-light">
              {Math.round(weather.temperature)}{tempUnit}
            </div>
            <div className="text-xs opacity-80">{weather.location_name}</div>
          </div>
        </div>
      </div>
    )
  }

  // --- Large icon layout ---
  if (layout === 'large_icon') {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-6"
        style={{ ...getBackground(), color: text_color }}
      >
        <span className="text-[6rem] leading-none mb-2">{conditionIcon}</span>
        <div className="text-5xl font-light">
          {Math.round(weather.temperature)}{tempUnit}
        </div>
        <div className="text-sm opacity-80 mt-1">
          {weather.condition_description}
        </div>
        <div className="text-xs opacity-60 mt-1">
          {weather.location_name}{weather.country ? `, ${weather.country}` : ''}
        </div>
      </div>
    )
  }

  // --- Detailed layout ---
  if (layout === 'detailed') {
    return (
      <div
        className="w-full h-full flex flex-col p-6 overflow-hidden"
        style={{ ...getBackground(), color: text_color }}
      >
        {/* Header */}
        <div className="text-sm opacity-70 mb-1">
          {weather.location_name}{weather.country ? `, ${weather.country}` : ''}
        </div>

        {/* Main */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{conditionIcon}</span>
          <div>
            <div className="text-5xl font-light">
              {Math.round(weather.temperature)}{tempUnit}
            </div>
            <div className="text-sm opacity-80">{weather.condition_description}</div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
          {show_feels_like && (
            <div className="flex justify-between">
              <span className="opacity-60">Feels like</span>
              <span>{Math.round(weather.feels_like)}{tempUnit}</span>
            </div>
          )}
          {show_humidity && (
            <div className="flex justify-between">
              <span className="opacity-60">Humidity</span>
              <span>{weather.humidity}%</span>
            </div>
          )}
          {show_wind && (
            <div className="flex justify-between">
              <span className="opacity-60">Wind</span>
              <span>
                {Math.round(weather.wind_speed)} {speedUnit}{' '}
                {weather.wind_direction != null && getWindDirection(weather.wind_direction)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="opacity-60">High / Low</span>
            <span>
              {Math.round(weather.temp_max)}° / {Math.round(weather.temp_min)}°
            </span>
          </div>
        </div>

        {/* Forecast */}
        {show_forecast && weather.forecast && weather.forecast.length > 0 && (
          <div className="flex gap-3 mt-auto pt-3 border-t border-white/20">
            {weather.forecast.map((day) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1 text-xs"
              >
                <span className="opacity-60">{formatDay(day.date)}</span>
                <img
                  src={day.icon}
                  alt={day.condition}
                  className="w-8 h-8"
                  loading="lazy"
                />
                <span>
                  {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // --- Standard layout (default) ---
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-8"
      style={{ ...getBackground(), color: text_color }}
    >
      <div className="text-lg opacity-80 mb-2">
        {weather.location_name}{weather.country ? `, ${weather.country}` : ''}
      </div>

      <span className="text-7xl mb-3">{conditionIcon}</span>

      <div className="text-6xl font-light">
        {Math.round(weather.temperature)}{tempUnit}
      </div>

      <div className="text-xl mt-2 opacity-90 capitalize">
        {weather.condition_description}
      </div>

      {show_feels_like && (
        <div className="text-sm mt-1 opacity-60">
          Feels like {Math.round(weather.feels_like)}{tempUnit}
        </div>
      )}

      <div className="flex gap-8 mt-6 text-sm opacity-80">
        {show_humidity && (
          <div className="flex flex-col items-center">
            <span className="text-lg">💧</span>
            <span>{weather.humidity}%</span>
          </div>
        )}
        {show_wind && (
          <div className="flex flex-col items-center">
            <span className="text-lg">💨</span>
            <span>{Math.round(weather.wind_speed)} {speedUnit}</span>
          </div>
        )}
      </div>

      {/* Inline forecast */}
      {show_forecast && weather.forecast && weather.forecast.length > 0 && (
        <div className="flex gap-4 mt-6 pt-4 border-t border-white/20">
          {weather.forecast.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 text-xs"
            >
              <span className="opacity-60">{formatDay(day.date)}</span>
              <img
                src={day.icon}
                alt={day.condition}
                className="w-8 h-8"
                loading="lazy"
              />
              <span>
                {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
