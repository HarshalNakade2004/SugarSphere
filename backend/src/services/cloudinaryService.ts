import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export const cloudinaryService = {
  async uploadImage(
    buffer: Buffer,
    folder: string = 'sweets',
    options: Record<string, unknown> = {}
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `sugarsphere/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto:good' },
            ],
            ...options,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
              });
            }
          }
        )
        .end(buffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },

  getTransformedUrl(
    url: string,
    transformations: { width?: number; height?: number; crop?: string }
  ): string {
    const { width, height, crop = 'fill' } = transformations;
    
    // Insert transformation into Cloudinary URL
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    const transformation = `w_${width || 300},h_${height || 300},c_${crop}`;
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  },
};
