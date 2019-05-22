import * as React from 'react'

export const StatusWaiting = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <circle cx={12} cy={12} r={11} stroke="#707C80" strokeWidth={2} />
  </svg>
)
