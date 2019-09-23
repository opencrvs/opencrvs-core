import * as React from 'react'

export const BRN = (props: React.HTMLAttributes<SVGElement>) => {
  let stroke: string
  switch (props.color) {
    case 'invert':
      stroke = 'white'
      break
    default:
      stroke = '#35495D'
  }
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
