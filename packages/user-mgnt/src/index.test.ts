import { start, stop } from './index'

test('should start and stop server without error', async () => {
  await start()
  await stop()
})
