import { useState } from 'react'
// components 
import { MeetingSchedulerCalendar } from './components/DateCalender'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MeetingSchedulerCalendar/>
    </>
  )
}

export default App
