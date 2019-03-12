export interface BirthRegistrationPoint extends Point {
  location: string | undefined
  current_status: string
  gender: string | undefined
  age_in_days: number | undefined
}

export interface Point {
  time?: string
}
