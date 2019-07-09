import * as React from 'react'

export const Delete = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={16} height={20} {...props}>
    <title>{'52CD93C3-C32C-405E-AB7D-E47825C05997'}</title>
    <g fill={props.color || '#D53F3F'} fillRule="nonzero" opacity={0.9}>
      <rect x={5} y={7} width={2} height={9} rx={1} />
      <rect x={9} y={7} width={2} height={9} rx={1} />
      <path d="M7 0h2a2 2 0 0 1 2 2H5a2 2 0 0 1 2-2z" />
      <rect y={2} width={16} height={2} rx={1} />
      <path d="M2 18h12V6a1 1 0 0 1 2 0v13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v12z" />
    </g>
  </svg>
)
