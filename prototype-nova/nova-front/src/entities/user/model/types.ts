export type SignUpRequest = {
  loginId: string;
  password: string;
  displayName: string;
};

export type SignUpResponse = {
  id: number;
  loginId: string;
  displayName: string;
  active: boolean;
  roleCode: string;
  createdAt: string;
};
