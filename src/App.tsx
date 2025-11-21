import Maps from './components/Maps'
import AuthButton from './components/AuthButton'
import UserDebugInfo from './components/UserDebugInfo'

const App = () => {
    return (
      <div className="w-screen h-screen flex flex-col">
        <header className="bg-[#4E2A84] text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">ICE Spy</h1>
            <AuthButton />
          </div>
        </header>
        <div className="flex-1">
          <Maps className="w-full h-full" />
        </div>
        <UserDebugInfo />
      </div>
    )
}

export default App
