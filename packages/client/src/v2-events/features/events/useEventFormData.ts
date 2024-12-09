import { create } from 'zustand'

type FormData = Record<string, any>

type EventFormData = {
  formValues: FormData
  setFormValues: (data: FormData) => void
}

export const useEventFormData = create<EventFormData>((set) => ({
  formValues: {},
  setFormValues: (data: FormData) => set(() => data)
}))
