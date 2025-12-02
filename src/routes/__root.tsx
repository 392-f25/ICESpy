import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Header from '../components/Header'

export const Route = createRootRoute({
  component: () => (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </div>
  ),
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center text-6xl">
     I looked for that page, I really did! 😭
    </div>
  )
});