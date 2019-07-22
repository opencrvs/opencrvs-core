import * as React from 'react'

export const Upload = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M16 6l-4-4-4 4M12 2v14"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
