export const USER_ROLE = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
} as const;

export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const EVENT_TYPE = {
  GROUP: 'GROUP',
  KINDERGARTEN: 'KINDERGARTEN',
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export function isUserRole(value: string): value is UserRole {
  return (
    value === USER_ROLE.ADMIN ||
    value === USER_ROLE.TEACHER ||
    value === USER_ROLE.PARENT
  );
}
