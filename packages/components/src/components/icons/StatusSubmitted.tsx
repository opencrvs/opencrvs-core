import * as React from 'react'

export const StatusSubmitted = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <circle
      cx={12}
      cy={12}
      r={11}
      fill="#49B78D"
      stroke="#49B78D"
      strokeWidth={2}
    />
  </svg>
)
