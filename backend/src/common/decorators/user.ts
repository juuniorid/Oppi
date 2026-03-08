import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User as AppUser } from 'database/schema';

export const User = createParamDecorator(
  (
    data: keyof AppUser | undefined,
    ctx: ExecutionContext,
  ): AppUser | AppUser[keyof AppUser] | null => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: AppUser }>();
  const user = request.user;

  if (!user) {
    return null;
  }

  return data ? user[data] : user;
});
