import React from 'react'

export default function performance() {
  return (
    <div>
      <div style={{ display: 'flex', marginTop: 20 }}>
        <div
          style={{
            backgroundColor: 'white',
            width: '40%',
            height: 200,
            marginLeft: 20,
            borderRadius: 10
          }}
        >
          <h3 style={{ margin: 20 }}>Server Resources</h3>
          <div
            style={{ display: 'flex', marginTop: 20, alignContent: 'center' }}
          >
            <div
              style={{
                backgroundColor: '#C0FCE3',
                width: 110,
                height: 120,
                marginLeft: 20,
                padding: 10,
                borderRadius: 10
              }}
            >
              HARD DISK
            </div>
            <div
              style={{
                backgroundColor: '#E1E8F3',
                width: 100,
                height: 120,
                marginLeft: 20,
                padding: 10,
                borderRadius: 10
              }}
            >
              CPU
            </div>
            <div
              style={{
                backgroundColor: '#FBEFDC',
                width: 100,
                height: 120,
                marginLeft: 20,
                padding: 10,
                borderRadius: 10
              }}
            >
              RAM
            </div>
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'white',
            width: '54%',
            height: 200,
            marginLeft: 20
          }}
        ></div>
      </div>
      <div></div>
    </div>
  )
}
