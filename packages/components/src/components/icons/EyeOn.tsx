import * as React from 'react'

export const EyeOn = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      clipRule="evenodd"
      d="M4 12s3-6 8.25-6 8.25 6 8.25 6-3 6-8.25 6S4 12 4 12z"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      clipRule="evenodd"
      d="M12.25 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z"
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
