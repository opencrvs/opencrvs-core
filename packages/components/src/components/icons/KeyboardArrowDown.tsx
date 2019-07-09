import * as React from 'react'
import { colors } from '../colors'

export const KeyboardArrowDown = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path
      d="M6 9l6 5.96L18 9"
      stroke={props.color || colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
