import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './SubFeaturePage.css'
import { PokemonGrid } from '../components/PokemonCollection/PokemonGrid'
import GoalDashboard from '../components/GoalDashboard/GoalDashboard'

const SubFeaturePage: React.FC = () => {
  const { subFeatureId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Get feature from current path
  const featureId = location.pathname.split('/')[1]

  const handleBack = () => {
    navigate(`/${featureId}`)
  }

  // Convert sub-feature-1 to Sub Feature 1
  const subFeatureTitle = subFeatureId
    ?.split('-')
    .map((word, index) => 
      index === 0 || index === 1 
        ? word.charAt(0).toUpperCase() + word.slice(1) 
        : word
    )
    .join(' ')

  const featureTitle = featureId
    ?.split(/(\d+)/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .trim()

  // Render specific sub-feature content based on subFeatureId
  const renderSubFeatureContent = () => {
    switch (subFeatureId) {
      case 'goals-dashboard':
        // Feature 2 → Goals Dashboard: Progress Tracking & Visualization
        return <GoalDashboard />
      
      case 'card-collection':
        // Feature 2 → Card Collection: Gamified Card Collection
        return <PokemonGrid />
      
      default:
        // Default placeholder for other sub-features
        return (
          <div className="sub-feature-page">
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={20} />
              <span>Back to {featureTitle}</span>
            </button>

            <div className="sub-feature-content">
              <div className="sub-feature-header">
                <h1 className="sub-feature-title">{subFeatureTitle}</h1>
                <p className="sub-feature-breadcrumb">
                  {featureTitle} / {subFeatureTitle}
                </p>
              </div>

              <div className="sub-feature-body">
                <div className="placeholder-message">
                  <h2>Update the {subFeatureTitle} work here</h2>
                  <p>This is where you can add specific functionality for {subFeatureTitle}.</p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return <>{renderSubFeatureContent()}</>
}

export default SubFeaturePage
