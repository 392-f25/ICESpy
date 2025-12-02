import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-4">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' | '}
        <Link to="/resources" className="[&.active]:font-bold">
          Resources
        </Link>{' | '}
      </div>
      <hr className="my-4" />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center text-6xl">
     I looked for that page, I really did! 😭
    </div>
  )
});