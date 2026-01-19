'use client'

import React, { ReactNode, Children, cloneElement, isValidElement } from 'react'

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom'

interface TransitionEngineProps {
  type: TransitionType
  duration: number
  isTransitioning: boolean
  children: ReactNode
}

export function TransitionEngine({
  type,
  duration,
  isTransitioning,
  children,
}: TransitionEngineProps) {
  const childArray = Children.toArray(children)
  const currentChild = childArray[0]
  const nextChild = childArray[1]

  const getTransitionStyles = (isEntering: boolean, isExiting: boolean) => {
    const baseStyle = {
      transition: `all ${duration}ms ease-in-out`,
      position: 'absolute' as const,
      inset: 0,
    }

    switch (type) {
      case 'fade':
        return {
          ...baseStyle,
          opacity: isExiting ? 0 : 1,
        }
      
      case 'slide':
        return {
          ...baseStyle,
          transform: isEntering 
            ? 'translateX(0)' 
            : isExiting 
              ? 'translateX(-100%)' 
              : 'translateX(100%)',
          opacity: 1,
        }
      
      case 'zoom':
        return {
          ...baseStyle,
          transform: isExiting ? 'scale(0.8)' : 'scale(1)',
          opacity: isExiting ? 0 : 1,
        }
      
      case 'none':
      default:
        return {
          ...baseStyle,
          opacity: isExiting ? 0 : 1,
        }
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isValidElement(currentChild) && cloneElement(currentChild as React.ReactElement<{ style?: React.CSSProperties }>, {
        style: {
          ...(isValidElement(currentChild) && typeof currentChild.props === 'object' && currentChild.props !== null && 'style' in currentChild.props ? (currentChild.props.style as React.CSSProperties) : {}),
          ...getTransitionStyles(false, isTransitioning),
        },
      })}
      {isTransitioning && nextChild && isValidElement(nextChild) && cloneElement(nextChild as React.ReactElement<{ style?: React.CSSProperties }>, {
        style: {
          ...(isValidElement(nextChild) && typeof nextChild.props === 'object' && nextChild.props !== null && 'style' in nextChild.props ? (nextChild.props.style as React.CSSProperties) : {}),
          ...getTransitionStyles(true, false),
        },
      })}
    </div>
  )
}
