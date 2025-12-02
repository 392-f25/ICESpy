import { Link } from '@tanstack/react-router'
import AuthButton from './AuthButton'

const Header = () => {
  return (
    <header className="bg-[#4E2A84] text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold">Prairie Dog</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="hover:underline [&.active]:font-bold">
              Home
            </Link>
            <span>|</span>
            <Link to="/resources" className="hover:underline [&.active]:font-bold">
              Resources
            </Link>
          </nav>
        </div>
        <AuthButton />
      </div>
    </header>
  )
}

export default Header
