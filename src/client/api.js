import { Listing, Profile } from "./schema.js";
export { Listing, Profile }

/**
 * Returns a list of all listing IDs
 * @returns { Promise<String[]> }
 */
export async function getListings() {
  const response = await fetch('./api/listings');
  return response.json();
}

/**
 * Returns a listing if it exists
 * @param {string} _id 
 * @returns { Promise<Partial<Listing> | null>}
 */
export async function getListing(_id) {
  if (await hasListing(_id)) {
    const response = await fetch(`./api/listings/${_id}`);
    return response.ok ? response.json() : null;
  } else {
    return null;
  }
}

/**
 * Returns true if a listing id exists
 * @param {string} _id 
 * @returns {Promise<boolean>}
 */
export async function hasListing(_id) {
  const response = await fetch(`./api/listings/${_id}/exists`);
  if (response.ok) {
    const { exists } = await response.json();
    return exists;
  }
  return false;
}

/**
 * Adds a listing to the database
 * @param {Listing} listing 
 */
export async function putListing(listing) {
  // use a form
  const form = new FormData()

  form.append('listing', JSON.stringify(listing))

  if (listing.thumbnail) {
    form.append('thumbnail', listing.thumbnail, 'thumbnail.jpg')
  }

  for (let i = 0; i < listing.carousel.length; i++) {
    form.append(`carousel-${i}`, listing.carousel[i], `carousel-${i}.jpg`)
  }

  let method = 'PUT';
  if (!await hasListing(listing._id)) {
    method = 'POST';
  }

  const options = {
    method,
    body: form
  }

  const response = await fetch('./api/listings', options);
  if (!response.ok) throw new Error(`${method} ./api/listings failed with error ${response.status}`);
}

/**
 * Deletes a given listing id
 * @param {string} id 
 */
export async function deleteListing(id) {
  const response = await fetch(`./api/listings/${id}`, {
    method: 'DELETE'
  });
  if (response.status === 401) throw new Error(`You do not have permission to delete listing ${id}`);
  if (!response.ok) throw new Error(`DELETE ./api/listings/${id} failed with error ${response.status}`);
}

/**
 * Returns the current user's ID
 * @returns {Promise<string>}
 */
export async function getSelfProf() {
  const response = await fetch("./api/self/profile");
  if (!response.ok)
    throw new Error(await response.text());
  return response.text();
}

/**
 * Returns true if the given id has a corresponding profile in the database
 * @param {string} _id 
 * @returns {Promise<boolean>}
 */
export async function hasProfile(_id) {
  const response = await fetch(`./api/profiles/${_id}/exists`);
  if (response.ok) {
    const { exists } = await response.json();
    return exists;
  }
  return false;
}

/**
 * Fetches a profile with the given id
 * @param {string} _id 
 * @returns {Promise<Profile>}
 */
export async function getProfile(_id) {
  const response = await fetch(`./api/profiles/${_id}`)
  if (response.ok) {
    return response.json();
  } else {
    return null;
  }
}

/**
 * Returns a list of IDs corresponding to each listing sold by a given profile
 * @param {string} id 
 * @returns {Promise<string[]>}
 */
export async function getProfileListings(id) {
  const response = await fetch(`./api/profiles/${id}/postedListings`);
  if (response.ok) {
    return response.json();
  } else {
    return [];
  }
}

/**
 * Adds or updates a profile in the database
 * @param {Promise<void>} profile 
 */
export async function putProfile(profile) {
  const hasProfResponse = await fetch(`./api/profiles/${profile._id}`)
  // temp variable to store rev
  let rev = null
  if (hasProfResponse.ok) {
    const prof = await hasProfResponse.json()
    rev = prof._rev
  }
  let entry = { ...profile, _rev: rev }
  const putProfRes = await fetch(`./api/profiles`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(entry)
  })

  if (!putProfRes.ok) {
    throw new Error(`Request to put profile failed with error ${putProfRes.status}`)
  }
}

/**
 * Converts a `Blob` into a data string
 * @param {Blob} blob 
 * @returns {Promise<string>}
 */
export async function blobToURL(blob) {
  try {
    const dataURL = await new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onloadend = () => res(reader.result)
      reader.onerror = rej
      reader.readAsDataURL(blob)
    })
    return dataURL
  }
  catch (error) {
    console.log('Error converting blob to data url', error)
  }
}