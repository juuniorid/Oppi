export class ApiResponse<T = any> {
  success: boolean = true;
  message?: string;
  data?: T;
  code: number = 200;

  constructor(data?: T, message?: string, code?: number, success?: boolean) {
    this.success = success ?? true;
    this.message = message;
    this.data = data;
    this.code = code ?? 200;
  }
}
