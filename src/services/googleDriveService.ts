// Google Drive API Integration Service for Veronica Vault

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  capabilities?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canRename?: boolean;
  };
}

export const requestGoogleDriveToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const initGisClient = () => {
      try {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services library not available'));
          return;
        }
        const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '418724110726-applet.apps.googleusercontent.com';
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
          callback: (response: any) => {
            if (response.error) {
              reject(response);
            } else if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('No access token received from Google'));
            }
          },
          error_callback: (err: any) => {
            reject(err);
          },
        });
        client.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    };

    if (window.google?.accounts?.oauth2) {
      initGisClient();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGisClient();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services library'));
      document.head.appendChild(script);
    }
  });
};

export class GoogleDriveService {
  private static accessToken: string | null = null;

  static setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  static getAccessToken(): string | null {
    return this.accessToken;
  }

  static isConnected(): boolean {
    return !!this.accessToken;
  }

  // List files and folders in Google Drive
  static async listFiles(
    folderId: string = 'root',
    searchQuery: string = ''
  ): Promise<{ files: GoogleDriveFile[]; readOnly: boolean }> {
    if (!this.accessToken) {
      throw new Error('Google Drive is not connected. Please authorize Google Drive first.');
    }

    let q = `'${folderId}' in parents and trashed = false`;
    if (searchQuery.trim()) {
      q = `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed = false`;
    }

    const fields = 'files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink, capabilities)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=100&orderBy=folder,name`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.accessToken = null;
        throw new Error('Google Drive authentication expired. Please reconnect.');
      }
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }

    const data = await response.json();
    const files: GoogleDriveFile[] = data.files || [];

    // Check permissions level from capabilities
    const hasEditPermission = files.some(
      (f) => f.capabilities?.canEdit !== false
    );

    return {
      files,
      readOnly: !hasEditPermission && files.length > 0,
    };
  }

  // Create folder in Google Drive
  static async createFolder(name: string, parentFolderId: string = 'root'): Promise<GoogleDriveFile> {
    if (!this.accessToken) throw new Error('Google Drive not connected');

    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      throw new Error(`Failed to create folder on Google Drive: ${res.statusText}`);
    }

    return await res.json();
  }

  // Upload file to Google Drive
  static async uploadFile(
    file: File,
    parentFolderId: string = 'root',
    onProgress?: (percent: number) => void
  ): Promise<GoogleDriveFile> {
    if (!this.accessToken) throw new Error('Google Drive not connected');

    const metadata = {
      name: file.name,
      parents: [parentFolderId],
    };

    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append('file', file);

    if (onProgress) onProgress(20);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: formData,
      }
    );

    if (onProgress) onProgress(100);

    if (!res.ok) {
      throw new Error(`Failed to upload file to Google Drive: ${res.statusText}`);
    }

    return await res.json();
  }

  // Download file content blob from Google Drive
  static async downloadFileBlob(fileId: string): Promise<Blob> {
    if (!this.accessToken) throw new Error('Google Drive not connected');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download Google Drive file: ${res.statusText}`);
    }

    return await res.blob();
  }

  // Rename file on Google Drive
  static async renameFile(fileId: string, newName: string): Promise<void> {
    if (!this.accessToken) throw new Error('Google Drive not connected');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });

    if (!res.ok) {
      throw new Error(`Failed to rename file on Google Drive: ${res.statusText}`);
    }
  }

  // Move file on Google Drive
  static async moveFile(fileId: string, addParents: string, removeParents: string): Promise<void> {
    if (!this.accessToken) throw new Error('Google Drive not connected');

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${addParents}&removeParents=${removeParents}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to move file on Google Drive: ${res.statusText}`);
    }
  }

  // Delete file from Google Drive (Requires explicit user confirmation before calling)
  static async deleteFile(fileId: string): Promise<void> {
    if (!this.accessToken) throw new Error('Google Drive not connected');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete file from Google Drive: ${res.statusText}`);
    }
  }
}
