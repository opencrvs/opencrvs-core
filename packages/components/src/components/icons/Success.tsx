import * as React from 'react'

export const Success = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={60} height={60} {...props}>
    <title>{'Icons/nav/success_60pt'}</title>
    <g fill="none" fillRule="evenodd" stroke="#49B78D" strokeWidth={3}>
      <rect x={1.5} y={1.5} width={57} height={57} rx={28.5} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="nonzero"
        d="M19 32.304l8.425 7.916L43.075 21"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="nonzero"
        d="M19 32.304l8.425 7.916L43.075 21"
      />
    </g>
  </svg>
)

export default Success
