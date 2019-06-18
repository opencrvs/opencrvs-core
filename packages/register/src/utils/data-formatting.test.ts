import { extractCommentFragmentValue } from '@register/utils/data-formatting'

describe('Data formatting tests', () => {
  it('return a single reason', () => {
    expect(
      extractCommentFragmentValue(
        [{ id: '1', comment: 'reason=test' }],
        'reason'
      )
    ).toBe('test')
  })

  it('return a list of reasons if the is a list in the comment', () => {
    expect(
      extractCommentFragmentValue(
        [{ id: '1', comment: 'reason=test1,test2' }],
        'reason'
      )
    ).toBe('test1,test2')
  })

  it('return a multiple first reason if there are multiple comments', () => {
    expect(
      extractCommentFragmentValue(
        [
          { id: '1', comment: 'reason=test1' },
          { id: '1', comment: 'reason=test2' }
        ],
        'reason'
      )
    ).toBe('test1')
  })

  it('return no reasons if there is not one', () => {
    expect(
      extractCommentFragmentValue(
        [{ id: '1', comment: 'this is just a comment' }],
        'reason'
      )
    ).toBe('')
  })
})
