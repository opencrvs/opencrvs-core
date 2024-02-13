import React from 'react'

export default function Report() {
  return (
    <div style={{ display: 'flex', marginLeft: '20px', marginTop: '20px' }}>
      <iframe
        src="http://localhost:9093/#/alerts"
        width="1000"
        height="550"
        style={{ border: '0px' }}
      ></iframe>
    </div>
  )
}
