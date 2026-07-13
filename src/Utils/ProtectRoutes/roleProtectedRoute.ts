import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/Store'
import { decodeJWT, PayloadBearerToken } from '../jwtHelper'
import { useEffect } from 'react'

type Props = {
  allowedRoles: string[]
  children: React.ReactNode
}

const RoleProtectedRoute = ({ allowedRoles, children }: Props) => {
  const token: string | null = useSelector((state: RootState) => state.AuthSlicer.BearerToken)
  const rehydrated = useSelector((s: any) => s._persist?.rehydrated ?? false)

  let user: PayloadBearerToken | null = null
  const navigate = useNavigate()

  try {
    user = token ? decodeJWT(token) : null
  } catch (error) {
    console.error('Error decoding token:', error)
    return navigate('/login', { replace: true })
  }

  useEffect((): any => {
    if (!rehydrated) return

    if (!token || !user?.data) {
      return navigate('/login', { replace: true })
    }

    if (window.location.pathname === '/login') {
      return navigate('/dashboard', { replace: true })
    }

    if (!allowedRoles.includes(user.data.role_name)) {
      return navigate('/403', { replace: true })
    }
  }, [])

  return children
}

export default RoleProtectedRoute
