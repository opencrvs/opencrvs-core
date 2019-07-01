import * as React from 'react'

export const Cross = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M17.793 5.207a1 1 0 1 1 1.414 1.414L6.48 19.35a1 1 0 1 1-1.414-1.414L17.793 5.207z"
      fill="#4C68C1"
    />
    <path
      d="M4.793 5.207a1 1 0 0 1 1.414 0l12.728 12.728a1 1 0 1 1-1.414 1.414L4.793 6.621a1 1 0 0 1 0-1.414z"
      fill="#4C68C1"
    />
  </svg>
)
