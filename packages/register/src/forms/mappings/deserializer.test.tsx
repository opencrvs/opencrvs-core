import { referenceApi } from '@register/utils/referenceApi'
import traverse from 'traverse'
import { IForm } from '@register/forms'
import { deserializeForm } from './deserializer'

import { childSection } from '@register/forms/register/fieldDefinitions/birth/child-section'
import { motherSection } from '@register/forms/register/fieldDefinitions/birth/mother-section'
import { fatherSection } from '@register/forms/register/fieldDefinitions/birth/father-section'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { documentsSection } from '@register/forms/register/fieldDefinitions/birth/documents-section'
import { deceasedSection } from '@register/forms/register/fieldDefinitions/death/deceased-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { eventSection } from '@register/forms/register/fieldDefinitions/death/event-section'
import { causeOfDeathSection } from '@register/forms/register/fieldDefinitions/death/cause-of-death-section'
import { documentsSection as deathDocumentsSection } from '@register/forms/register/fieldDefinitions/death/documents-section'

function isGraphQLTag(item: any) {
  return typeof item === 'object' && item.kind && item.directives
}

function hasUnserialized(form: {}) {
  return traverse(form).reduce(
    function([paths, found], item) {
      if (typeof item === 'function' || isGraphQLTag(item)) {
        return [[...paths, this.path.join('.')], true]
      }
      return [paths, found]
    },
    [[], false]
  )
}
function hasOperatorDescriptors(form: IForm) {
  return traverse(form).reduce(
    function([paths, found], item) {
      if (typeof item === 'object' && item.operation && !isGraphQLTag(item)) {
        console.log(item)

        return [[...paths, this.path.join('.')], true]
      }
      return [paths, found]
    },
    [[], false]
  )
}

it('the form is completely serialized', () => {
  const form = {
    birth: {
      sections: [
        childSection,
        motherSection,
        fatherSection,
        registrationSection,
        documentsSection
      ]
    },
    death: {
      sections: [
        deceasedSection,
        eventSection,
        causeOfDeathSection,
        applicantsSection,
        deathDocumentsSection
      ]
    }
  }

  expect(hasUnserialized(form)).toEqual([[], false])
})

describe('Form desearializer', () => {
  it('replaces all operator descriptors from the serialized form', async () => {
    const { birth, death } = await referenceApi.loadForms()
    expect(hasOperatorDescriptors(deserializeForm(birth))).toEqual([[], false])
    expect(hasOperatorDescriptors(deserializeForm(death))).toEqual([[], false])
  })
})
