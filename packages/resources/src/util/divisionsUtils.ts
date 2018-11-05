import { ILocation } from 'src/features/administrative/service'

export const appendDivisions = (
  divisions: ILocation[],
  newDivisions: ILocation[]
): ILocation[] => {
  return newDivisions.reduce((total, item) => {
    total.push(item)
    return total
  }, divisions)
}
