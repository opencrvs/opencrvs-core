import {
  createDeclaration,
  IDeclaration,
  storeDeclaration
} from '@client/declarations'
import { IFormData, ISerializedFormSection } from '@client/forms'
import { deserializeForm } from '@client/forms/deserializer/deserializer'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { getValidators } from '@client/forms/validators'
import { formatUrl } from '@client/navigation'
import { FORM } from '@client/navigation/routes'
import { IStoreState } from '@client/store'
import { Event, EventSearchSet } from '@client/utils/gateway'
import { push } from 'connected-react-router'
import { useCallback } from 'react'
import { MessageDescriptor, useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'

export type FormSection = ISerializedFormSection

export type Form = {
  id: string
  label: MessageDescriptor
  record: {
    title: MessageDescriptor
    workQueueItemTitle: MessageDescriptor
  }
  enabled: boolean
  sections: FormSection[]
}

function flattenObject(
  obj: Record<string, any>,
  parentKey = '',
  result: Record<string, any> = {}
): Record<string, any> {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}_${key}` : key
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], newKey, result)
      } else {
        result[newKey] = obj[key]
      }
    }
  }
  return result
}

export function isLegacyFormType(event: Event | string) {
  return [Event.Birth, Event.Death, Event.Marriage].includes(event as Event)
}

export function useForms() {
  const dispatch = useDispatch()
  const intl = useIntl()
  const legacyForms = useSelector((state: IStoreState) =>
    getRegisterForm(state)
  )
  const forms = useSelector<IStoreState, Form[]>(getFormsFromState)

  const goToNewForm = useCallback(
    (event: Event) => {
      const declaration = createDeclaration(event)
      dispatch(storeDeclaration(declaration))
      dispatch(
        push(
          formatUrl(FORM, {
            declarationId: declaration.id,
            event: event
          })
        )
      )
    },
    [dispatch]
  )

  const getForm = useCallback(
    (id: string): Form => {
      if (isLegacyFormType(id)) {
        return legacyForms[id as Event] as Form
      }
      const form = forms.find((form) => form.id === id)!
      if (!form) {
        throw new Error(`Form with id ${id} not found`)
      }
      return deserializeForm(form, getValidators()) as Form
    },
    [forms, legacyForms]
  )

  const getFormLabel = useCallback(
    (event: string) => {
      const form = getForm(event)
      return intl.formatMessage(form.label)
    },
    [getForm, intl]
  )
  const getRecordTitle = useCallback(
    (event: string, draft: IDeclaration) => {
      const form = getForm(event)
      return intl.formatMessage(form.record.title, flattenObject(draft.data))
    },
    [getForm, intl]
  )
  const getRecordSearchLabel = useCallback(
    (event: string, indexRecord: EventSearchSet) => {
      const form = getForm(event)
      return intl.formatMessage(
        form.record.workQueueItemTitle,
        flattenObject(indexRecord)
      )
    },
    [getForm, intl]
  )

  return {
    forms,
    getForm,
    goToNewForm,
    getFormLabel,
    getRecordTitle,
    getRecordSearchLabel
  }
}

function getFormsFromState(state: IStoreState): Form[] {
  const { version, ...forms } = state.offline.offlineData.forms!

  return Object.entries(forms).map(([id, form]) => ({
    id,
    enabled: true,
    record: {
      title: (form as any).record?.title || {
        id: 'todo.todo',
        defaultMessage: 'Custom title'
      },
      workQueueItemTitle: (form as any).record?.workQueueItemTitle || {
        id: 'todo.todo',
        defaultMessage: 'Custom title'
      }
    },
    label: form.label || {
      id: 'todo.todo',
      defaultMessage: 'Custom section'
    },
    sections: form.sections.filter(({ viewType }) =>
      ['form', 'hidden', 'preview'].includes(viewType)
    )
  }))
}

export function getFormFromState(event: string, state: IStoreState): Form {
  const forms = getFormsFromState(state)
  return forms.find((form) => form.id === event)!
}

export function formDataToFieldData(data: IFormData, form: Form) {
  /*
   * Just a dev time verification to ensure the assumption of the form structures matching is correct
   * @todo remove after testing
   */
  const verifyFieldExists = (sectionId: string, fieldId: string) => {
    const section = form.sections.find((section) => section.id === sectionId)
    if (!section) {
      throw new Error(`Section ${sectionId} not found in form ${form.id}`)
    }
    if (
      !section.groups
        .map(({ fields }) => fields)
        .flat()
        .find((field) => field.name === fieldId)
    ) {
      throw new Error(
        `Field ${fieldId} not found in section ${sectionId} of form ${form.id}`
      )
    }
  }

  return Object.entries(data).flatMap(([sectionId, sectionData]) => {
    return Object.entries(sectionData).map(([fieldId, value]) => {
      verifyFieldExists(sectionId, fieldId)
      return {
        id: `${sectionId}.${fieldId}`,
        value
      }
    })
  })
}
