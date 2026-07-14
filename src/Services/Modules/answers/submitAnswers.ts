import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";

export type TestAnswerValue = 0 | 1 | 2 | null;
export type SubmitAnswerMap = Record<string, TestAnswerValue>;

export interface SubmitAnswersPayload {
  user_id: string | number;
  answers: SubmitAnswerMap;
  meta?: {
    TestSetting?: string;
    ScoreInitial?: string;
    TimeStart?: string;
    [key: string]: unknown;
  };
}

export interface SubmitAnswersResponse {
  success: boolean;
  message: string;
  data: {
    report_id: string | number;
    result?: unknown;
  };
  meta: Record<string, any>;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<SubmitAnswersResponse, SubmitAnswersPayload>({
    query: (body) => ({
      url: "/answers",
      method: "POST",
      body,
    }),
    invalidatesTags: (_result, _error, arg) => [
      { type: "Answers", id: arg.user_id },
      { type: "Member", id: arg.user_id },
      "Dashboard",
    ],
  });
