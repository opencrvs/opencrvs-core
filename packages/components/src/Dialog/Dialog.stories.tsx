/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import React, { useState } from 'react'
import { ComponentStory, Meta } from '@storybook/react'
import { Dialog } from './Dialog'
import { Button } from '../Button'
import { Text } from '../Text'

export default {
  title: 'Layout/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component: `
\`<Dialog>\` is a modal component which requests an action from a user.
`
      }
    }
  }
} as Meta

const Template: ComponentStory<typeof Dialog> = ({ children, ...args }) => {
  const [isOpen, setIsVisible] = useState(false)

  return (
    <>
      <Button type="primary" onClick={() => setIsVisible(true)}>
        Open
      </Button>

      <Dialog {...args} isOpen={isOpen} onClose={() => setIsVisible(false)}>
        <p>{children}</p>
      </Dialog>
    </>
  )
}

export const SmallDialog = Template.bind({})
SmallDialog.args = {
  title: 'Small dialog',
  children: (
    <Text variant="reg16" element="p">
      This is a small dialog
    </Text>
  ),
  actions: [
    <Button
      key="cancel"
      type="tertiary"
      onClick={() => console.log('Cancelled!')}
    >
      Cancel
    </Button>,
    <Button key="ok" type="primary" onClick={() => console.log('OK!')}>
      Confirm
    </Button>
  ]
}

export const SmallDialogNoButtons = Template.bind({})
SmallDialogNoButtons.args = {
  title: 'Small dialog',
  children: (
    <Text variant="reg16" element="p">
      This is a small dialog
    </Text>
  )
}

export const LargeDialog = Template.bind({})
LargeDialog.args = {
  title: 'Large dialog',
  children: (
    <Text variant="reg16" element="p">
      This is a large dialog
    </Text>
  ),
  variant: 'large',
  actions: [
    <Button
      key="cancel"
      type="tertiary"
      onClick={() => console.log('Cancelled!')}
    >
      Cancel
    </Button>,
    <Button key="ok" type="primary" onClick={() => console.log('OK!')}>
      Confirm
    </Button>
  ]
}

export const SmallDialogWithOverflow = Template.bind({})
SmallDialogWithOverflow.args = {
  title: 'A small dialog with the content overflowing',
  children: (
    <>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
    </>
  ),
  variant: 'small',
  actions: [
    <Button
      key="cancel"
      type="tertiary"
      onClick={() => console.log('Cancelled!')}
    >
      Cancel
    </Button>,
    <Button key="ok" type="primary" onClick={() => console.log('OK!')}>
      Confirm
    </Button>
  ]
}

export const LargeDialogWithOverflow = Template.bind({})
LargeDialogWithOverflow.args = {
  title: 'A large dialog with the content overflowing',
  children: (
    <>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
      <Text element="p" variant="reg16">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consectetur ullamcorper tincidunt. Curabitur ultrices, quam et laoreet
        bibendum, elit risus tincidunt dui, a scelerisque est leo ac sem. Sed
        commodo, sapien sit amet vulputate semper, magna quam pulvinar eros,
        quis bibendum risus massa non est. Fusce in dignissim magna, ac molestie
        nibh. Fusce eget maximus elit. Suspendisse lobortis est nec malesuada
        fermentum. Nullam vulputate ligula quam, sed faucibus eros laoreet a.
        Etiam non ipsum non est ultrices efficitur.
      </Text>
    </>
  ),
  variant: 'large',
  actions: [
    <Button
      key="cancel"
      type="tertiary"
      onClick={() => console.log('Cancelled!')}
    >
      Cancel
    </Button>,
    <Button key="ok" type="primary" onClick={() => console.log('OK!')}>
      Confirm
    </Button>
  ]
}
