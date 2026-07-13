import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import type { Member } from "./getMembers";

export interface GetMemberDetailResponse {
  success: boolean;
  message: string;
  data: {
    member: Member;
  };
  meta: Record<string, any>;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetMemberDetailResponse, string | number>({
    query: (idnumber) => ({
      url: `/members/${idnumber}`,
      method: "GET",
    }),
    providesTags: (_result, _error, idnumber) => [
      { type: "Member", id: idnumber },
    ],
  });
