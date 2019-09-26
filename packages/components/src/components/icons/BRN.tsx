import * as React from 'react'

export const BRN = (props: React.HTMLAttributes<SVGElement>) => {
  const stroke = props.color === 'invert' ? 'white' : '#35495D'
  return (
    <svg width={24} height={24} fill="none" {...props}>
      <path
        clipRule="evenodd"
        d="M12 15a7 7 0 100-14 7 7 0 000 14z"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
