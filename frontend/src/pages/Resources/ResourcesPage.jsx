/**
 * ================================================================
 * ResourcesPage.jsx - Facilities & Resources Module
 * ================================================================
 * Owner: Member 3 - Facilities & Resources
 *
 * TODO Member 3:
 *  1. Fetch resources from GET /api/resources
 *  2. Implement filter by type (ROOM, LAB, EQUIPMENT)
 *  3. Implement availability toggle filter
 *  4. Add "Add Resource" modal/form for ADMIN users
 *  5. Add "Edit" and "Delete" actions per resource card
 *  6. Add search by name / location
 *  7. Show capacity, location, and availability badge on each card
 * ================================================================
 */
import { useEffect } from 'react'
import { MdAdd, MdSearch, MdMeetingRoom, MdFilterList } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { resourceService } from '../../services/resourceService'
import './ResourcesPage.css'

const ResourcesPage = () => {
  const { isAdmin } = useAuth()
  const { data: resources, loading, error, execute: fetchResources } = useApi(resourceService.getAll)

  // TODO: Member 3 - Add filter state
  // const [typeFilter, setTypeFilter] = useState('ALL')
  // const [availableOnly, setAvailableOnly] = useState(false)
  // const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchResources()
  }, [])

  return (
    <div className="resources-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Facilities & Resources</h2>
          <p className="page-subtitle">Browse and manage all campus facilities</p>
        </div>
        {/* TODO: Member 3 - Show only for ADMIN role */}
        {isAdmin && (
          <button className="btn btn-primary" id="add-resource-btn">
            <MdAdd /> Add Resource
          </button>
        )}
      </div>

      {/* Filters & Search Bar */}
      {/* TODO: Member 3 - Implement these filters */}
      <div className="resources-toolbar card">
        <div className="input-icon-wrapper" style={{ flex: 1 }}>
          <MdSearch className="input-icon" />
          <input
            id="resource-search"
            className="form-control input-with-icon"
            placeholder="Search resources by name or location..."
            // TODO: Member 3 - onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="resources-filters">
          {/* TODO: Member 3 - Wire up type filter */}
          <select id="resource-type-filter" className="form-control" style={{ width: 'auto' }}>
            <option value="ALL">All Types</option>
            <option value="ROOM">Rooms</option>
            <option value="LAB">Labs</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          <label className="resources-avail-toggle">
            <input type="checkbox" id="available-only-toggle" />
            <span>Available Only</span>
          </label>
        </div>
      </div>

      {/* Error State */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* Resource Grid */}
      {/* TODO: Member 3 - Replace placeholder cards with real data */}
      {!loading && !resources?.length && (
        <div className="empty-state card">
          <MdMeetingRoom style={{ fontSize: '3rem' }} />
          <h3>No resources found</h3>
          <p>Resources added by the admin will appear here.</p>
          {/* TODO: Member 3 - Show "Add Resource" CTA for admin */}
        </div>
      )}

      {!loading && resources && (
        <div className="resources-grid">
          {resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Resource Card Component ----
// TODO: Member 3 - Move to components/ResourceCard/ folder if it grows large
const ResourceCard = ({ resource, isAdmin }) => {
  return (
    <div className="resource-card card">
      <div className="resource-card-header">
        <div className="resource-type-badge">{resource.type || 'RESOURCE'}</div>
        <span className={`badge ${resource.isAvailable ? 'badge-success' : 'badge-danger'}`}>
          {resource.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <h3 className="resource-name">{resource.name}</h3>
      <p className="resource-location">📍 {resource.location || 'Location not set'}</p>
      <p className="resource-capacity">👥 Capacity: {resource.capacity || '—'}</p>
      {resource.description && (
        <p className="resource-description">{resource.description}</p>
      )}
      <div className="resource-actions">
        <button className="btn btn-primary btn-sm" id={`book-resource-${resource.id}`}>
          Book Now
        </button>
        {/* TODO: Member 3 - Show edit/delete only for admin */}
        {isAdmin && (
          <>
            <button className="btn btn-secondary btn-sm" id={`edit-resource-${resource.id}`}>Edit</button>
            <button className="btn btn-danger btn-sm" id={`delete-resource-${resource.id}`}>Delete</button>
          </>
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
