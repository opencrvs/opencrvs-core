export function getSectionBySectionCode(
  bundle: fhir.Bundle,
  sectionCode: string
): fhir.Patient {
  const composition = getComposition(bundle)
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some(coding => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(`No section found for given code: ${sectionCode}`)
  }
  const sectionRef = personSection.entry[0].reference
  const personEntry =
    bundle.entry &&
    bundle.entry.find((entry: any) => entry.fullUrl === sectionRef)

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}

export function getRegLastLocation(bundle: fhir.Bundle) {
  const task: fhir.Task | undefined = getTask(bundle)
  if (!task) {
    throw new Error('Task not found!')
  }
  const regLastLocation =
    task.extension &&
    task.extension.find(
      extension =>
        extension.url === 'http://opencrvs.org/specs/extension/regLastLocation'
    )

  return (
    regLastLocation &&
    regLastLocation.valueReference &&
    regLastLocation.valueReference.reference
  )
}

export function getComposition(
  bundle: fhir.Bundle
): fhir.Composition | undefined {
  const bundleEntry =
    bundle &&
    bundle.entry &&
    bundle.entry.find(entry => {
      if (!entry.resource) {
        return false
      } else {
        return entry.resource.resourceType === 'Composition'
      }
    })
  return bundleEntry && (bundleEntry.resource as fhir.Composition)
}

export function getTask(bundle: fhir.Bundle): fhir.Task | undefined {
  const bundleEntry =
    bundle &&
    bundle.entry &&
    bundle.entry.find(entry => {
      if (!entry.resource) {
        return false
      } else {
        return entry.resource.resourceType === 'Task'
      }
    })
  return bundleEntry && (bundleEntry.resource as fhir.Task)
}
