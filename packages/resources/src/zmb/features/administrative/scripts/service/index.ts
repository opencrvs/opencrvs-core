import { ILocation } from '@resources/zmb/features/utils'

export function generateLocationResource(
  fhirLocation: fhir.Location
): ILocation {
  const loc = {} as ILocation
  loc.id = fhirLocation.id
  loc.name = fhirLocation.name
  loc.alias = fhirLocation.alias && fhirLocation.alias[0]
  loc.physicalType =
    fhirLocation.physicalType &&
    fhirLocation.physicalType.coding &&
    fhirLocation.physicalType.coding[0].display
  if (
    fhirLocation &&
    fhirLocation.identifier &&
    fhirLocation.identifier[2] &&
    fhirLocation.identifier[2].value
  ) {
    loc.jurisdictionType =
      fhirLocation.identifier && fhirLocation.identifier[2].value
  }
  loc.type =
    fhirLocation.type &&
    fhirLocation.type.coding &&
    fhirLocation.type.coding[0].code
  loc.partOf = fhirLocation.partOf && fhirLocation.partOf.reference
  return loc
}
