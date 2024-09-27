import { useForms } from '@client/hooks/useForms'
import { Event } from '@client/utils/gateway'
import { getRegisterForm } from '@opencrvs/client/src/forms/register/declaration-selectors'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  DRAFT_DEATH_FORM_PAGE_GROUP,
  DRAFT_MARRIAGE_FORM_PAGE_GROUP,
  FORM_PAGE_GROUP,
  HOME
} from '@opencrvs/client/src/navigation/routes'
import { IStoreState } from '@opencrvs/client/src/store'
import { RegisterForm } from '@opencrvs/client/src/views/RegisterForm/RegisterForm'
import * as React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'

const pageRoute: { [key in Event]: string } = {
  birth: DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP,
  death: DRAFT_DEATH_FORM_PAGE_GROUP,
  marriage: DRAFT_MARRIAGE_FORM_PAGE_GROUP
}

const DeclarationFormView: React.FC = () => {
  const { getForm } = useForms()
  const { declarationId } = useParams<{ declarationId: string }>()

  const declaration = useSelector((state: IStoreState) =>
    state.declarationsState.declarations.find(({ id }) => id === declarationId)
  )

  const event = declaration?.event || Event.Birth
  console.log(declaration)

  const registerForm = getForm(event)

  const currentPageRoute = pageRoute[event] || FORM_PAGE_GROUP

  if (!declaration) {
    return <Redirect to={HOME} />
  }

  return (
    <RegisterForm
      declaration={declaration}
      registerForm={registerForm}
      pageRoute={currentPageRoute}
    />
  )
}

export const DeclarationForm = DeclarationFormView
