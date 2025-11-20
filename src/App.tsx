import Maps from './components/Maps'

const App = () => {
    return (
      <div className="w-screen h-screen flex flex-col">
        <header className="bg-[#4E2A84] text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">ICE Spy</h1>
          </div>
        </header>
        <div className="flex-1">
          <Maps className="w-full h-full" />
        </div>
      </div>
    )
}

export default App
