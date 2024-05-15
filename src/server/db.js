import PouchDB from 'pouchdb';
import pouchdb_find from 'pouchdb-find'
import { Listing, Profile } from '../client/schema.js';

PouchDB.plugin(pouchdb_find);
const listingTable = new PouchDB("listings");
const profileTable = new PouchDB("profiles");

/**
 * Returns a list of all listings
 * @returns { Promise<String[]> }
 */
export async function getListings() {
  const listings = await listingTable.allDocs();
  return listings.rows.map(x => x.id).filter(id => !id.includes("_design"));
}

/**
 * Retrieves a specific listing
 * @param {string} id 
 * @returns {Promise<Partial<Listing>>}
 */
export async function getListing(id) {
  return await listingTable.get(id);
}

/**
 * Retrieves a specific listing's thumbnail
 * @param {string} id 
 * @returns {Promise<{content_type: string, data: Buffer}>}
 */
export async function getListingThumbnail(id) {
  const content_type = (await listingTable.get(id))._attachments.thumbnail.content_type;
  const thumbnail = await listingTable.getAttachment(id, "thumbnail");
  return { content_type, data: thumbnail };
}

/**
 * Retrieves a specific listing's carousel image
 * @param {string} id 
 * @returns {Promise<{content_type: string, data: Buffer} | null>}
 */
export async function getListingCarousel(id, index) {
  const key = `carousel-${index}`;
  const attachmentsMetadata = (await listingTable.get(id))._attachments;
  if (!(key in attachmentsMetadata)) return null;
  const content_type = attachmentsMetadata[key].content_type;
  const image = await listingTable.getAttachment(id, key);
  return { content_type, data: image };
}

/**
 * Tests is a given listing id exists in the db
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function hasListing(id) {
  return await listingTable.get(id).then(() => true, () => false)
}

/**
 * Deletes a given listing by ID.
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function deleteListing(id) {
  const oldListing = await listingTable.get(id);
  return await listingTable.remove(oldListing);
}

/**
 * Puts a listing into the database, overwriting an old version if it exists
 * @param {Listing} listing 
 */
export async function putListing(listing) {
  let entry = { ...listing };
  if (await hasListing(listing._id)) {
    entry._rev = (await listingTable.get(listing._id))._rev
  }
  entry = { _rev: entry._rev, ...listing };
  delete entry.thumbnail;
  delete entry.carousel;
  entry.carouselLength = listing.carousel.length;
  await listingTable.put(entry)

  entry = await listingTable.get(listing._id)
  await listingTable.putAttachment(
    listing._id,
    "thumbnail",
    entry._rev,
    Buffer.from(await listing.thumbnail.arrayBuffer()),
    listing.thumbnail.type
  )

  for (let i = 0; i < listing.carousel.length; i++) {
    entry = await listingTable.get(listing._id)
    await listingTable.putAttachment(
      listing._id,
      `carousel-${i}`,
      entry._rev,
      Buffer.from(await listing.carousel[i].arrayBuffer()),
      listing.carousel[i].type
    )
  }
}

/**
 * Returns whether a given id exists in the database
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function hasProfile(id) {
  return profileTable.get(id).then(() => true, () => false)
}

/**
 * Returns a list of all profile IDs
 * @returns { Promise<String[]> }
 */
export async function getProfiles() {
  const profiles = await profileTable.allDocs();
  return profiles.rows.map(x => x.id);
}

/**
 * Returns a profile if it exists
 * @param {string} id 
 * @returns { Promise<Profile | null> }
 */
export async function getProfile(id) {
  if (!hasProfile(id))
    return null;
  let profile = await profileTable.get(id);

  return new Profile(
    profile._id,
    profile.pfp,
    profile.name,
    profile.email,
    profile.payments,
    profile.posted,
    profile.sold,
    profile.purchased
  );
}

listingTable.createIndex({
  index: {
    fields: ["sellerId"]
  }
})
/**
 * Returns a profile if it exists
 * @param {string} id The profile's id
 * @returns { Promise<string[]> } A list of all listings associated with the profile
 */
export async function getProfileListings(id) {
  const response = await listingTable.find({
    selector: {
      sellerId: {$eq: id}
    },
    fields: ["_id"]
  });
  return response.docs.map(({_id}) => _id);
}

/**
 * Adds a profile to the database
 * @param {Profile} profile 
 */
export async function putProfile(profile) {
  let entry = { ...profile };
  if (await hasProfile(profile._id)) {
    entry._rev = (await profileTable.get(profile._id))._rev
  }
  entry = { _rev: entry._rev, ...profile };
  await profileTable.put(entry)
}