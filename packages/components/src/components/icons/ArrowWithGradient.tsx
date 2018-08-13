import * as React from 'react'

/* TODO run through https://svgr.now.sh/ */
export const ArrowWithGradientIcon = (
  props: React.HTMLAttributes<SVGElement>
) => (
  <svg width={38} height={20} {...props}>
    <title>Arrow Gradient</title>

    <defs>
      <linearGradient
        x1="96.4677685%"
        y1="49.4679251%"
        x2="3.53223148%"
        y2="49.4679251%"
        id="linearGradient-1"
      >
        <stop stop-color="#4C68C1" offset="0%" />
        <stop stop-color="#B0C8F1" offset="100%" />
      </linearGradient>
      <linearGradient
        x1="-20.0881137%"
        y1="117.078227%"
        x2="126.273753%"
        y2="-28.9360891%"
        id="linearGradient-2"
      >
        <stop stop-color="#4C68C1" offset="0%" />
        <stop stop-color="#B0C8F1" offset="100%" />
      </linearGradient>
    </defs>
    <g
      id="Symbols"
      stroke="none"
      stroke-width="1"
      fill="none"
      fill-rule="evenodd"
      stroke-linecap="round"
    >
      <g
        id="Box/One-line"
        transform="translate(-475.000000, -38.000000)"
        fill-rule="nonzero"
        stroke-width="4"
      >
        <g id="Group-2">
          <g id="Group-4" transform="translate(477.000000, 40.000000)">
            <g id="Group-5-Copy">
              <g id="Arrow-Gradient">
                <path
                  d="M0,8 L30,8"
                  id="Line-3"
                  stroke="url(#linearGradient-1)"
                />
                <polyline
                  id="Line-6"
                  stroke="url(#linearGradient-2)"
                  stroke-linejoin="round"
                  transform="translate(26.000000, 8.000000) rotate(-315.000000) translate(-26.000000, -8.000000) "
                  points="21 3 31 3 31 13"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
)
