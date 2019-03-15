import * as React from 'react'

export const Duplicate = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={34} height={20} {...props}>
    <g fill="none">
      <path
        d="M1 0h8.003L15 6.008V19a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"
        fill="#EC9284"
      />
      <path fill="#D53F3F" d="M9 0l6 6H9z" />
      <path
        d="M20 0h8.003L34 6.008V19a1 1 0 0 1-1 1H20a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"
        fill="#EC9284"
      />
      <path fill="#D53F3F" d="M28 0l6 6h-6z" />
    </g>
  </svg>
)
