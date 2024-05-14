## 326 Group Project

# Getting Started

To run the project:

1. Download or clone this repository to your local machine.
2. Open your terminal.
3. Navigate to the project directory.
4. Run `npm install` to install dependencies.
5. After the installation is complete, run `npm run dev`.

### Project Responsibilities:

- **Hanna:**
  - Main page, seller, product page design and development
  - Profile managemnet and creation
  - Navigation Bar

- **Max:**
  - Main page design and development
  - Authentication
  - Product page implementation

- **Sagarika:**
  - Main page design and development
  - Authentication
  - Seller page implementation

- **Sean:**
  - Profile management
  - Search Bar
    
## API Routes

### GET

In server.js, there are app.get instances that handle loading user profile, getting listings, and getting listing information.

'/api/listings'
'/api/listings/:id'
'/api/listings/:id/thumbnail'
'/api/listings/:id/carousel/:index'
'/api/profiles'
'/api/profiles/:id/postedListings'
"/api/self/profile"
"/api/login/callback"
'/api/login'

### POST

### PUT

In server.js, there are app.put instances that handle putting the profiles and listings onto the front end.

'/api/listings'
'/api/profiles'

### DELETE

In server.js, there is app.delete that handles the deletion of item listings from the database.

'/api/listings/:id'

### View Pages: Currently, our buttons do not work. 

To access a page, navigate to localhost/index.html#view
To access the main page, type `localhost/index.html#main` after the URL.

#### Available Pages

- `login`
- `main`
- `product`
- `seller`
- `profile`

# Using UBay

## User Base

UBay is a web application create for students at UMass Amherst to buy and sell items. Imagine yourself a college student who wants to sell or buy items from/for their dorm.

## Login Page

When first opening the web application, the user is prompted to create an account with our Google Authentication system. Clicking the 'Log in with Google' button leads the user to select a Google account to proceed with.

## Main Page

The top of the page includes a navigation bar to the "Home" page, serach bar, "Sell" page, and "Profile" page.

The "Home" page is where listings from other students are posted in containers detailing product picture, product title, and price representing individual listings that can be clicked on to see full details. The intention is for the page to serve as a hub for postings made.

## Product Page

The top of the page includes a navigation bar to the "Home" page, serach bar, "Sell" page, and "Profile" page.

The "Product" page displays pertinent information about an item being sold that includes title, quantity, price, description, and a seller information. At the bottom, there is a contact button that directly creates an email sent to the seller to inquire further. The intentino is to allow a user to learn more about an item before making a buying decision.

## Seller Page

The top of the page includes a navigation bar to the "Home" page, serach bar, "Sell" page, and "Profile" page.

The "Sell" page displays fill in boxes for a user to fill in to post an item they would like to sell that includes title, quantity, price, description, and a seller information. At the bottom, user presses a "Post" button to put item on the home page/marketplace. The intention is to allow a user to make postings for other student's to view.

## Profile Page

The top of the page includes a navigation bar to the "Home" page, serach bar, "Sell" page, and "Profile" page.

The "Profile" allows the user to see their account details such as displayed name, profile picture, and email, which are automatically filled in by Google. Additionally, there is an items section that dynamically adds postings made by a user, wherein clicking a listing offers a delete button to remove an item from the home page/marketplace as appropriate. The intention is to allow a user to see what others see in terms of account details when they make a post.

#### GitHub Link

https://github.com/hannajiangg/326-Group-Project
