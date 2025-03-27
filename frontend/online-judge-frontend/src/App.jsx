import React from "react"
import Footer from "./Components/Footer"
import Navbar from "./Components/Navbar"
import Table from "./Components/Table"

function App() {
  const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  return (
    <>
      <Navbar />
      <Table heading="folks" items={items} />
      <Footer />
    </>
  )
}

export default App
