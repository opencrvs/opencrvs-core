import * as React from 'react'

/* TODO one line is missing */
export const ArrowWithGradientIcon = (
  props: React.HTMLAttributes<SVGElement>
) => (
  <svg width={38} height={20} {...props}>
    <title>Arrow Gradient</title>
    <defs>
      <linearGradient
        x1="96.468%"
        y1="49.468%"
        x2="3.532%"
        y2="49.468%"
        id="arrowWithGradientA"
      >
        <stop stopColor="#4C68C1" offset="0%" />
        <stop stopColor="#B0C8F1" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="-20.088%"
        y1="117.078%"
        x2="126.274%"
        y2="-28.936%"
        id="arrowWithGradientB"
      >
        <stop stopColor="#4C68C1" offset="0%" />
        <stop stopColor="#B0C8F1" offset="100%" />
      </linearGradient>
    </defs>
    <g fillRule="nonzero" strokeWidth={4} fill="none" strokeLinecap="round">
      <path
        d="M0 8h30"
        stroke="url(#arrowWithGradientA)"
        transform="translate(2 2)"
      />
      <path
        stroke="url(#arrowWithGradientB)"
        strokeLinejoin="round"
        transform="rotate(45 24.586 11.414)"
        d="M21 3h10v10"
      />
    </g>
  </svg>
)
