import * as React from 'react'

export const EyeOn = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4 12C4 12 7 6 12.25 6C17.5 6 20.5 12 20.5 12C20.5 12 17.5 18 12.25 18C7 18 4 12 4 12Z"
      stroke="#4C68C1"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.25 14.25C13.4926 14.25 14.5 13.2426 14.5 12C14.5 10.7574 13.4926 9.75 12.25 9.75C11.0074 9.75 10 10.7574 10 12C10 13.2426 11.0074 14.25 12.25 14.25Z"
      stroke="#4C68C1"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)
