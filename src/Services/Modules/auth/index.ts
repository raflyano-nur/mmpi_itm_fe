import { api } from '@/Services/api'
import login from './login'
import me from './me'
import logout from './logout'
import getMenu from './getMenu'

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: login(build),
    me: me(build),
    logout: logout(build),
    getMenu: getMenu(build),
  }),
  overrideExisting: false,
})

export const {
  useLoginMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
  useGetMenuQuery,
} = authApi