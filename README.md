# Dự án Twitter API

## Các API trong dự án

- Authentication module: Quản lý bằng JWT

  - Register
  - Login
  - Refresh Token
  - Log out
  - Verify email token
  - Resend email verify token
  - Send forgot password token
  - Verify forgot password token
  - Update password
  - Update my profile
  - Get my profile

- User module :

  - Follow user
  - Unfollow user
  - Get user profile
  - Upload image
  - Upload video

- Tweet module :

  - Create tweet
  - Get detail tweet
  - Get children tweet
  - Get new feed
  - Create bookmark
  - Delete bookmark
  - Create like
  - Delete like
  - Add User to Circle
  - Delete User to Circle

- Chat module

  - Get conversation

## Công nghệ sử dụng

- Framework: Express.js
- Ngôn ngữ: TypeScript
- Database: NoSQL (MongoDB)
- Authentication: JWT (access token, refresh token) & OAuth 2.0 (Google)
- Email Service: AWS SES
- Upload File: Server storage & AWS S3
- File Handling: Upload and resize image, video
- Websocket: Socket.io
- TypeODM: MongoDB Node.js Driver
- Test API: Postman
- Deployment: Docker & EC2 (AWS)
- API Documentation: Swagger
