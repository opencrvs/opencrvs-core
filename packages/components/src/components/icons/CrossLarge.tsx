import * as React from 'react'

export const CrossLarge = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={20} height={20} {...props}>
    <g transform="rotate(-45 8.194 14.284)" fill="#FFF" fillRule="nonzero">
      <rect x={11} width={3} height={25} rx={1.5} />
      <rect
        transform="rotate(90 12.5 12.5)"
        x={11}
        width={3}
        height={25}
        rx={1.5}
      />
    </g>
  </svg>
)
