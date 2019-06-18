# Object Transformation Module

This module allows an object to be converted field by field into another object. This ensures that every field in the source object has transformation logic as the transformation module will complain if you don't provide a builder function for that field.

This module works well with GraphQL as it provides us a very similar method to construct a domain object from a GraphQL representation as you would for converting a domain object to a GraphQL representation using GraphQL resolvers.

To use this module you define 'builder' functions (the inverse of resolvers) for each field of the source object. Each field builder is a function that adds to a single target object which will be the final representation of the converted object.

Builder function have the following signature:

```ts
async (accumulatedObj, fieldValue) => { /* alter accumulatedObj here */ }
```

These functions may be asynchronous if necessary. E.g. if you need to make an API call to fetch additional data.

Example usage

```ts
import transformObj, { IFieldBuilders } from '@gateway/features/transformation'

// the property name of the builder must match the property name in the incoming
// source object, these may also be nested if the source object has nested properties
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
// initialObject = { id: '123', gender: 'male', name: ['John Smith'] }
```

## Complex field builders

The builder fields can also be complex:

```ts
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

// initialObject = {
//   id: '123',
//   given: 'John',
//   family: 'Smith',
//   quote:
//     'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it'
// }
```

## Arrays in the source object

The source object can also have arrays as values, in this case the builder function is applied to each value sequentially.

```ts
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

// initialObject = {
//   id: '123',
//   gender: 'male',
//   name: ['John Smith', 'John D Smith']
// }
```
