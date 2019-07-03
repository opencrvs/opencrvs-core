import { defineMessages } from 'react-intl'

export enum QUESTION_KEYS {
  BIRTH_TOWN,
  HIGH_SCHOOL,
  MOTHER_NAME,
  FAVORITE_TEACHER,
  FAVORITE_MOVIE,
  FAVORITE_SONG,
  FAVORITE_FOOD,
  FIRST_CHILD_NAME
}

export const questionMessages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  BIRTH_TOWN: {
    id: 'register.userSetup.securityQuestions.BIRTH_TOWN',
    defaultMessage: 'What city were you born in?',
    description: 'The description for BIRTH_TOWN key'
  },
  HIGH_SCHOOL: {
    id: 'register.userSetup.securityQuestions.HIGH_SCHOOL',
    defaultMessage: 'What is the name of your high school?',
    description: 'The description for HIGH_SCHOOL key'
  },
  MOTHER_NAME: {
    id: 'register.userSetup.securityQuestions.MOTHER_NAME',
    defaultMessage: "What is your mother's name?",
    description: 'The description for MOTHER_NAME key'
  },
  FAVORITE_TEACHER: {
    id: 'register.userSetup.securityQuestions.FAVORITE_TEACHER',
    defaultMessage: 'What is the name of your favorite school teacher?',
    description: 'The description for FAVORITE_TEACHER key'
  },
  FAVORITE_MOVIE: {
    id: 'register.userSetup.securityQuestions.FAVORITE_MOVIE',
    defaultMessage: 'What is your favorite movie?',
    description: 'The description for FAVORITE_MOVIE key'
  },
  FAVORITE_SONG: {
    id: 'register.userSetup.securityQuestions.FAVORITE_SONG',
    defaultMessage: 'What is your favorite song?',
    description: 'The description for FAVORITE_SONG key'
  },
  FAVORITE_FOOD: {
    id: 'register.userSetup.securityQuestions.FAVORITE_FOOD',
    defaultMessage: 'What is your favorite food?',
    description: 'The description for FAVORITE_FOOD key'
  },
  FIRST_CHILD_NAME: {
    id: 'register.userSetup.securityQuestions.FIRST_CHILD_NAME',
    defaultMessage: "What is your first child's name?",
    description: 'The description for FIRST_CHILD_NAME key'
  }
})
