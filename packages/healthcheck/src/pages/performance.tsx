import React from 'react'

export default function performance() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          margin: '20px',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <iframe
            src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=2"
            width="100"
            height="100"
            frameborder="0"
          />
          <iframe
            src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=7"
            width="100"
            height="100"
            frameborder="0"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <iframe
            src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=9"
            width="100"
            height="100"
            frameborder="0"
          />
          <iframe
            src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=8"
            width="100"
            height="100"
            frameborder="0"
          />
        </div>
        <iframe
          src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=6"
          width="240"
          height="205"
          frameborder="0"
        />
        <iframe
          src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=4"
          width="240"
          height="205"
          frameborder="0"
        />
        <iframe
          src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&panelId=5"
          width="240"
          height="205"
          frameborder="0"
        />
      </div>
      <div style={{ display: 'flex', marginLeft: '20px', marginTop: '10px' }}>
        <iframe
          src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&tab=transform&refresh=5s&panelId=1"
          width="480"
          height="350"
          frameBorder="0"
        />
        <iframe
          style={{ marginLeft: '10px' }}
          src="http://localhost:3002/d-solo/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&tab=transform&refresh=5s&panelId=3"
          width="480"
          height="350"
          frameborder="0"
        />
      </div>
    </div>
    // <div>
    //   <iframe
    //     src="http://localhost:3002/d/f662c48a-63b1-4093-af9b-e8677f77152e/host-resource-usage?orgId=1&tab=transform&refresh=5s"
    //     width="1000"
    //     height="700"
    //     frameborder="0"
    //   ></iframe>
    // </div>
  )
}
