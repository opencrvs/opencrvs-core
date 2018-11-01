import { model, Schema, Document } from 'mongoose'

interface ITrackingId {
  trackingId: string
}
export interface ITrackingIdModel extends ITrackingId, Document {}

export default model<ITrackingIdModel>(
  'TrackingId',
  new Schema({
    trackingId: { type: String, required: true }
  })
)
