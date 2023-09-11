import { Server } from 'socket.io'

import Conversation_Schema from '~/models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'
import { DB } from '~/services/database.services'
import {Server as ServerHttp} from 'http'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL
    }
  })
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}
  io.on('connection', (socket) => {
    // console.log(socket.id)
    const user_id = socket.handshake.auth._id
    if (ObjectId.isValid(user_id)) {
      users[user_id] = {
        socket_id: socket.id
      }
    }

    console.log(users)
    // socket.use((packet, next) => {
    //   next()
    // })
    // socket.on('error', (err) => {})
    socket.on('private message', (data) => {
      const receiver_socket_id = users[data.to]?.socket_id
      if (!receiver_socket_id) {
        return
      }
      console.log('receiver_socket_id', receiver_socket_id)
      console.log('use_id', user_id)

      DB.conversations.insertOne(
        new Conversation_Schema({
          receiver_id: new ObjectId(data.to),
          sender_id: new ObjectId(data.from),
          message: data.content
        })
      )

      socket.to(receiver_socket_id).emit('receive private message', {
        content: data.content,
        from: data.from
      })
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
      delete users[user_id]
    })
  })
}
export default initSocket
