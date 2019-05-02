import * as React from 'react'

export const ClearText = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <circle cx={12} cy={12} r={9} fill="#AFB3B7" />
    <path
      d="M14.896 8.604a.5.5 0 0 1 .708.707L9.24 15.675a.5.5 0 1 1-.708-.708l6.364-6.363z"
      fill="#fff"
    />
    <path
      d="M8.396 8.604a.5.5 0 0 1 .708 0l6.364 6.364a.5.5 0 1 1-.708.707L8.396 9.31a.5.5 0 0 1 0-.707z"
      fill="#fff"
    />
  </svg>
)
