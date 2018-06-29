import { createServer } from './index'

test('should start and stop server without error', async () => {
  const { start, stop } = await createServer()
  await start()
  await stop()
})
