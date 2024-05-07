// TODO Add endpoints for all database functionality
import express from 'express';
import logger from 'morgan';
// import { blobToURL, getListing, hasListing, Listing, putListing } from '../client/api.js'; 
// Client and server code should be separate
import { Listing, Profile } from "../common/schema.js";
import { getListing, getListings, hasListing, hasProfile, putListing } from './db.js';


const app = express()
const port = 8080

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('src/client'));
app.use(express.static('src/common')); // TODO make a better solution for hosting common files

app.get('/api/listings', async (req, res) => {
  try {
    const listings = await getListings();
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (hasListing(id)) {
      const listing = await getListing(id);
      res.json(listing);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/listings', async (req, res) => {
  const listingData = req.body;
  try {
    await putListing(listingData);
    res.status(201).json({ message: 'Listing created/updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/api/login", (req, res) => {
  console.log("login tested");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
