import { useMeQuery } from '@/Services/Modules/auth'

/**
 * Adapter around wherever session/auth state actually lives.
 * Kept as a single hook so ProfileContainer (and anything else) never talks
 * to authApi / AuthSlicer directly — if that source ever changes, only this
 * file needs updating.
 *
 * Note: AuthSlicer (Store/redux/Auth) holds the decoded JWT (permissions,
 * modules, BearerToken) for route-guarding, but its `user` shape is just the
 * raw JWT payload — not guaranteed to carry IDNumber/role the way we need
 * here. `useMeQuery` hits GET /auth/me and returns exactly the Member-shaped
 * user (IDNumber, Name, username, role), which is what Profile needs. RTK
 * Query caches/dedupes it, so this doesn't cause an extra network round trip
 * if another component (e.g. the layout/sidebar) already called it.
 */
export function useSessionUser(): {
  id: string | number | null
  role: 'admin' | 'user'
  isLoading: boolean
} {
  const { data, isLoading } = useMeQuery()
  const user = data?.data.user

  return {
    id: user?.IDNumber ?? null,
    role: user?.role === 'admin' ? 'admin' : 'user',
    isLoading,
  }
}