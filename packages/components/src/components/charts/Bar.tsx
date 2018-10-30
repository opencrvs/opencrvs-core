import * as React from 'react'
import styled from 'styled-components'

interface IDataPoint {
  value: number
  estimate?: boolean
  total?: boolean
}

export interface IBarChartProps {
  data: IDataPoint[]
}

const Container = styled.div`
  position: relative;
  width: 100%;
`

const Estimate = styled.div`
  height: 60px;
  width: 100%;
  box-sizing: border-box;
  border: 2px dashed ${({ theme }) => theme.colors.accent};
  padding: 6px;
`

const Total = styled.div.attrs<{ size: number; colour: string }>({})`
  width: ${({ size }) => size * 100}%;
  background: ${({ colour }) => colour};
  height: 42px;
  top: 50%;
  margin-top: -21px;
  position: absolute;
`

const SectionContainer = styled.div`
  height: 42px;
  display: flex;
  z-index: 1;
  width: 100%;
`

const Section = styled.div.attrs<{ size: number; colour: string }>({})`
  width: ${({ size }) => size * 100}%;
  height: 24px;
  top: 50%;
  position: relative;
  margin-top: -12px;
  background: ${({ colour }) => colour};
`

const colours = ['#a7b0cf', '#6575AA', '#233A86']

const calculateSum = (points: IDataPoint[]) =>
  points.reduce((sum, item) => sum + item.value, 0)

export function Bar(props: IBarChartProps) {
  const { data } = props
  const fromLargest = [...data].sort((a, b) => b.value - a.value)

  const estimatePoint = fromLargest.find(({ estimate }) => Boolean(estimate))

  const allTotalPoints = fromLargest.filter(({ total }) => !total)
  const allOtherPoints = fromLargest.filter(({ estimate }) => !estimate)

  const otherPointsValue = calculateSum(allOtherPoints)
  const sumOfTotalPoints = calculateSum(allTotalPoints)

  const totalValue =
    allTotalPoints.length > 0 ? sumOfTotalPoints : otherPointsValue

  if (estimatePoint) {
    return (
      <Container>
        <Estimate>
          <SectionContainer>
            {allOtherPoints.map((item, i) => {
              if (item.total) {
                return (
                  <Total
                    key={i}
                    size={item.value / estimatePoint.value}
                    colour={colours[i]}
                  />
                )
              }
              return (
                <Section
                  key={i}
                  size={item.value / totalValue}
                  colour={colours[i]}
                />
              )
            })}
          </SectionContainer>
        </Estimate>
      </Container>
    )
  }

  return (
    <Container>
      <SectionContainer>
        {allOtherPoints.map((item, i) => {
          if (item.total) {
            return <Total key={i} size={1} colour={colours[i]} />
          }
          return (
            <Section
              key={i}
              size={item.value / totalValue}
              colour={colours[i]}
            />
          )
        })}
      </SectionContainer>
    </Container>
  )
}
