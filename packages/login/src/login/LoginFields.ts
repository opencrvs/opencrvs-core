type Validation = (value: any) => string | undefined

const required: Validation = (value: any) =>
  value || typeof value === 'number' ? undefined : 'Required'
const minLength = (min: number) => (value: any) =>
  value && value.length < min ? `Must be ${min} characters or more` : undefined
const isNumber = (value: any) =>
  value && isNaN(Number(value)) ? 'Must be a number' : undefined
const minLength11 = minLength(11)

type ILoginField = {
  id: string
  name: string
  minLength?: number
  validate: Validation[]
}

type ILoginFieldGroup = {
  [key: string]: ILoginField
}

export const stepOneFields: ILoginFieldGroup = {
  mobile: {
    id: 'mobile',
    name: 'mobile',
    minLength: 11,
    validate: [required, minLength11, isNumber]
  },
  password: {
    id: 'password',
    name: 'password',
    validate: [required]
  }
}
