import { api } from '@/Services/api'
import getMembers from './getMembers'
import getMemberDetail from './getMemberDetail'
import createMember from './createMember'
import createAdmin from './createAdmin'
import updateMember from './updateMember'
import updateMemberStatus from './updateMemberStatus'
import bulkActionMembers from './bulkActionMembers'
import deleteMember from './deleteMember'

export const membersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMembers: getMembers(build),
    getMemberDetail: getMemberDetail(build),
    createMember: createMember(build),
    createAdmin: createAdmin(build),
    updateMember: updateMember(build),
    updateMemberStatus: updateMemberStatus(build),
    bulkActionMembers: bulkActionMembers(build),
    deleteMember: deleteMember(build),
  }),
  overrideExisting: false,
})

export const {
  useGetMembersQuery,
  useGetMemberDetailQuery,
  useLazyGetMemberDetailQuery,
  useCreateMemberMutation,
  useCreateAdminMutation,
  useUpdateMemberMutation,
  useUpdateMemberStatusMutation,
  useBulkActionMembersMutation,
  useDeleteMemberMutation,
} = membersApi

export type { Member, GetMembersParams, GetMembersMeta, GetMembersResponse } from './getMembers'
export type { GetMemberDetailResponse } from './getMemberDetail'
export type { CreateMemberPayload, CreateMemberResponse, CreateMemberCredentials } from './createMember'
export type { CreateAdminPayload, CreateAdminResponse } from './createAdmin'
export type { UpdateMemberPayload, UpdateMemberResponse } from './updateMember'
