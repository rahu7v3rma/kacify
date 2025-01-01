import { ApiResponseType } from "./types";

export const alertApiRespone =
  <DataType>(
    apiFunction: (...args: any) => Promise<ApiResponseType<DataType>>
  ) =>
  async (...args: any) => {
    const response = await apiFunction(...args);

    if (!response.success) {
      alert(response.message || "An error occurred.");
    }

    return response.data;
  };
