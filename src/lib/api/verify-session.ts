import axios, { AxiosError, AxiosResponse } from "axios";
import { endpoints } from "./splash-endpoints";
import { TauriConfig } from "./tauri-config";
import { ResponseOrError } from "@/lib/types/auth";

interface ExchangeCodeResponse {
  code: string;
  success: boolean;
}

export const checkState = async (
  access_token: string
): Promise<ResponseOrError<ExchangeCodeResponse>> => {
  const issuer =
    TauriConfig.Version === "0.1.0"
      ? "dev 0.1.0"
      : `Classified / ${TauriConfig.Version}`;

  const response:
    | AxiosResponse<ExchangeCodeResponse>
    | AxiosError<ExchangeCodeResponse> = await axios
    .get(endpoints.GET_ACTIVE_CHECK, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Issuer: issuer,
      },
    })
    .catch(() => new AxiosError<ExchangeCodeResponse>());

  if (response instanceof Error) {
    return {
      success: false,
      data: response.response?.data!,
    };
  }

  if (response.status !== 200) {
    return {
      success: false,
      data: response.data,
    };
  }

  return {
    success: true,
    data: response.data,
  };
};
