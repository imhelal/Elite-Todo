import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', glass = false }) => {
  return (
    <div className={`card ${glass ? 'glass' : ''} ${className}`}>
      {children}
    </div>
  )
}
