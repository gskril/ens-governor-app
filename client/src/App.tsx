import { Route, Routes } from 'react-router-dom'
import { Home } from './screens/Home'
import { Proposal } from './screens/Proposal'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/proposal/:id" element={<Proposal />} />
    </Routes>
  )
}

export default App
