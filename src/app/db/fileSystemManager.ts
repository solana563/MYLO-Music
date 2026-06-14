import { db } from './database';

export class FileSystemManager {
  /**
   * Request access to a local directory
   */
  async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      return dirHandle;
    } catch (error) {
      console.error('Directory access denied:', error);
      return null;
    }
  }

  /**
   * Scan directory for audio files
   */
  async scanDirectory(
    dirHandle: FileSystemDirectoryHandle,
    onProgress?: (count: number) => void
  ): Promise<File[]> {
    const audioFiles: File[] = [];
    const audioExtensions = [
      '.mp3',
      '.wav',
      '.flac',
      '.m4a',
      '.aac',
      '.ogg',
      '.wma'
    ];

    const scanFolder = async (handle: FileSystemDirectoryHandle) => {
      for await (const [name, entry] of (handle as any).entries()) {
        if (entry.kind === 'file') {
          const isAudio = audioExtensions.some(ext =>
            name.toLowerCase().endsWith(ext)
          );
          if (isAudio) {
            const file = await entry.getFile();
            audioFiles.push(file);
            onProgress?.(audioFiles.length);
          }
        } else if (entry.kind === 'directory') {
          // Recursively scan subdirectories
          await scanFolder(entry);
        }
      }
    };

    await scanFolder(dirHandle);
    return audioFiles;
  }

  /**
   * Get file from directory
   */
  async getFile(
    dirHandle: FileSystemDirectoryHandle,
    filePath: string
  ): Promise<File | null> {
    try {
      const pathParts = filePath.split('/');
      let currentHandle: any = dirHandle;

      for (let i = 0; i < pathParts.length - 1; i++) {
        currentHandle = await currentHandle.getDirectoryHandle(
          pathParts[i]
        );
      }

      const fileHandle = await currentHandle.getFileHandle(
        pathParts[pathParts.length - 1]
      );
      return await fileHandle.getFile();
    } catch (error) {
      console.error('Failed to get file:', error);
      return null;
    }
  }

  /**
   * Save directory permission for persistence
   */
  async saveDirectoryPermission(dirHandle: FileSystemDirectoryHandle): Promise<void> {
    try {
      // Persist permission using IndexedDB
      const folder = {
        path: (dirHandle as any).name,
        name: (dirHandle as any).name,
        dateAdded: new Date(),
        fileCount: 0,
        lastScanned: new Date()
      };
      await db.libraryFolders.add(folder);
    } catch (error) {
      console.error('Failed to save directory permission:', error);
    }
  }

  /**
   * Load saved directory handles
   */
  async getSavedDirectories(): Promise<any[]> {
    return await db.libraryFolders.toArray();
  }
}

export default FileSystemManager;
