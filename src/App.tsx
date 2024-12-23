import { useState } from 'react'
import './App.css'
import Target from './components/Target'
import Score from './components/Score'

function App() {
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <Score score={score} missed={missed} />
      <Target 
        onHit={() => setScore(prev => prev + 1)}
        onMiss={() => setMissed(prev => prev + 1)}
      />
    </div>
  )
}

export default App
