import * as React from 'react'

export const Selector = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={6} fill="none" {...props}>
    <path d="M8 6H0L6.8.9a2 2 0 0 1 2.4 0L16 6H8z" fill="#fff" />
  </svg>
)
