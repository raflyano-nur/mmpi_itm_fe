import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import type { Member } from "../members/getMembers";

export interface AnswerTestInfo {
  test_setting: string | null;
  test_date: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
}

// key = nomor soal ("1".."567"), value = 1 (YA), 2 (TIDAK), 0/null (belum dijawab)
export type AnswerMap = Record<string, 0 | 1 | 2 | null>;

export interface GetAnswersResponseData {
  member: Member;
  test: AnswerTestInfo;
  answers: AnswerMap;
}

export interface GetAnswersMeta {
  answers_count: number;
}

export interface GetAnswersResponse {
  success: boolean;
  message: string;
  data: GetAnswersResponseData;
  meta: GetAnswersMeta;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetAnswersResponse, string | number>({
    query: (reportId) => ({
      url: `/answers/${reportId}`,
      method: "GET",
    }),
    providesTags: (_result, _error, reportId) => [
      { type: "Answers", id: reportId },
    ],
  });
