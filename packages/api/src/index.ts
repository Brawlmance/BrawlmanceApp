import express, { type NextFunction, type Request, type Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import { setupRoutes } from './routes'

import './express-async-errors-patch'

const app = express()
const server = http.createServer(app)
app.disable('x-powered-by')

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Allow', 'GET, POST, OPTIONS')
  next()
})

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

setupRoutes(app)

app.all('*', function (req: Request, res: Response) {
  res.status(404).json({ error: '404 Not Found' })
})

app.use(errorHandler)
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack)
  res.status(500).json({ error: 'Error 500: Internal server error' })
}

server.listen(4401, () => {
  console.log('Server listening on port 4401!')
})
