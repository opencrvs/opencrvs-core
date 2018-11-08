import * as ShortUIDGen from 'short-uid'
import TrackingId, { ITrackingIdModel } from './model/trackingId'

export async function generateBirthTrackingId(): Promise<string> {
  return await generateTrackingId('B')
}

export async function generateDeathTrackingId() {
  return await generateTrackingId('D')
}

async function generateTrackingId(prefix: string): Promise<string> {
  const newTrackingId = prefix.concat(new ShortUIDGen().randomUUID())

  const existingTrackingId: ITrackingIdModel | null = await TrackingId.findOne({
    trackingId: newTrackingId
  })

  if (!existingTrackingId) {
    await new TrackingId({ trackingId: newTrackingId }).save()
    return newTrackingId
  }
  return await generateTrackingId(prefix)
}
