import httpStatusCode from '~/constants/httpStatusCode'
import { usersMessages } from '~/constants/messages'

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

//// Xử lí Error từ schema
type ErrorsType = Record<
  string,
  {
    msg: string
    // location: string
    // value: any
    // path: string
    [key: string]: any
  }
>

export class EnityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({
    errors,
    message = usersMessages.VALIDATION_ERROR,
    status = httpStatusCode.UNPROCESSABLE_ENITY
  }: {
    errors: ErrorsType
    message?: string
    status?: number
  }) {
    super({ message, status })
    this.errors = errors
  }
}
