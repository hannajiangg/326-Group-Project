import PouchDB from 'pouchdb';
import { Listing, Profile } from '../common/schema.js';

const listingTable = new PouchDB("listings");
const profileTable = new PouchDB("profiles");

/**
 * Returns a list of all listings
 * @returns { Promise<String[]> }
 */
export async function getListings() {
  const listings = await listingTable.allDocs();
  return listings.rows.map(x => x.id);
}

/**
 * Retrieves a specific listing
 * @param {string} id 
 * @returns {Listing}
 */
export async function getListing(id) {
  return await listingTable.get(id);
}

/**
 * Tests is a given listing id exists in the db
 * @param {string} id 
 * @returns {boolean}
 */
export async function hasListing(id) {
  return await listingTable.get(id).then(() => true, () => false)
}

/**
 * Puts a listing into the database, overwriting an old version if it exists
 * @param {Listing} listing 
 */
// TODO
export async function putListing(listing) {
  let entry = { ...listing };
  if (hasListing(listing._id)) {
    entry._rev = (await listingTable.get(listing._id))._rev
  }
  entry = { _rev: entry._rev, ...listing };
  delete entry.thumbnail;
  delete entry.carousel;
  entry.carouselLength = listing.carousel.length;
  await listingTable.put(entry)

  // TODO Image Functionality Currently Broken
  // entry = await listingTable.get(listing._id);
  // await listingTable.putAttachment(
  //   listing._id,
  //   "thumbnail",
  //   entry._rev,
  //   listing.thumbnail,
  //   listing.thumbnail.type
  // );

  // for(let i = 0; i < listing.carousel.length; i++){
  //   entry = await listingTable.get(listing._id);
  //   await listingTable.putAttachment(
  //     listing._id,
  //     `carousel_${i}`,
  //     entry._rev,
  //     listing.carousel[i],
  //     listing.carousel[i].type
  //   );
  // }
}

/**
 * Returns whether a given id exists in the database
 * @param {string} id 
 * @returns {boolean}
 */
export async function hasProfile(id) {
  return await profileTable.get(id).then(() => true, () => false)
}

/**
 * Returns a profile if it exists
 * @param {string} id 
 * @returns { Profile | null }
 */
export async function getProfile(id) {
  if(!hasProfile(id))
    return null;
  let profile = await profileStore.get(id);
  const pfp = await profileStore.getAttachment(id, "pfp");
  
  return new Profile(
    profile._id,
    pfp,
    profile.name,
    profile.email,
    profile.payments,
    profile.posted,
    profile.sold,
    profile.purchased
  );
}

/**
 * Adds a profile to the database
 * @param {Profile} profile 
 */
export async function putProfile(profile) {
  let entry = { ...profile };
  if (hasProfile(profile._id)) {
    entry._rev = (await profileStore.get(profile._id))._rev
  }
  entry = { _rev: entry._rev, ...profile };
  delete entry.pfp;
  await profileStore.put(entry)

  entry = await profileStore.get(profile._id);
  await profileStore.putAttachment(
    profile._id,
    "pfp",
    entry._rev,
    profile.pfp,
    profile.pfp.type
  );
}