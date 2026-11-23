import RNFS from 'react-native-fs';

/**
 * Copy a picked image to permanent app storage
 * @param sourceUri - The temporary URI from the image picker
 * @param filename - Optional custom filename
 * @returns The permanent file path
 */
export const copyImageToPermanentStorage = async (
    sourceUri: string,
    filename?: string
): Promise<string> => {
    try {
        // Create a permanent directory for custom backgrounds
        const customBgDir = `${RNFS.DocumentDirectoryPath}/custom_backgrounds`;

        // Ensure directory exists
        const dirExists = await RNFS.exists(customBgDir);
        if (!dirExists) {
            await RNFS.mkdir(customBgDir);
        }

        // Generate filename if not provided
        const finalFilename = filename || `bg_${Date.now()}.jpg`;
        const destPath = `${customBgDir}/${finalFilename}`;

        // Copy file to permanent location
        await RNFS.copyFile(sourceUri, destPath);

        console.log('[copyImageToPermanentStorage] Copied to:', destPath);
        return `file://${destPath}`;
    } catch (error) {
        console.error('[copyImageToPermanentStorage] Error:', error);
        throw error;
    }
};

/**
 * Check if a file URI is valid and accessible
 * @param uri - The file URI to check
 * @returns true if file exists and is accessible
 */
export const isFileUriValid = async (uri: string): Promise<boolean> => {
    try {
        if (!uri) return false;

        // Remove file:// prefix if present
        const path = uri.replace('file://', '');
        const exists = await RNFS.exists(path);

        console.log('[isFileUriValid]', { uri, exists });
        return exists;
    } catch (error) {
        console.error('[isFileUriValid] Error:', error);
        return false;
    }
};

/**
 * Delete a custom background file
 * @param uri - The file URI to delete
 */
export const deleteCustomBackgroundFile = async (uri: string): Promise<void> => {
    try {
        const path = uri.replace('file://', '');
        const exists = await RNFS.exists(path);

        if (exists) {
            await RNFS.unlink(path);
            console.log('[deleteCustomBackgroundFile] Deleted:', path);
        }
    } catch (error) {
        console.error('[deleteCustomBackgroundFile] Error:', error);
    }
};
