import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { usersMessages } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { usersServices } from '~/services/users.services'
import { validate } from '~/utils/valitation'

export const registerValidator = validate(
  checkSchema(
    {
      username: {
        notEmpty: {
          errorMessage: usersMessages.USERNAME_IS_REQUIRED
        },

        
        isString: {
          errorMessage: usersMessages.USERNAME_MUST_BE_A_STRING
        },

        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: usersMessages.USERNAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true,
        custom: {
          options: async (value) => {
            if(!REGEX_USERNAME.test(value)){
              return Promise.reject(usersMessages.USERNAME_INVALID)
            }

            const checkEmailExist = await usersServices.checkUsernameExist(value)
            if (checkEmailExist) {
              return Promise.reject(usersMessages.USERNAME_ALREADY_EXISTS)
              // throw new ErrorWithStatus({ message: 'This email is already used', status: 400 })
            }
            return true
          }
        }
      },
      email: {
        notEmpty: {
          errorMessage: usersMessages.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: usersMessages.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const checkEmailExist = await usersServices.checkEmailExist(value)
            if (checkEmailExist) {
              return Promise.reject(usersMessages.EMAIL_ALREADY_EXISTS)
              // throw new ErrorWithStatus({ message: 'This email is already used', status: 400 })
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: usersMessages.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.PASSWORD_MUST_BE_A_STRING
        },

        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: usersMessages.PASSWORD_LENGTH_MUST_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: usersMessages.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: usersMessages.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessages.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },

        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: usersMessages.CONFIRM_PASSWORD_LENGTH_MUST_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: usersMessages.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(usersMessages.CONFIRM_PASSWORD_IS_NOT_MATCH)
            }
            return true
          }
        }
      },
      date_of_birth: {
        notEmpty: {
          errorMessage: usersMessages.DATE_OF_BIRTH_IS_REQUIRED
        },

        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: usersMessages.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
      // name: {
      //   isString: true,
      //   notEmpty: false,
      //   isLength: {
      //     options: {
      //       min: 4,
      //       max: 20
      //     }
      //   }
      // },
      // email_verify_token: {
      //   isString: true,

      // },
      // forgot_password_token: {
      //   isString: true
      // },
      // verify: {
      //   isInt: true
      // },
      // bio: {
      //   isString: true
      // },
      // location: {
      //   isString: true
      // },
      // website: {
      //   isString: true
      // },
      // avatar: {
      //   isString: true
      // },
      // cover_photo: {
      //   isString: true
      // }
    },
    ['body']
  )
)
