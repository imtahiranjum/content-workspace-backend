import { Request } from 'express';

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: ReqUser;
}

export interface ReqUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: ReqUser;
}
