import * as React from 'react'

export const Warning = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={28} height={24} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
      fill="#D53F3F"
    />
    <path
      d="M12 5.778v7.11M12 17.333v.89"
      stroke="#fff"
      strokeWidth={2.772}
      strokeLinecap="round"
    />
  </svg>
)
