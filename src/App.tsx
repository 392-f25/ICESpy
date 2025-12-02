import Maps from './components/Maps'
import UserDebugInfo from './components/UserDebugInfo'

const App = () => {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1">
          <Maps className="w-full h-full" />
        </div>
        <UserDebugInfo />
      </div>
    )
}

export default App
