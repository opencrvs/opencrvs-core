import * as React from 'react'

export const TickOff = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} fill="none" {...props}>
    <circle cx={8} cy={8} r={8} fill="#C1C7C9" />
    <path
      d="M12 5.5L6.5 11 4 8.5"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
