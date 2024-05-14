// TODO make all database related functions use fetch
// import PouchDB from "pouchdb"
// let listingStore = new PouchDB("listing_store")

import { Listing, Profile } from "./schema.js";
export { Listing, Profile }

/**
 * Returns a list of all listings.
 * @returns { Promise<String[]> }
 */
export async function getListings() {
  const response = await fetch('./api/listings');
  return response.json();
}

// You must specify an id when fetching a listing
// export async function getListing() {
//   const response = await fetch(`./api/listings`)
//   if (response.ok) {
//     return response.json()
//   }
//   else {
//     throw new Error('Failed to fetch listings')
//   }
// }

/**
 * Returns a listing if it exists
 * @param {string} _id 
 * @returns { Listing | null }
 */
// export async function getListing(_id) {
//   if(!await hasListing(_id))
//     return null;
//   let listing = await listingStore.get(_id);
//   const thumbnail = await listingStore.getAttachment(_id, "thumbnail");

//   const carousel = [];
//   for(let i = 0; i < listing.carouselLength; i++){
//     const carouselImage = await listingStore.getAttachment(_id, `carousel_${i}`);
//     carousel.push(carouselImage);
//   }
//   return new Listing(
//     listing._id, 
//     listing.title,
//     thumbnail,
//     carousel,
//     listing.cost,
//     listing.description,
//     listing.category,
//     1,
//     listing.sellerId,
//   );
// }

/**
 * Returns a listing if it exists
 * @param {string} _id 
 * @returns { Promise<Partial<Listing> | null>}
 */
export async function getListing(_id) {
  const response = await fetch(`./api/listings/${_id}`)
  if (response.ok) {
    return response.json();
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
  const response = await fetch(`./api/listings/${_id}`);
  return response.ok;
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
  if(!await hasListing(listing._id)){
    method = 'POST';
  }

  const options = {
    method,
    body: form
  }

  const response = await fetch('./api/listings', options);
  if(!response.ok) throw new Error(`PUT ./api/listings failed with error ${response.status}`);
}

/**
 * Deletes a given listing id;
 * @param {string} id 
 */
export async function deleteListing(id) {
  const response = await fetch(`./api/listings/${id}`, {
    method: 'DELETE'
  });
  if(response.status === 401) throw new Error(`You do not have permission to delete listing ${id}`);
  if(!response.ok) throw new Error(`DELETE ./api/listings/${id} failed with error ${response.status}`);
}

export async function generateFakeData() {
  try {
    const imgPath = '/assets/dasweatervest.jpeg'
    const carouselImgPaths = ["/assets/sweater1.jpeg", "/assets/sweater2.jpeg", "/assets/sweater3.jpeg", "/assets/sweater1.jpeg"]

    const imgBlob = await fetch(imgPath)
      .then(res => res.blob())

    const carouselBlobs = await Promise.all(carouselImgPaths.map(async (url) => {
      const resurl = await fetch(url)
      return resurl.blob()
    }))

    const fakeListings = [
      new Listing(
        "000",
        "Cool Sweater",
        imgBlob,
        carouselBlobs,
        49.99,
        "Men's Waterfowl Sweater, Size M",
        1,
        "000"
      )
    ]
    await putListing(fakeListings[0]);
  }
  catch (error) {
    console.log('Error generating data: ', error)
  }
}

// export async function blobToURL(blob){
//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     return await new Promise(resolve => reader.onloadend = () => {
//         resolve(reader.result);
//     });
// }

/**
 * Returns the current user's ID.
 * @returns {Promise<string>}
 */
export async function getSelfProf() {
  const response = await fetch("./api/self/profile");
  if (!response.ok)
    throw new Error(await response.text());
  return response.text();
}

// export async function getSelfId(){
//   const response = fetch("./api/profiles/self");
//   return (await response).text();
// }

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

await generateFakeData();

// let profileStore = new PouchDB("profile_store");

// export async function hasProfile(_id) {
//   return await profileStore.get(_id).then(() => true, () => false)
// }

/**
 * Returns true if the given id has a corresponding profile in the database
 * @param {string} _id 
 * @returns {Promise<boolean>}
 */
export async function hasProfile(_id) {
  const response = await fetch(`./api/profiles/${_id}`);
  return response.ok;
}

/**
 * Returns a profile if it exists
 * @param {string} _id 
 * @returns { Profile | null }
 */
// export async function getProfile(_id) {
//   if(!await hasProfile(_id))
//     return null;
//   let profile = await profileStore.get(_id);
//   const pfp = await profileStore.getAttachment(_id, "pfp");

// return new Profile(
//   profile._id,
//   pfp,
//   profile.name,
//   profile.email,
//   profile.payments,
//   profile.posted,
//   profile.sold,
//   profile.purchased
// );
// }

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
 * Gets the listings being sold by a given profile.
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
 * 
 * @param {Profile} profile 
 */
// export async function putProfile(profile) {
//   let entry = { ...profile };
//   if (await hasProfile(profile._id)) {
//     entry._rev = (await profileStore.get(profile._id))._rev
//   }
//   entry = { _rev: entry._rev, ...profile };
//   delete entry.pfp;
//   await profileStore.put(entry)

//   entry = await profileStore.get(profile._id);
//   await profileStore.putAttachment(
//     profile._id,
//     "pfp",
//     entry._rev,
//     profile.pfp,
//     profile.pfp.type
//   );
// }

/**
 * Uploads a new profile to the database
 * @param {Promise<void>} profile 
 */
export async function putProfile(profile) {
  try {
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
  catch (error) {
    console.log('Error putting profile', error)
  }
}

// would prolly stay the same
export async function generateFakeProfile() {
  // await profileStore.destroy()
  // profileStore = new PouchDB("profile_store")
  const fakeProfile =
    new Profile(
      "000",
      "./assets/zoo_buy_logo.jpg",
      "Tim Richards",
      "richards@cs.umass.edu",
      ["Example 1", "Example 2"],
      [
        "000"
      ],
      []
    )
  await putProfile(fakeProfile);
}

await generateFakeProfile();