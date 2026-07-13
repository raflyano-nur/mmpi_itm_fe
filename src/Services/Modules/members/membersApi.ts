import { api } from '@/Services/api'
import getMembers from './getMembers'
import updateMemberStatus from './updateMemberStatus'
import bulkActionMembers from './bulkActionMembers'
import deleteMember from './deleteMember'

export const membersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMembers: getMembers(build),
    updateMemberStatus: updateMemberStatus(build),
    bulkActionMembers: bulkActionMembers(build),
    deleteMember: deleteMember(build),
  }),
  overrideExisting: false,
})

export const {
  useGetMembersQuery,
  useUpdateMemberStatusMutation,
  useBulkActionMembersMutation,
  useDeleteMemberMutation,
} = membersApi

export type { Member, GetMembersParams, GetMembersMeta, GetMembersResponse } from './getMembers'
