import { api } from "@/Services/api";
import saveTestSettings from "./saveTestSettings";
import getTestQuestions from "./getTestQuestions";
import getTestProgress from "./getTestProgress";
import saveTestProgress from "./saveTestProgress";

export const testApi = api.injectEndpoints({
  endpoints: (build) => ({
    saveTestSettings: saveTestSettings(build),
    getTestQuestions: getTestQuestions(build),
    getTestProgress: getTestProgress(build),
    saveTestProgress: saveTestProgress(build),

  }),
  overrideExisting: false,
});

export const { 
  useSaveTestSettingsMutation,
  useGetTestQuestionsQuery,
  useLazyGetTestQuestionsQuery,
  useGetTestProgressQuery,
  useLazyGetTestProgressQuery,
  useSaveTestProgressMutation,

} = testApi;

export type { SaveTestSettingsPayload, SaveTestSettingsResponse } from "./saveTestSettings";
export type {
  TestQuestion,
  GetTestQuestionsResponseData,
  GetTestQuestionsMeta,
  GetTestQuestionsResponse,
} from "./getTestQuestions";

export type {
  GetTestProgressResponseData,
  GetTestProgressResponse,
} from "./getTestProgress";

export type {
  SaveTestProgressPayload,
  SaveTestProgressResponseData,
  SaveTestProgressResponse,
} from "./saveTestProgress";
