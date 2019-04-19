import * as React from 'react'

export const RotateLeft = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M14 15l-5 5-5-5"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 4h-7a4 4 0 0 0-4 4v12"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default RotateLeft
