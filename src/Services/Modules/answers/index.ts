import { api } from "@/Services/api";
import getAnswers from "./getAnswers";

export const answersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAnswers: getAnswers(build),
  }),
  overrideExisting: false,
});

export const { useGetAnswersQuery, useLazyGetAnswersQuery } = answersApi;

export type {
  AnswerTestInfo,
  AnswerMap,
  GetAnswersResponseData,
  GetAnswersMeta,
  GetAnswersResponse,
} from "./getAnswers";
