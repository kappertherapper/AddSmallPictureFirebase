const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.updateFirestoreWithResizedImage = functions.storage
  .onObjectFinalized({
    region: "europe-west3",
  }, async (event) => {
    const object = event.data;
    const bucket = admin.storage().bucket(object.bucket);
    
    const filePath = object.name;
    const contentType = object.contentType;

    if (!contentType || !contentType.startsWith("image/")) {
      console.log("Not an image");
      return null;
    }

    const pathParts = filePath.split("/");

    if (pathParts.length < 3) {
      console.log("Invalid file path: ", filePath);
      return null;
    }

    if (pathParts[2] !== "uploads") {
      console.log("File not in uploads folder");
      return null;
  }

    if (!filePath.includes("_64x64")) {
      console.log("Not resized image");
      return null;
    }

    const userId = pathParts[1];

    if (!userId) {
      console.log("No ID found in path: ", filePath);
      return null;
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.log("User not found in Firestore: ", userId);
      return null;
    }

    const userData = userSnap.data();
    const currentPhotoUrl = userData.photo_url;
    const cleanCurrentPhotoUrl = currentPhotoUrl.split("?")[0];

    const baseStorageUrl = `https://firebasestorage.googleapis.com/v0/b/${object.bucket}/o/`;
    const resizedFilePath = filePath.replace("_64x64", "");
    const resizedFilePathEncoded = encodeURIComponent(resizedFilePath); 

    const fullResizedPhotoUrl = `${baseStorageUrl}${resizedFilePathEncoded}`;
    
    if (cleanCurrentPhotoUrl !== fullResizedPhotoUrl) {
      console.log(`Resized image does not match photo_url.
        Current photo_url: ${cleanCurrentPhotoUrl}
        resized file path: ${fullResizedPhotoUrl}`);
      return null;
    }
    
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();

    if (!metadata.metadata || !metadata.metadata.firebaseStorageDownloadTokens) {
      console.log("No access token:", filePath);
      return null;
    }
  
    const accessToken = metadata.metadata.firebaseStorageDownloadTokens;
    const encodedFilePath = encodeURIComponent(filePath);
    const resizedPhotoUrl = `${baseStorageUrl}${encodedFilePath}?alt=media&token=${accessToken}`;
    
    await userRef.set({photo_url_small: resizedPhotoUrl}, {merge: true});

    console.log(
      `Updated user: ${userId} with resized image: ${resizedPhotoUrl}`,
    );
    return null;
  });