import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import type { AnswerMap } from "../answers/getAnswers";

export interface GetTestProgressResponseData {
  answers: AnswerMap;
}

export interface GetTestProgressResponse {
  success: boolean;
  message: string;
  data: GetTestProgressResponseData;
  meta: Record<string, never>;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetTestProgressResponse, void>({
    query: () => ({
      url: `/test/progress`,
      method: "GET",
    }),
    providesTags: ["TestProgress"],
  });