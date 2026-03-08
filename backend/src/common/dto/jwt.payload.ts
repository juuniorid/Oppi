export interface JwtPayload {
  email: string;
  sub: number;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
}
