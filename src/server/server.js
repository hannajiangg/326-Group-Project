import express from 'express'
import logger from 'morgan'
import * as login from '../client/login/login.js'
import * as register from '../client/register/register.js'
import * as main from '../client/main/main.js'
import * as product from '../client/product/product.js'
import * as seller from '../client/seller/seller.js'
import * as profile from '../client/profile/profile.js'

const app = express()
const port = 3000

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Serve static files for each module
app.use('/login', express.static('src/client/login'))
app.use('/register', express.static('src/client/register'))
app.use('/main', express.static('src/client/main'))
app.use('/product', express.static('src/client/product'))
app.use('/seller', express.static('src/client/seller'))
app.use('/profile', express.static('src/client/profile'))

// Route definitions for each module
app.get('/login', login.onNavigate)
app.get('/register', register.onNavigate)
app.get('/main', main.onNavigate)
app.get('/product', product.onNavigate)
app.get('/seller', seller.onNavigate)
app.get('/profile', profile.onNavigate)

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
