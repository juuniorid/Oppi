import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: any }>();
  const user = request.user;

  if (!user) {
    return null;
  }

  return data ? user[data] : user;
});
