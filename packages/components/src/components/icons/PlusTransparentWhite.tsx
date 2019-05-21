import * as React from 'react'

export const PlusTransparentWhite = (
  props: React.HTMLAttributes<SVGElement>
) => (
  <svg width={27} height={27} fill="none" {...props}>
    <path
      d="M6.019 14.135h15.15M13.594 6.56v15.15"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
)
