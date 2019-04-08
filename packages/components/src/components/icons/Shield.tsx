import * as React from 'react'

export const Shield = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={339} height={339} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M166.025 308.914c2.212 1.204 4.738 1.204 6.95 0C191.982 298.575 282.5 245.352 282.5 169.5V62.746a8 8 0 0 0-6.06-7.76l-105-26.25a7.997 7.997 0 0 0-3.88 0l-105 26.25a8 8 0 0 0-6.06 7.76V169.5c0 75.852 90.518 129.075 109.525 139.414z"
      fill="#EDC55E"
      stroke="#EDC55E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M151.388 113.303c0-10.162 8.24-18.401 18.407-18.401s18.406 8.239 18.406 18.401v13.531h-36.813v-13.531zm-11.902 13.531v-13.531c0-16.737 13.571-30.303 30.309-30.303 16.737 0 30.308 13.566 30.308 30.303v13.531h11.154a8.331 8.331 0 0 1 8.331 8.331v48.814a8.331 8.331 0 0 1-8.331 8.331h-82.926a8.331 8.331 0 0 1-8.331-8.331v-48.814a8.331 8.331 0 0 1 8.331-8.331h11.155zm54.666 11.901h-62.25v41.674h75.785v-41.674h-13.535z"
      fill="url(#prefix__paint0_linear)"
    />
    <defs>
      <linearGradient
        id="prefix__paint0_linear"
        x1={119.414}
        y1={82.61}
        x2={234.233}
        y2={82.61}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" />
        <stop offset={1} stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
)
