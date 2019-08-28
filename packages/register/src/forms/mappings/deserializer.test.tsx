import { referenceApi } from '@register/utils/referenceApi'
import traverse from 'traverse'
import { IForm } from '@register/forms'
import { deserializeForm } from './deserializer'

function isGraphQLTag(item: any) {
  return typeof item === 'object' && item.kind && item.directives
}

function hasOperatorDescriptors(form: IForm) {
  return traverse(form).reduce(
    function([paths, found], item) {
      if (typeof item === 'object' && item.operation && !isGraphQLTag(item)) {
        return [[...paths, this.path.join('.')], true]
      }
      return [paths, found]
    },
    [[], false]
  )
}

describe('Form desearializer', () => {
  it('replaces all operator descriptors from the serialized form', async () => {
    const { birth, death } = await referenceApi.loadForms()
    expect(hasOperatorDescriptors(deserializeForm(birth))).toEqual([[], false])
    expect(hasOperatorDescriptors(deserializeForm(death))).toEqual([[], false])
  })

  it('throws errors when developer passes in invalid operations', async () => {
    const { birth } = await referenceApi.loadForms()

    birth.sections[0].groups[0].fields[0].mapping!.mutation!.operation = 'non_existing_123' as any

    expect(() => deserializeForm(birth)).toThrow()
    expect((console.error as jest.Mock).mock.calls).toHaveLength(1)
    expect((console.error as jest.Mock).mock.calls[0][0]).toMatch(
      'non_existing_123'
    )
  })
})
