export type ProductClassification = "MATERIAL" | "SEMI_FINISHED" | "FINISHED_GOOD";

export type Product = {
  id: number;
  productCode: string;
  productName: string;
  packageType: string | null;
  classification: ProductClassification;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductInput = {
  productName: string;
  packageType: string;
  classification: ProductClassification;
  active: boolean;
};

export type CreateProductInput = ProductInput & {
  productCode: string;
};
