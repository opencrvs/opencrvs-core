import { Event, IFormSectionData } from '@register/forms'
import { IApplication } from '@register/applications'

const getApplicantFullName = (
  sectionData: IFormSectionData,
  language: string = 'en'
): string => {
  let fullName = ''
  if (!sectionData) {
    return fullName
  }
  if (language === 'en') {
    if (sectionData.firstNamesEng) {
      fullName = `${sectionData.firstNamesEng as string} ${sectionData.familyNameEng as string}`
    } else {
      fullName = sectionData.familyNameEng as string
    }
  } else {
    if (sectionData.firstNames) {
      fullName = `${sectionData.firstNames as string} ${sectionData.familyName as string}`
    } else {
      fullName = sectionData.familyName as string
    }
  }
  return fullName
}

export const getDraftApplicantFullName = (
  draft: IApplication,
  language?: string
) => {
  switch (draft.event) {
    case Event.BIRTH:
      return getApplicantFullName(draft.data.child, language)
    case Event.DEATH:
      return getApplicantFullName(draft.data.deceased, language)
  }
}
