/**
 * OAuthCallback.jsx - Handles the redirect from backend after Google OAuth login
 */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

const OAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth login failed:', error)
      navigate('/login')
      return
    }

    if (token) {
      // Decode JWT payload (base64 string between first and second dot)
      try {
        const payloadBase64 = token.split('.')[1]
        const decodedPayload = JSON.parse(atob(payloadBase64))
        
        const userData = {
          userId: decodedPayload.userId || 'oauth-user', // Might need adjustment based on exact claims
          email: decodedPayload.sub,
          role: decodedPayload.role || 'USER',
          name: decodedPayload.name || 'Google User'
        }

        // Store token via authService so axios has it
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Force a reload so the AuthContext picks up the new localStorage values immediately,
        // or redirect to dashboard which triggers app remount if using Context properly.
        // Easiest robust way without refactoring AuthContext just for this component:
        window.location.href = '/dashboard'
      } catch (e) {
        console.error('Failed to parse OAuth token', e)
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Authenticating with Google...</p>
      </div>
    </div>
  )
}

export default OAuthCallback
