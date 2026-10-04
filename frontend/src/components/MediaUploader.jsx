import React, { useRef, useState } from 'react';
import { UploadCloud, X, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadMedia } from '../api/client';

export default function MediaUploader({ mediaUrls = [], onChange }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const newUrls = [...mediaUrls];

    try {
      for (const file of Array.from(files)) {
        const result = await uploadMedia(file);
        newUrls.push(result.url);
      }
      onChange(newUrls);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.detail || 'Failed to upload media file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = mediaUrls.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 ${
          isUploading
            ? 'border-neutral-700 bg-neutral-900/50 cursor-wait'
            : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/40 hover:bg-neutral-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/quicktime"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-200" />
            <span>Uploading media asset...</span>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-200">
                Click or drag & drop media to attach
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                PNG, JPG, GIF, WebP, or MP4 (Max 4 images for X)
              </p>
            </div>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 px-3 py-1.5 rounded-lg">
          {uploadError}
        </p>
      )}

      {/* Media Thumbnails Grid */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 pt-1">
          {mediaUrls.map((url, index) => {
            const isVideo = url.endsWith('.mp4') || url.endsWith('.mov');
            return (
              <div
                key={index}
                className="group relative aspect-video bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800"
              >
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-400">
                    <Film className="w-6 h-6" />
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover"
                  />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove asset"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
