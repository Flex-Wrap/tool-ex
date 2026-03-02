import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user's ID
 * @param type - Type of image (e.g., 'tool', 'profile')
 * @returns Promise with the download URL
 */
export const uploadImage = async (
  file: File,
  userId: string,
  type: 'tool' | 'profile' | 'neighbourhood'
): Promise<string> => {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${file.name.split('.')[0]}_${timestamp}`;
    const fileExtension = file.name.split('.').pop();
    
    // Create storage path: /images/{type}/{userId}/{filename}
    const storagePath = `images/${type}/${userId}/${filename}.${fileExtension}`;
    const fileRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The download URL of the image
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the storage path from the download URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf('/images%2F');
    const endIndex = decodedUrl.indexOf('?');
    
    if (startIndex === -1) {
      throw new Error('Invalid image URL');
    }
    
    const storagePath = decodedUrl.substring(startIndex + 1, endIndex);
    const fileRef = ref(storage, storagePath);
    
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
