export type CartProductType = {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
};

export type ApiResponseType<DataType> = {
  success: boolean;
  data: DataType;
  message: string;
};

