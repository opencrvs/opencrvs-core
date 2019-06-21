import * as React from 'react'

export const Success = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={40} height={40} fill="none" {...props}>
    <circle cx={20} cy={20} r={11} fill="#fff" stroke="#fff" strokeWidth={2} />
    <path
      d="M14 19.594L18.56 25 26 16"
      stroke="#49B78D"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default Success
