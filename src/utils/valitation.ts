import express from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import httpStatusCode from '~/constants/httpStatusCode'
import { EnityError, ErrorWithStatus } from '~/models/interface/errors/Error'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
   
    const enityError = new EnityError({errors: {}})
    // Kiểm tra xem có satus code nào khác với 422 để đẩy vào ErrorHandle
    const errorsObject = errors.mapped()
  
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatusCode.UNPROCESSABLE_ENITY) {
        // Khi ta truyền vào một tham số cho next nó sẽ đi vào ErrorHandler
        return next(msg)
      }else{
      enityError.errors[key] = errorsObject[key]
      }
    }
    ///End
 

    // res.status(400).json({ errors: errors.mapped() })
    next(enityError)
  }
}


////Flow xử lí Error handler 
/// Sau khi validation từ schema sẽ có 2 trường hợp
//Trường hợp 1 : Lôi khác với 422 là lỗi mà ta tự handle Message và status code bằng ErrorWithStatus. Trương hợp này thì msg không phải là một string mà sẽ là một object chứa message và statusCode mà ta đã tự handle. 
//Trường hợp 2 : Lỗi 422 mà schema validation tạo ra. Với lỗi này ta tạo một schema cho nó (EnityError) . Và đưa hết errors trong schema vào handler
