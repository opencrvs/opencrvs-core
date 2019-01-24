import * as React from 'react'

export const DraftSimple = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={20} {...props}>
    <title>{'Group 6'}</title>
    <g fill="#35495D" fillRule="nonzero">
      <g transform="rotate(90 4 8.5)">
        <rect width={2} height={9} rx={1} />
        <rect x={4} width={2} height={9} rx={1} />
        <rect x={8} y={4} width={2} height={5} rx={1} />
      </g>
      <rect width={16} height={2} rx={1} />
      <path d="M2 18h12V1a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v17z" />
    </g>
  </svg>
)
