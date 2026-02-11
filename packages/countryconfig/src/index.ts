import { contract, implement } from '@opencrvs/toolkit/server'

const server = implement(contract)

server.events.handler(() => [])
server.workqueue.handler(() => [])
server.roles.handler(() => [])
server.application.config.handler(() => ({}))
server.certificates.handler(() => ({}))
server.users.handler(() => [])
server.locations.handler(() => [])
server.trigger.handler(() => ({}))
server.content.handler(() => ({}))
