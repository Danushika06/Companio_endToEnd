import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components'
import { Feature2Page } from './pages'
import SubFeaturePage from './pages/SubFeaturePage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/feature2" replace />} />
          <Route path="/feature2" element={<Feature2Page />} />
          <Route path="/feature2/:subFeatureId" element={<SubFeaturePage />} />
          <Route path="*" element={<Navigate to="/feature2" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
