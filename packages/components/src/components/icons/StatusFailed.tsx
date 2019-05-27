import * as React from 'react'

export const StatusFailed = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="9" cy="9" r="8" stroke="#D53F3F" strokeWidth="2" />
  </svg>
)

export const StatusFailed24 = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <circle cx={12} cy={12} r={11} stroke="#D53F3F" strokeWidth={2} />
  </svg>
)
