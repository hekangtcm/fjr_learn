import dotenv from 'dotenv'
dotenv.config()

import { createServer } from 'http'
import app from './server'
import { initSocket } from './lib/socket'

const PORT = process.env.PORT || 4000
const server = createServer(app)
initSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
