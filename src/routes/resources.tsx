import { StrictMode } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import Resources from '../components/Resources'

export const Route = createFileRoute('/resources' as any)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <StrictMode>
      <Resources />
    </StrictMode>
  )
}
