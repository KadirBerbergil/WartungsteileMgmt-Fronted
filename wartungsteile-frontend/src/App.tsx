import './App.css'
import Layout from './components/layout/Layout'

function App() {
  return (
    <Layout>
      <div className="p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Wartungsteile-Management-System</h1>
        <p className="text-gray-600 mb-4">
          Willkommen im System zur Verwaltung von Wartungsteilen für CNC-Lademagazine.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Dashboard erkunden
        </button>
      </div>
    </Layout>
  )
}

export default App