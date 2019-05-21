import * as React from 'react'

export const Plus = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M12 4L12 20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)
