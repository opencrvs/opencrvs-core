import { createStore } from './store'
import { SubmissionController } from './SubmissionController'

describe('Submission Controller', () => {
  it('Should start the interval', () => {
    window.setInterval = jest.fn()
    const { store } = createStore()
    new SubmissionController(store).start()
    expect(setInterval).toBeCalled()
  })
})
