import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";

export interface SaveTestSettingsPayload {
  TestSetting: string;
  ScoreInitial?: string;
}

export interface SaveTestSettingsResponse {
  success: boolean;
  message: string;
  data: {
    next: string;
  };
  meta: Record<string, any>;
  errors: any;
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<SaveTestSettingsResponse, SaveTestSettingsPayload>({
    query: (body) => ({
      url: "/test/settings",
      method: "POST",
      body,
    }),
  });
