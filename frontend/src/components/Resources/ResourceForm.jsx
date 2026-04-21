/**
 * ================================================================
 * ResourceForm.jsx — Create / Edit Modal Form (ADMIN only)
 * ================================================================
 * A modal dialog rendered on top of ResourcesPage.
 *
 * Modes:
 *   Create  → resource prop is null  → POST /api/resources
 *   Edit    → resource prop has data → PUT  /api/resources/{id}
 *
 * Props:
 *   resource  {Object|null}   resource to edit, or null for create
 *   onClose   {Function}      close the modal without saving
 *   onSaved   {Function}      called after successful save (refreshes list)
 *
 * VALIDATION:
 *   - name:     required, not blank
 *   - type:     required, must select a value
 *   - capacity: required, must be > 0
 *   Client-side errors are shown inline below each field.
 *   Server-side validation errors (422) are shown in a banner.
 *
 * ROLE:
 *   This form is only rendered if isAdmin === true (checked in
 *   ResourcesPage). The component itself does not enforce role.
 * ================================================================
 */
import { useState, useEffect } from 'react'
import { MdClose, MdSave, MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import { resourceService } from '../../services/resourceService'

const TYPES    = ['ROOM', 'LAB', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

// Default empty state for the form
const EMPTY_FORM = {
  name: '',
  type: '',
  description: '',
  location: '',
  capacity: '',
  status: 'ACTIVE',
  isAvailable: true,
  availabilityStart: '',
  availabilityEnd: '',
}

const ResourceForm = ({ resource, onClose, onSaved }) => {
  const isEdit = !!resource
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState(null)
  const [saving, setSaving]     = useState(false)

  // Pre-fill form when editing an existing resource
  useEffect(() => {
    if (resource) {
      // Parse the stored "start to end" string if it exists
      let start = ''
      let end = ''
      if (resource.availabilityWindows && resource.availabilityWindows.length > 0) {
        const parts = resource.availabilityWindows[0].split(' to ')
        if (parts.length === 2) {
          start = parts[0]
          end = parts[1]
        }
      }

      setForm({
        name:                resource.name        || '',
        type:                resource.type        || '',
        description:         resource.description || '',
        location:            resource.location    || '',
        capacity:            resource.capacity    || '',
        status:              resource.status      || 'ACTIVE',
        isAvailable:         resource.isAvailable ?? true,
        availabilityStart:   start,
        availabilityEnd:     end,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
    setApiError(null)
  }, [resource])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Clear field-level error as user types
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  // ── Client-side validation ────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name     = 'Resource name is required.'
    if (!form.type)                 e.type     = 'Please select a resource type.'
    if (!form.capacity || Number(form.capacity) <= 0)
                                    e.capacity = 'Capacity must be a positive number.'
    if ((form.availabilityStart && !form.availabilityEnd) || (!form.availabilityStart && form.availabilityEnd)) {
      e.availability = 'Both start and end times must be selected.'
    }
    if (form.availabilityStart && form.availabilityEnd && new Date(form.availabilityStart) >= new Date(form.availabilityEnd)) {
      e.availability = 'End time must be after start time.'
    }
    return e
  }

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    // Build payload — combine start and end into a single string inside availabilityWindows list
    const availabilityWindowsArr = []
    if (form.availabilityStart && form.availabilityEnd) {
      availabilityWindowsArr.push(`${form.availabilityStart} to ${form.availabilityEnd}`)
    }

    const payload = {
      name:     form.name.trim(),
      type:     form.type,
      capacity: Number(form.capacity),
      status:   form.status,
      isAvailable: form.isAvailable,
      ...(form.description.trim() && { description: form.description.trim() }),
      ...(form.location.trim()    && { location:    form.location.trim() }),
      ...(availabilityWindowsArr.length > 0 && { availabilityWindows: availabilityWindowsArr }),
    }

    try {
      setSaving(true)
      if (isEdit) {
        await resourceService.updateResource(resource.id, payload)
        toast.success('Resource updated successfully!')
      } else {
        await resourceService.createResource(payload)
        toast.success('Resource created successfully!')
      }
      onSaved()
      onClose()
    } catch (err) {
      // Handle 422 validation errors from backend
      const msg =
        err?.message ||
        (Array.isArray(err?.errors) ? err.errors.join(', ') : null) ||
        'Failed to save resource. Please try again.'
      setApiError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    // ── Modal Backdrop ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal Box */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEdit ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              {isEdit ? `Updating: ${resource.name}` : 'Fill in the resource details below'}
            </p>
          </div>
          <button
            id="close-resource-form"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠ {apiError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Resource Name <span className="text-red-500">*</span>
            </label>
            <input
              id="form-resource-name"
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="e.g. Computer Lab B-201"
              className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.name ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Type & Capacity — 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="form-resource-type"
                value={form.type}
                onChange={e => handleChange('type', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.type ? 'border-red-400' : 'border-slate-200'}`}
              >
                <option value="">Select type…</option>
                {TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                id="form-resource-capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={e => handleChange('capacity', e.target.value)}
                placeholder="e.g. 40"
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.capacity ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
            <input
              id="form-resource-location"
              type="text"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="e.g. Block B, Floor 2"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Status & isAvailable — 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                id="form-resource-status"
                value={form.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s === 'OUT_OF_SERVICE' ? 'Out of Service' : 'Active'}
                  </option>
                ))}
              </select>
            </div>

            {/* isAvailable toggle */}
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Available for booking</label>
              <button
                type="button"
                id="form-resource-available-toggle"
                onClick={() => handleChange('isAvailable', !form.isAvailable)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isAvailable ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          {/* Availability Start & End — 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Availability Start</label>
              <input
                id="form-resource-start"
                type="datetime-local"
                value={form.availabilityStart}
                onChange={e => handleChange('availabilityStart', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.availability ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Availability End</label>
              <input
                id="form-resource-end"
                type="datetime-local"
                value={form.availabilityEnd}
                onChange={e => handleChange('availabilityEnd', e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.availability ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'}`}
              />
            </div>
          </div>
          {errors.availability && <p className="text-xs text-red-500 mt-1">{errors.availability}</p>}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea
              id="form-resource-description"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Optional notes about this resource…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            id="cancel-resource-form"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            id="submit-resource-form"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 transition-all"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isEdit ? (
              <MdSave className="text-base" />
            ) : (
              <MdAdd className="text-base" />
            )}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResourceForm
