import React from 'react'
import { Toaster as ReactHotToaster, ToastBar, toast } from 'react-hot-toast'
import { Button } from '@opencrvs/components/lib/buttons'
import { Icon } from '@opencrvs/components/lib/Icon'

export function Toaster() {
  return (
    <ReactHotToaster position="bottom-center" toastOptions={{ duration: 6000 }}>
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <Button onClick={() => toast.dismiss(t.id)}>
                  <Icon color="primary" name="Close" size="large" />
                </Button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </ReactHotToaster>
  )
}
