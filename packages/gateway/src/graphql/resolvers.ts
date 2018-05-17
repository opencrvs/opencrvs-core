import { filter, find } from 'lodash'

const authors = [
  {
    id: 1,
    firstName: 'Tom',
    lastName: 'Coleman'
  },
  {
    id: 2,
    firstName: 'Sashko',
    lastName: 'Stubailo'
  },
  {
    id: 3,
    firstName: 'Mikhail',
    lastName: 'Novikov'
  }
]

const posts = [
  {
    id: 1,
    authorId: 1,
    title: 'Introduction to GraphQL',
    votes: 2
  },
  {
    id: 2,
    authorId: 2,
    title: 'Welcome to Apollo',
    votes: 3
  },
  {
    id: 3,
    authorId: 2,
    title: 'Advanced GraphQL',
    votes: 1
  },
  {
    id: 4,
    authorId: 3,
    title: 'Launchpad is Cool',
    votes: 7
  }
]

export const resolvers = {
  Query: {
    posts: () => posts,
    author: (_: any, { id }: any) => find(authors, { id })
  },
  Mutation: {
    upvotePost: (_: any, { postId }: any) => {
      const post = find(posts, { id: postId })
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`)
      }
      post.votes += 1
      return post
    }
  },
  Author: {
    posts: (author: any) => filter(posts, { authorId: author.id })
  },
  Post: {
    author: (post: any) => find(authors, { id: post.authorId })
  }
}
