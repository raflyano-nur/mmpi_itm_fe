import { api } from "@/Services/api";
import getAnswers from "./getAnswers";
import submitAnswers from "./submitAnswers";

export const answersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAnswers: getAnswers(build),
    submitAnswers: submitAnswers(build),
  }),
  overrideExisting: false,
});

export const { useGetAnswersQuery, useLazyGetAnswersQuery, useSubmitAnswersMutation } = answersApi;

export type {
  AnswerTestInfo,
  AnswerMap,
  GetAnswersResponseData,
  GetAnswersMeta,
  GetAnswersResponse,
} from "./getAnswers";

export type {
  TestAnswerValue,
  SubmitAnswerMap,
  SubmitAnswersPayload,
  SubmitAnswersResponse,
} from "./submitAnswers";
