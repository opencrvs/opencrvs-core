import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./Modal'), {
  ssr: false
})

export default function DynamicModal(props: {
  title: string
  show: boolean
  closeModal: () => void
}) {
  return (
    <DynamicComponent
      title={props.title}
      show={props.show}
      closeModal={props.closeModal}
    />
  )
}
