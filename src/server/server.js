import express from 'express'
import logger from 'morgan'
// import { loadView } from '../client/index.js'

const app = express()
const port = 3000

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('src/client'))

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
