import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('./Appbar'), {
  ssr: false
})

export default function DynamicAppBar() {
  return <DynamicComponent />
}
