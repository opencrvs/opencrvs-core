import React from 'react'
import { colorDictionary } from '../colors'

function ColorsDisplay() {
  return (
    <div>
      <h1>Colors</h1>
      <ul
        className="color-container"
        style={{
          listStyle: 'none',
          padding: '10px 10px 10px 10px',
          display: 'inline-flex',
          flexWrap: 'wrap'
        }}
      >
        {Object.entries(colorDictionary).map(([name, color], i) => (
          <li key={i}>
            <div className="color-palette">
              <div
                className="color-box"
                style={{
                  backgroundColor: color,
                  display: 'inline-flex',
                  height: '64px',
                  width: '64px',
                  marginTop: '64px',
                  marginLeft: '56px',
                  borderRadius: '3px'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  fontSize: '14px',
                  lineHeight: '30px',
                  marginLeft: '56px',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    width: '100px'
                  }}
                >
                  <div
                    style={{
                      userSelect: 'none',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {name}
                  </div>
                </div>
                <div>{color}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default ColorsDisplay
