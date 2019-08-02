import * as React from 'react'

export const BackArrowDeepSea = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={18} height={14} fill="none" {...props}>
    <g
      stroke="#4C68C1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 7H1M7 13L1 7l6-6" />
    </g>
  </svg>
)
