import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import type { AnswerMap } from "../answers/getAnswers";

export interface SaveTestProgressPayload {
  answers: AnswerMap;
}

export interface SaveTestProgressResponseData {
  saved_count: number;
}

export interface SaveTestProgressResponse {
  success: boolean;
  message: string;
  data: SaveTestProgressResponseData;
  meta: Record<string, never>;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<SaveTestProgressResponse, SaveTestProgressPayload>({
    query: (payload) => ({
      url: `/test/progress`,
      method: "POST",
      body: payload,
    }),
    invalidatesTags: ["TestProgress"],
  });