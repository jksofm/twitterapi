import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { dotenvConfig } from './dotenv'
// const { config } = require('dotenv')
import fs from 'fs'
import path from 'path'
import { ErrorWithStatus } from '~/models/interface/errors/Error'
import httpStatusCode from '~/constants/httpStatusCode'
dotenvConfig()

// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: []
  body: any
  subject: string
  replyToAddresses?: string[] | string
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendEmail = async (toAddress: string | string[], subject: string, body: any) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress,
    body,
    subject
  })

  return await sesClient.send(sendEmailCommand)
}

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')

// sendVerifyEmail('duthanhduoc01@gmail.com', 'Tiêu đề email', '<h1>Nội dung email</h1>')
export const sendVerifyEmail = async (
  toAddress: string | string[],
  email_verify_token: string,
  template: string = verifyEmailTemplate
) => {
  
     return sendEmail(
      toAddress,
      'Verify your email',
      template
        .replace('{{title}}', 'Please verify your email')
        .replace('{{content}}', 'Click the link below to verify your email')
        .replace('{{titleLink}}', 'Verify')
        .replace('{{link}}', `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`)
    )
  
    // throw new ErrorWithStatus({
    //   message: 'Send Email Verify Token Fail. Please resend verify email after you register',
    //   status: httpStatusCode.INTERNAL_SERVER_ERROR
    // })
  
}

export const sendForgotPasswordEmail = (
  toAddress: string | string[],
  forgot_password_token: string,
  template: string = verifyEmailTemplate
) => {
  return sendEmail(
    toAddress,
    'Verify your password token',
    template
      .replace('{{title}}', 'Forgot Passoword Email')
      .replace('{{content}}', 'Click the link below to verify forgot password')
      .replace('{{titleLink}}', 'Verify forgot password')
      .replace('{{link}}', `${process.env.CLIENT_URL}/forgot-password?token=${forgot_password_token}`)
  )
}
