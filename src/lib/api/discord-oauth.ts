import axios, { AxiosError, AxiosResponse } from "axios";
import { endpoints } from "./splash-endpoints";
import { TauriConfig } from "./tauri-config";
import { AuthResponse, ResponseOrError } from "@/lib/types/auth";

export const generateAccountResponse = async (
  code: string
): Promise<ResponseOrError<AuthResponse>> => {
  const issuer =
    TauriConfig.Version === "0.1.0"
      ? "dev 0.1.0"
      : `Classified / ${TauriConfig.Version}`;

  const response:
    | AxiosResponse<AuthResponse>
    | AxiosError<AuthResponse> = await axios
    .get(endpoints.GET_GENERATE_ACCOUNT_RESP, {
      headers: {
        Authorization: `Bearer ${code}`,
        Issuer: issuer,
      },
    })
    .catch(() => new AxiosError<AuthResponse>());

  if (response instanceof Error) {
    return {
      success: false,
      data: response.response?.data!,
    };
  }

  return {
    success: true,
    data: response.data,
  };
};
