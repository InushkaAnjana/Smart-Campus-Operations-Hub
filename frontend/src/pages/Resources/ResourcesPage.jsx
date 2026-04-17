/**
 * ================================================================
 * ResourcesPage.jsx — Facilities & Assets Main Page
 * ================================================================
 * Owner: Member 3 - Facilities & Resources Module
 * Route: /resources
 *
 * ARCHITECTURE:
 *   This page is the single source of truth for:
 *     - resource list (fetched from backend via resourceService)
 *     - filter state (type, capacity, location, status)
 *     - modal state (open/close, which resource is being edited)
 *     - delete confirmation state
 *
 * ROLE-BASED UI:
 *   - isAdmin  → shows "Add Resource" button + ResourceForm modal
 *               + Edit/Delete buttons in ResourceTable
 *   - USER     → read-only view of resources and filters
 *
 * FILTERING FLOW:
 *   1. User changes filter controls in ResourceFilters → updates `filters` state
 *   2. User clicks "Apply Filters" → handleApplyFilters() is called
 *   3. handleApplyFilters() calls resourceService.getResources(filters)
 *      with the current filter object → returns matching resources from backend
 *   4. ResourceTable re-renders with the filtered results
 *   5. "Reset" clears filters and re-fetches the full list
 *
 * STATS BAR:
 *   Shows aggregate counts (Total / Active / Out Of Service / Available)
 *   computed from the current filtered result for quick reference.
 * ================================================================
 */
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  MdAdd, MdMeetingRoom, MdCheckCircle,
  MdCancel, MdCalendarToday, MdRefresh
} from 'react-icons/md'

import { useAuth } from '../../context/AuthContext'
import { resourceService } from '../../services/resourceService'

import ResourceFilters from '../../components/Resources/ResourceFilters'
import ResourceTable   from '../../components/Resources/ResourceTable'
import ResourceForm    from '../../components/Resources/ResourceForm'

// ── Default empty filter state ────────────────────────────────────
const EMPTY_FILTERS = { type: '', capacity: '', location: '', status: '' }

// ── Stat tile component ───────────────────────────────────────────
const StatTile = ({ icon: Icon, label, value, accent }) => (
  <div className={`flex items-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4`}>
    <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-xl ${accent}`}>
      <Icon />
    </div>
    <div>
      <div className="text-2xl font-extrabold text-slate-800 leading-none">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  </div>
)

// ── Delete Confirmation Modal ─────────────────────────────────────
const DeleteConfirmModal = ({ resourceName, onConfirm, onCancel, deleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
  >
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl slide-up p-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 text-3xl mx-auto mb-4">
        <MdCancel />
      </div>
      <h3 className="text-base font-bold text-slate-800 text-center">Delete Resource?</h3>
      <p className="text-sm text-slate-500 text-center mt-2">
        Are you sure you want to permanently delete <br />
        <span className="font-semibold text-slate-700">"{resourceName}"</span>?
        <br />This action cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          id="cancel-delete-btn"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          id="confirm-delete-btn"
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
        >
          {deleting
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <MdCancel className="text-base" />
          }
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════
const ResourcesPage = () => {
  const { isAdmin } = useAuth()

  // ── State ────────────────────────────────────────────────────────
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [filters, setFilters]     = useState(EMPTY_FILTERS)

  // Modal for create/edit
  const [formOpen, setFormOpen]         = useState(false)
  const [editingResource, setEditingResource] = useState(null) // null = create, object = edit

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }
  const [deleting, setDeleting]         = useState(false)

  // ── Data fetching ─────────────────────────────────────────────────
  /**
   * Fetches resources from the backend.
   * @param {Object} activeFilters  filter params to include in the request
   *
   * FILTERING LOGIC:
   *   resourceService.getResources(activeFilters) strips null/empty values
   *   and builds a query string. The backend handles the filtering at the
   *   MongoDB layer (not in JS) for performance.
   */
  const fetchResources = useCallback(async (activeFilters = {}) => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await resourceService.getResources(activeFilters)
      setResources(data)
    } catch (err) {
      const msg = err?.message || 'Failed to load resources.'
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount with no filters
  useEffect(() => { fetchResources() }, [fetchResources])

  // ── Filter handlers ───────────────────────────────────────────────
  const handleApplyFilters = () => {
    // Triggered when user clicks "Apply Filters" in ResourceFilters
    fetchResources(filters)
  }

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS)
    fetchResources({}) // re-fetch with no filters
  }

  // ── CRUD handlers ─────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingResource(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (resource) => {
    setEditingResource(resource)
    setFormOpen(true)
  }

  const handleFormSaved = () => {
    // Refresh after successful create/update (keep current filters)
    fetchResources(filters)
  }

  const handleDeleteRequest = (id, name) => {
    // Show confirmation modal
    setDeleteTarget({ id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await resourceService.deleteResource(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted successfully.`)
      setDeleteTarget(null)
      fetchResources(filters)
    } catch {
      toast.error('Failed to delete resource. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────
  const stats = {
    total:        resources.length,
    active:       resources.filter(r => r.status === 'ACTIVE').length,
    outOfService: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
    available:    resources.filter(r => r.isAvailable).length,
  }

  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 fade-in">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Facilities &amp; Resources</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse, search and manage all campus facilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            id="refresh-resources-btn"
            onClick={() => fetchResources(filters)}
            title="Refresh"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
          >
            <MdRefresh className="text-xl" />
          </button>
          {/* ADMIN: Add Resource button */}
          {isAdmin && (
            <button
              id="add-resource-btn"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
            >
              <MdAdd className="text-xl" /> Add Resource
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={MdMeetingRoom}   label="Total Resources"   value={stats.total}        accent="bg-indigo-50 text-indigo-600" />
        <StatTile icon={MdCheckCircle}   label="Active"            value={stats.active}       accent="bg-emerald-50 text-emerald-600" />
        <StatTile icon={MdCancel}        label="Out of Service"    value={stats.outOfService} accent="bg-red-50 text-red-500" />
        <StatTile icon={MdCalendarToday} label="Available to Book" value={stats.available}    accent="bg-amber-50 text-amber-600" />
      </div>

      {/* ── Filters Panel ──────────────────────────────────────── */}
      <ResourceFilters
        filters={filters}
        onChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* ── Fetch Error ────────────────────────────────────────── */}
      {fetchError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠ {fetchError}
        </div>
      )}

      {/* ── Resource Table ─────────────────────────────────────── */}
      <ResourceTable
        resources={resources}
        isAdmin={isAdmin}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
      />

      {/* ── Create / Edit Form Modal ───────────────────────────── */}
      {formOpen && (
        <ResourceForm
          resource={editingResource}
          onClose={() => setFormOpen(false)}
          onSaved={handleFormSaved}
        />
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          resourceName={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}

export default ResourcesPage
