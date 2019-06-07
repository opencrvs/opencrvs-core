import TimeoutLink from '@register/utils/timeoutLink'
import gql from 'graphql-tag'
import {
  ApolloLink,
  Observable,
  Operation,
  execute,
  GraphQLRequest,
  FetchResult
} from 'apollo-link'

const testOperation: GraphQLRequest = {
  query: gql`
    query {
      hello
    }
  `,
  operationName: 'testQuery',
  variables: {},
  context: {},
  extensions: {}
}

const fastResponseLink = new ApolloLink((operation: Operation) => {
  return new Observable(observer => {
    new Promise(resolve => {
      setTimeout(() => resolve({ response: true }), 100)
    }).then(res =>
      observer.next(res as FetchResult<
        { [key: string]: any },
        Record<string, any>,
        Record<string, any>
      >)
    )
  })
})

const slowResponseLink = new ApolloLink((operation: Operation) => {
  return new Observable(observer => {
    new Promise(resolve => {
      setTimeout(() => resolve({ response: true }), 300)
    }).then(res =>
      observer.next(res as FetchResult<
        { [key: string]: any },
        Record<string, any>,
        Record<string, any>
      >)
    )
  })
})

const timeoutLink = new TimeoutLink(200)
const fakeTimeoutLink = new TimeoutLink(-1)

const composedPassingLink = timeoutLink.concat(fastResponseLink)
const composedFailingLink = timeoutLink.concat(slowResponseLink)
const composedTimelessLink = fakeTimeoutLink.concat(slowResponseLink)

describe('tests for timeout link', () => {
  it('request served within timeout', done => {
    execute(composedPassingLink, testOperation).subscribe({
      next: data => {
        expect(data).toEqual({ response: true })
        done()
      },
      error: e => {
        expect(e).toBe(null)
        done()
      }
    })
  })

  it('resquest aborted with error when exceeds timeout', done => {
    execute(composedFailingLink, testOperation).subscribe({
      next: data => {
        expect(data).toBe(null)
        done()
      },
      error: e => {
        expect(e.message).toBe('Timeout exceeded for query "testQuery"')
        done()
      }
    })
  })

  it('skips timeout link when timeout is explicitly set <0 even if slow response', done => {
    execute(composedTimelessLink, testOperation).subscribe({
      next: data => {
        expect(data).toEqual({ response: true })
        done()
      },
      error: e => {
        expect(e).toBe(null)
        done()
      }
    })
  })
})
