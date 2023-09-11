import { checkSchema } from 'express-validator'
import { usersMessages } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { usersServices } from '~/services/users.services'
import { validate } from '~/utils/valitation'

export const updateMyProfileValidator = validate(
  checkSchema({
    name: {
      optional: true,
      isString: {
        errorMessage: usersMessages.NAME_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: usersMessages.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      },
      trim: true
    },
    date_of_birth: {
      optional : true,

      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: usersMessages.DATE_OF_BIRTH_MUST_BE_ISO8601
      }
    },
    username: {
      optional: true,
     

      
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
    bio : {
      optional : true,
      isString :{
        errorMessage : usersMessages.BIO_MUST_BE_A_STRING
      },
      trim : true,

      isLength: {
        options: {
          min: 1,
          max: 200
        },
        errorMessage: usersMessages.BIO_LENGTH_MUST_BE_FROM_1_TO_200
      },
    },
    location : {
      isString :{
        errorMessage : usersMessages.LOCATION_MUST_BE_A_STRING
      },
      optional : true,

      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: usersMessages.LOCATION_LENGTH_MUST_BE_FROM_1_TO_100
      },
      trim : true

    },
    website : {
      isString :{
        errorMessage : usersMessages.WEBSITE_MUST_BE_A_STRING
      },
      optional : true,

      trim : true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: usersMessages.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100
      },

    },
    avatar : {
      isString :{
        errorMessage : usersMessages.AVATAR_MUST_BE_A_STRING
      },
      optional : true,

      trim : true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: usersMessages.AVATAR_LENGTH_MUST_BE_FROM_1_TO_100
      },

    },
    cover_photo : {
      optional : true,
      isString :{
        errorMessage : usersMessages.COVER_PHOTO_MUST_BE_A_STRING
      },
      trim : true,
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: usersMessages.COVER_PHOTO_LENGTH_MUST_BE_FROM_1_TO_100
      },

    },


    
    
  })
)
