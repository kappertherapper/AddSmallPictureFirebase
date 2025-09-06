Cloud Function: **updateFirestoreWithResizedImage**
- Listens for new image uploads in Storage, checks if they are resized, and updates the corresponding user’s Firestore document with the resized image URL.

I use it together with Firebases own function: **"Resize Images"** which resized all pictures in a custom size and puts in behind the name (image_64x64).

**Validates:**
- File is an image.
- Image is stored in the uploads folder.
- Image has been resized.
- User exists in Firestore.

**Updates Firestore:**
- If the resized image matches the current photo_url, it updates the user’s document with the field photo_url_small and puts the image there.
