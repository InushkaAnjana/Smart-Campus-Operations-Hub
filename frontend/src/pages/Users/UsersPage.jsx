/**
 * UsersPage.jsx - Admin User Management
 * Displays all registered users categorized by role in a premium UI.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { 
  MdPerson, 
  MdAdminPanelSettings, 
  MdEngineering, 
  MdDelete,
  MdRefresh,
  MdSearch,
  MdErrorOutline
} from 'react-icons/md'

const UsersPage = () => {
  const { isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.warning('Access denied: Admins only')
      navigate('/dashboard')
    }
  }, [isAdmin, authLoading, navigate])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await authService.getAllUsers()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      // axiosConfig returns error.response.data if available, otherwise the error object
      const errorMsg = err.message || err.error || (typeof err === 'string' ? err : 'Unknown error')
      toast.error('Failed to load users: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return
    
    try {
      await authService.deleteUser(id)
      toast.success('User deleted successfully')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      console.error('Error deleting user:', err)
      const errorMsg = err.message || err.error || (typeof err === 'string' ? err : 'Unknown error')
      toast.error('Failed to delete user: ' + errorMsg)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const admins = filteredUsers.filter(u => u.role === 'ADMIN')
  const technicians = filteredUsers.filter(u => u.role === 'TECHNICIAN')
  const regularUsers = filteredUsers.filter(u => u.role === 'USER')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const UserCard = ({ user }) => (
    <div className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-md ${
        user.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
        user.role === 'TECHNICIAN' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
        'bg-gradient-to-br from-slate-400 to-slate-600'
      }`}>
        {user.role === 'ADMIN' ? <MdAdminPanelSettings className="text-2xl" /> :
         user.role === 'TECHNICIAN' ? <MdEngineering className="text-2xl" /> :
         <MdPerson className="text-2xl" />}
      </div>
      
      <div className="flex flex-col min-w-0 flex-1">
        <h4 className="font-bold text-slate-800 truncate">{user.name}</h4>
        <p className="text-sm text-slate-500 truncate">{user.email}</p>
      </div>

      <button 
        onClick={() => handleDeleteUser(user.id, user.name)}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
        title="Delete User"
      >
        <MdDelete className="text-xl" />
      </button>
    </div>
  )

  const UserSection = ({ title, icon: Icon, users, colorClass }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`text-xl ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
          {users.length}
        </span>
      </div>
      
      {users.length === 0 ? (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
          No {title.toLowerCase()} found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => <UserCard key={u.id} user={u} />)}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Users</h1>
          <p className="text-slate-500">Manage all registered accounts across the campus</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-64 transition-all"
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
            title="Refresh List"
          >
            <MdRefresh className={`text-2xl ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Section */}
      <UserSection 
        title="Administrators" 
        icon={MdAdminPanelSettings} 
        users={admins} 
        colorClass="bg-indigo-600"
      />

      {/* Technician Section */}
      <UserSection 
        title="Technicians" 
        icon={MdEngineering} 
        users={technicians} 
        colorClass="bg-blue-600"
      />

      {/* Regular User Section */}
      <UserSection 
        title="Students & Staff" 
        icon={MdPerson} 
        users={regularUsers} 
        colorClass="bg-slate-600"
      />
    </div>
  )
}

export default UsersPage
