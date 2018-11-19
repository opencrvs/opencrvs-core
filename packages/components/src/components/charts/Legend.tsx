import * as React from 'react'
import styled, { withTheme } from 'styled-components'
import { IDataPoint } from './datapoint'
import { ITheme } from '../theme'

export interface ILegendProps {
  data: IDataPoint[]
  smallestToLargest: boolean
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const Column = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 1em;
  margin-top: 30px;
`

const LegendItemBase = styled.div`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
  &::after {
    content: ':';
  }
`
const LegendItem = styled(LegendItemBase).attrs<{ colour: string }>({})`
  &::before {
    background: ${({ colour }) => colour};
  }
`

const EstimateLegendItem = styled(LegendItemBase)`
  &::before {
    height: 8px;
    border: 2px dotted ${({ theme }) => theme.colors.accent};
    background: transparent;
  }
`

const DataLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 1em;
`
const DataTitle = styled.h3.attrs<{ description?: string }>({})`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.accent};
  margin: ${({ description }) => (description ? `0` : `-48px 0px 0px 0px`)};
`

const DataDescription = styled.span`
  font-size: 12px;
`

const calculateSum = (points: IDataPoint[]) =>
  points.reduce((sum, item) => sum + item.value, 0)

function LegendHeader({
  dataPoint,
  colour
}: {
  dataPoint: IDataPoint
  colour: string
}) {
  if (dataPoint.estimate) {
    return <EstimateLegendItem>{dataPoint.label}</EstimateLegendItem>
  }

  return <LegendItem colour={colour}>{dataPoint.label}</LegendItem>
}

function LegendBody({
  dataPoint,
  total,
  estimate
}: {
  dataPoint: IDataPoint
  total: number
  estimate: number
}) {
  let title = `${Math.round(dataPoint.value / total * 100)}%`

  if (dataPoint.total) {
    title = `${Math.round(dataPoint.value / estimate * 100)}%`
  }

  if (dataPoint.total) {
    title = dataPoint.value.toString()
  }

  return (
    <DataLabel>
      <DataTitle description={dataPoint.description}>{title}</DataTitle>
      {dataPoint.description && (
        <DataDescription>{dataPoint.description}</DataDescription>
      )}
    </DataLabel>
  )
}

export const Legend = withTheme(
  ({ data, theme, smallestToLargest }: ILegendProps & { theme: ITheme }) => {
    const dataPointsWithoutEstimates = data.filter(
      dataPoint => !dataPoint.estimate
    )

    let sortedData = data
    if (smallestToLargest) {
      sortedData = [...data].sort((a, b) => a.value - b.value)
    }
    const allTotalPoints = sortedData.filter(({ total }) => total)
    const allEstimatePoints = sortedData.filter(({ estimate }) => estimate)

    const colours = [
      theme.colors.chartPrimary,
      theme.colors.chartSecondary,
      theme.colors.chartTertiary
    ]

    return (
      <div>
        <Row>
          {sortedData.map((dataPoint, i) => {
            const colour =
              colours[dataPointsWithoutEstimates.indexOf(dataPoint)]
            return (
              <Column key={i}>
                <LegendHeader dataPoint={dataPoint} colour={colour} />
                <LegendBody
                  dataPoint={dataPoint}
                  total={calculateSum(allTotalPoints)}
                  estimate={calculateSum(allEstimatePoints)}
                />
              </Column>
            )
          })}
        </Row>
      </div>
    )
  }
)
