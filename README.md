Cloud Function: **updateFirestoreWithResizedImage**
- Listens for new image uploads in Storage, checks if they are resized (_64x64), and updates the corresponding user’s Firestore document with the resized image URL.

I use it with Firebases own function: **"Resize Images"**

**Validates:**
- File is an image.
- Image is stored in the uploads folder.
- Image has been resized (_64x64).
- User exists in Firestore.

**Updates Firestore:**
- If the resized image matches the current photo_url, it updates the user’s document with a smaller photo_url_small.
