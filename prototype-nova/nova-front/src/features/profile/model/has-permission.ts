import type { Profile } from "./types";

/** 역할 이름 대신 서버 프로필의 활성 권한 코드로 화면 접근을 판단한다. */
export function hasPermission(profile: Profile | undefined, code: string) {
  return profile?.active === true && profile.permissions.some((permission) => permission.code === code);
}
