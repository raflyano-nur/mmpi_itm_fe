import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";

export interface TestQuestion {
  id: number;
  text: string;
}

export interface GetTestQuestionsResponseData {
  page: number;
  questions: TestQuestion[];
}

export interface GetTestQuestionsMeta {
  total_pages: number;
  count: number;
}

export interface GetTestQuestionsResponse {
  success: boolean;
  message: string;
  data: GetTestQuestionsResponseData;
  meta: GetTestQuestionsMeta;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetTestQuestionsResponse, number>({
    query: (page) => ({
      url: `/test/questions/${page}`,
      method: "GET",
    }),
    providesTags: (_result, _error, page) => [
      { type: "TestQuestions", id: page },
    ],
  });