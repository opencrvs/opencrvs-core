import * as React from 'react'

export const Next = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={48} height={40} {...props}>
    <g fill="none" fillRule="evenodd">
      <rect fill="#FFF" width={48} height={40} rx={20} />
      <path
        stroke="#4C68C1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fillRule="nonzero"
        d="M22.343 14.4L28 20.057l-5.657 5.657"
      />
    </g>
  </svg>
)
