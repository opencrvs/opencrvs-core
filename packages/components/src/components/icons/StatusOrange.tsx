import * as React from 'react'

export const StatusOrange = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={16} {...props}>
    <g fillRule="nonzero" fill="none">
      <circle fill="#F4F4F4" cx={8} cy={8} r={8} />
      <circle fill="#F4C78A" cx={8} cy={8} r={8} />
      <circle fill="#F4A34E" cx={8} cy={8} r={4} />
    </g>
  </svg>
)
