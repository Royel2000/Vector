import './App.css'
import Navbar from './components/Navbar.tsx'

import GraphingCalculator from './GraphingCalculator.tsx'

function App() {

  return (
    <>
      <div className='dark:bg-zinc-950'>
        <Navbar/>
        <div>
          <GraphingCalculator/>
        </div>
      </div>
    </>
  )
}

export default App
