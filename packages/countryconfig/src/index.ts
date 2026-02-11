import { server } from '@opencrvs/toolkit/server'

const example = server.example.handler(({ input }) => {
  return { id: 1, name: input.name, age: input.age }
})

console.log(example)
