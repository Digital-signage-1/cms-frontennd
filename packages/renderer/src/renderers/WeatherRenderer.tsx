'use client'

import { useState, useEffect } from 'react'

interface WeatherRendererProps {
  config: {
    location: string
    units?: 'celsius' | 'fahrenheit'
    show_forecast?: boolean
    forecast_days?: number
    api_key?: string
  }
  onError?: (error: Error) => void
}

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  humidity: number
  wind_speed: number
  location: string
}

export function WeatherRenderer({
  config,
  onError: _onError,
}: WeatherRendererProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const {
    location,
    units = 'celsius',
    show_forecast: _show_forecast = false,
  } = config

  useEffect(() => {
    setLoading(true)
    setError(false)
    
    const mockWeather: WeatherData = {
      temperature: units === 'celsius' ? 22 : 72,
      condition: 'Partly Cloudy',
      icon: '⛅',
      humidity: 65,
      wind_speed: 12,
      location: location || 'New York, NY',
    }
    
    setTimeout(() => {
      setWeather(mockWeather)
      setLoading(false)
    }, 500)
  }, [location, units])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700 text-white">
        <span className="text-sm">Unable to load weather</span>
      </div>
    )
  }

  const tempUnit = units === 'celsius' ? '°C' : '°F'

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8">
      <div className="text-lg opacity-80 mb-2">{weather.location}</div>
      
      <div className="text-8xl mb-4">{weather.icon}</div>
      
      <div className="text-6xl font-light">
        {weather.temperature}{tempUnit}
      </div>
      
      <div className="text-xl mt-2 opacity-90">{weather.condition}</div>
      
      <div className="flex gap-8 mt-6 text-sm opacity-80">
        <div className="flex flex-col items-center">
          <span>💧</span>
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex flex-col items-center">
          <span>💨</span>
          <span>{weather.wind_speed} km/h</span>
        </div>
      </div>
    </div>
  )
}
