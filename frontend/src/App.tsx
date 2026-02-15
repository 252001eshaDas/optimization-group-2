import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from "react";
import './App.css'
import SimplexSolver from './pages/SimplesSolver'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <SimplexSolver/>
      </div>
    </>
  )
}

export default App
