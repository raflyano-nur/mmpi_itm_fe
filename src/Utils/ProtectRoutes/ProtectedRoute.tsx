import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/Store'

const ProtectedRoute = ({ children }: { children: any }) => {
  const token = useSelector(
    (state: RootState) => state.AuthSlicer.BearerToken
  )

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
