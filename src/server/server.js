import express from 'express'
import logger from 'morgan'
import { loadView } from '../client/index.js'

const app = express()
const port = 3000

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/login', async (req, res) => {
    await loadView('login', req.query)
})

app.get('/register', async (req, res) => {
    await loadView('register', req.query)
})

app.get('/main', async (req, res) => {
    await loadView('main', req.query)
})

app.get('/seller', async (req, res) => {
    await loadView('seller', req.query)
})

app.get('/product', async (req, res) => {
    await loadView('seller', req.query)
})

app.get('/profile', async (req, res) => {
    await loadView('seller', req.query)
})

// Handle unsupported methods for all routes
app.all('*', (req, res) => {
  res.status(405).send('Method Not Allowed')
})

// Handle unknown routes
app.all('*', (req, res) => {
  res.status(404).send('Not Found')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
