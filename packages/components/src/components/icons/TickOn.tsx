import * as React from 'react'

export const TickOn = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={18} height={16} fill="none" {...props}>
    <ellipse cx={9.066} cy={8} rx={8.284} ry={8} fill="#49B78D" />
    <path
      d="M13.208 5.5L7.513 11l-2.59-2.5"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
