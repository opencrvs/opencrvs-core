export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}
export interface ISearchQuery {
  query?: string
  trackingId?: string
  contactNumber?: string
  registrationNumber?: string
  event?: string
  status?: string[]
  applicationLocationId?: string
  createdBy?: string
  from?: number
  size?: number
  sort?: SortOrder
}

export interface IFilter {
  event?: string
  status?: string[]
}
