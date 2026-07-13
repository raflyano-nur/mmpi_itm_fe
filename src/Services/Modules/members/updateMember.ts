import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import type { Member } from "./getMembers";

export interface UpdateMemberPayload {
  idnumber: string | number;
  nama?: string;
  name?: string;
  address?: string;
  gender?: string;
  birthdate?: string;
  age?: string | number;
  education?: string;
  marital?: string;
  marital_status?: string;
  occupation?: string;
  referredby?: string;
  referred_by?: string;
  /** Hanya berlaku kalau yang request adalah admin, sesuai logic di backend. */
  role?: "user" | "admin";
}

export interface UpdateMemberResponse {
  success: boolean;
  message: string;
  data: {
    member: Member;
  };
  meta: Record<string, any>;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<UpdateMemberResponse, UpdateMemberPayload>({
    query: ({ idnumber, ...body }) => ({
      url: `/members/${idnumber}`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: (_result, _error, arg) => [
      { type: "Member", id: arg.idnumber },
      { type: "Member", id: "LIST" },
      "Dashboard",
    ],
  });
