export class DefultResponseDto<T> {
  statuscode: number;
  message: string[] | string;
  data: T;
  errors: string[] | string | null;
}
