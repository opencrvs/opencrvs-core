import transformObj, { IFieldBuilders } from '@gateway/features/transformation'

describe('Object transformation module', () => {
  it('converts an object using a simple set of field builders', async () => {
    const fieldBuilders: IFieldBuilders = {
      gender: (accumulatedObj, fieldValue) => {
        accumulatedObj.gender = fieldValue === 'm' ? 'male' : 'female'
      },
      name: (accumulatedObj, fieldValue) => {
        if (!accumulatedObj.name) {
          accumulatedObj.name = []
        }

        accumulatedObj.name.push(fieldValue)
      }
    }

    const initialObject = { id: '123' }
    await transformObj(
      { gender: 'm', name: 'John Smith' },
      initialObject,
      fieldBuilders
    )

    expect(initialObject).toEqual({
      id: '123',
      gender: 'male',
      name: ['John Smith']
    })
  })

  it('converts an object using async field builders', async () => {
    const fieldBuilders: IFieldBuilders = {
      gender: async (accumulatedObj, fieldValue) => {
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 0)
        })
        accumulatedObj.gender = fieldValue === 'm' ? 'male' : 'female'
      },
      name: async (accumulatedObj, fieldValue) => {
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 0)
        })

        if (!accumulatedObj.name) {
          accumulatedObj.name = []
        }

        accumulatedObj.name.push(fieldValue)
      }
    }

    const initialObject = { id: '123' }
    await transformObj(
      { gender: 'm', name: 'John Smith' },
      initialObject,
      fieldBuilders
    )

    expect(initialObject).toEqual({
      id: '123',
      gender: 'male',
      name: ['John Smith']
    })
  })

  it('converts an object when some fields are arrays', async () => {
    const fieldBuilders: IFieldBuilders = {
      gender: (accumulatedObj, fieldValue) => {
        accumulatedObj.gender = fieldValue === 'm' ? 'male' : 'female'
      },
      name: (accumulatedObj, fieldValue) => {
        if (!accumulatedObj.name) {
          accumulatedObj.name = []
        }

        accumulatedObj.name.push(fieldValue)
      }
    }

    const initialObject = { id: '123' }
    await transformObj(
      { gender: 'm', name: ['John Smith', 'John D Smith'] },
      initialObject,
      fieldBuilders
    )

    expect(initialObject).toEqual({
      id: '123',
      gender: 'male',
      name: ['John Smith', 'John D Smith']
    })
  })

  it('converts an object with fields that are complex', async () => {
    const fieldBuilders: IFieldBuilders = {
      name: {
        given: (accumulatedObj, fieldValue) => {
          accumulatedObj.given = fieldValue
        },
        family: (accumulatedObj, fieldValue) => {
          accumulatedObj.family = fieldValue
        }
      },
      this: {
        is: {
          deep: {
            man: (accumulatedObj, fieldValue) => {
              accumulatedObj.quote = fieldValue
            }
          }
        }
      }
    }

    const initialObject = { id: '123' }
    await transformObj(
      {
        name: { given: 'John', family: 'Smith' },
        this: {
          is: {
            deep: {
              man:
                'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it'
            }
          }
        }
      },
      initialObject,
      fieldBuilders
    )

    expect(initialObject).toEqual({
      id: '123',
      given: 'John',
      family: 'Smith',
      quote:
        'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it'
    })
  })

  it('throws an Error when field builder is an object instead of a function', async () => {
    const fieldBuilders: IFieldBuilders = {
      name: { mistake: {} }
    }

    const initialObject = {}
    expect(
      transformObj(
        {
          name: ''
        },
        initialObject,
        fieldBuilders
      )
    ).rejects.toThrowError(/.*to be a FieldBuilderFunction.*/)
  })

  it('throws an Error when field builder is an function instead of an object', async () => {
    const fieldBuilders: IFieldBuilders = {
      name: () => ''
    }

    const initialObject = {}
    expect(
      transformObj(
        {
          name: {
            given: 'John'
          }
        },
        initialObject,
        fieldBuilders
      )
    ).rejects.toThrowError(/.*to be a FieldBuilder object.*/)
  })

  it("throws an Error when field builder function doesn't exist for a field", async () => {
    const fieldBuilders: IFieldBuilders = {}

    const initialObject = {}
    expect(
      transformObj(
        {
          name: {
            given: 'John'
          }
        },
        initialObject,
        fieldBuilders
      )
    ).rejects.toThrowError(/.*to be a FieldBuilder object.*/)
  })
})
