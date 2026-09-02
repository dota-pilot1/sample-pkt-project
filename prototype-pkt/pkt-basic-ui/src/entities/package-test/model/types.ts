export type TestSpecStatus = "DRAFT" | "APPROVED" | "INACTIVE";
export type TestConditionType = "RANGE" | "PASS_FAIL";

export type TestCondition = {
  id: number;
  testNumber: number;
  testName: string;
  conditionType: TestConditionType;
  lowerLimit: number | null;
  upperLimit: number | null;
  unit: string | null;
  failBinCode: string | null;
  sequenceNo: number;
  active: boolean;
};

export type TestSpec = {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  specName: string;
  version: number;
  testStage: string;
  status: TestSpecStatus;
  conditions: TestCondition[];
};

export type CreateTestSpecRequest = {
  productId: number;
  specName: string;
  version: number;
  testStage: string;
};

export type CreateTestConditionRequest = {
  testNumber: number;
  testName: string;
  conditionType: TestConditionType;
  lowerLimit?: number;
  upperLimit?: number;
  unit?: string;
  failBinCode?: string;
};
