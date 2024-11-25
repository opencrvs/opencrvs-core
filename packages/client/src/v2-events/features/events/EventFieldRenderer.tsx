import React, { useEffect, useState } from 'react'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Field } from '@opencrvs/commons/events'
import { FormField } from './FormField'
;(window as any).LEGACY_FORM = false

const mapV2FieldsToLegacyFields = (fields: Field[]) => {
  return fields.map((field) => ({
    ...field,
    name: field.id,
    validator: []
  }))
}

export const EventFieldRenderer = ({ fields }: { fields: Field[] }) => {
  const [isLegacyForm, setIsLegacyForm] = useState(false)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if ((window as any).LEGACY_FORM !== isLegacyForm) {
        setIsLegacyForm((window as any).LEGACY_FORM)
      }
    }, 100)

    return () => clearInterval(intervalId)
  }, [isLegacyForm])

  if (isLegacyForm) {
    return (
      <FormFieldGenerator
        id={'asdf'}
        fields={mapV2FieldsToLegacyFields(fields)}
        setAllFieldsDirty={false}
        onChange={(values) => console.log(values)}
        draftData={{}}
      />
    )
  } else {
    return (
      <>
        {fields.map((field) => (
          <FormField key={field.id} type={field.type} />
        ))}
      </>
    )
  }
}
