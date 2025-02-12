import { validate } from './validate'
import { and, or, field, not, ConditionalParameters } from './conditionals'
import { formatISO } from 'date-fns'

const params = {
  $form: {
    'applicant.name': 'John Doe',
    'applicant.dob': '1990-01-02'
  },
  $now: formatISO(new Date(), { representation: 'date' })
} satisfies ConditionalParameters

describe('Validate conditionals', () => {
  it('should validate and condition', () => {
    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1989-01-01')
        ),
        params
      )
    ).toBe(true)

    expect(
      validate(
        and(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        params
      )
    ).toBe(false)
  })

  it('should validate or condition', () => {
    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1989-01-01')
        ),
        params
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('John Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        params
      )
    ).toBe(true)

    expect(
      validate(
        or(
          field('applicant.name').isEqualTo('Jack Doe'),
          field('applicant.dob').isAfter().date('1991-01-01')
        ),
        params
      )
    ).toBe(false)
  })

  it('should validate not condition', () => {
    expect(
      validate(not(field('applicant.name').isEqualTo('John Doe')), params)
    ).toBe(false)

    expect(
      validate(not(field('applicant.name').isEqualTo('Jack Doe')), params)
    ).toBe(true)
  })

  it('should validate field isAfter condition', () => {
    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-03'), params)
    ).toBe(false)

    // seems to be inclusive
    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-02'), params)
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isAfter().date('1990-01-01'), params)
    ).toBe(true)
  })

  it('should validate field isBefore condition', () => {
    expect(
      validate(field('applicant.dob').isBefore().date('1990-01-03'), params)
    ).toBe(true)

    // seems to be exclusive
    expect(
      validate(field('applicant.dob').isBefore().date('1990-01-02'), params)
    ).toBe(true)

    expect(
      validate(field('applicant.dob').isBefore().date('1990-01-01'), params)
    ).toBe(false)
  })

  it('should validate field isEqualTo condition', () => {
    expect(
      validate(field('applicant.name').isEqualTo('John Doe'), params)
    ).toBe(true)
    expect(
      validate(field('applicant.name').isEqualTo('Jane Doe'), params)
    ).toBe(false)
  })

  it('should validate field isUndefined condition', () => {
    expect(validate(field('applicant.name').isUndefined(), params)).toBe(false)
    expect(validate(field('applicant.name.foo').isUndefined(), params)).toBe(
      true
    )
  })

  it('should validate field inArray condition', () => {
    expect(
      validate(
        field('applicant.name').inArray(['Jack Doe', 'Jane Doe']),
        params
      )
    ).toBe(false)
    expect(
      validate(
        field('applicant.name').inArray(['John Doe', 'Jane Doe']),
        params
      )
    ).toBe(true)
  })
})
