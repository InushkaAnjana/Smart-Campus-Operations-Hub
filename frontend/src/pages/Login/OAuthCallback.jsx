/**
 * OAuthCallback.jsx - Handles the redirect from backend after Google OAuth login.
 *
 * Flow:
 *  1. User clicks "Sign in with Google" on LoginPage
 *  2. Browser is redirected to /oauth2/authorization/google (backend via Vite proxy)
 *  3. Spring Security does the OAuth2 dance with Google
 *  4. GoogleOAuthSuccessHandler generates a JWT and redirects to:
 *       http://localhost:5173/oauth/callback?token=<jwt>
 *  5. This component reads the token from the query param,
 *     stores it in localStorage, updates AuthContext, then navigates to /dashboard.
 */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const OAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth login failed:', error)
      // Redirect to login with the specific error code for the UI to display
      navigate(`/login?error=${error}`, { replace: true })
      return
    }

    if (token) {
      try {
        // ── Decode JWT payload ────────────────────────────────────────────────
        const payloadBase64 = token.split('.')[1]
        const standardBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
        const decodedPayload = JSON.parse(atob(standardBase64))

        // Build user object from JWT claims
        // sub = email, userId = id, name = display name
        const userData = {
          id: decodedPayload.userId,
          userId: decodedPayload.userId, // for backward compatibility
          email: decodedPayload.sub,
          role: decodedPayload.role || 'USER',
          name: decodedPayload.name || 'User',
        }

        // Clear any old session data and save the new user
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // loginWithToken updates both localStorage and React Auth state
        loginWithToken(token, userData)
        
        navigate('/dashboard', { replace: true })
      } catch (e) {
        console.error('Failed to parse OAuth token:', e)
        navigate('/login?error=invalid_token', { replace: true })
      }
    } else {
      navigate('/login?error=token_missing', { replace: true })
    }
  }, [searchParams, navigate, loginWithToken])

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Authenticating with Google...</p>
      </div>
    </div>
  )
}

export default OAuthCallback
