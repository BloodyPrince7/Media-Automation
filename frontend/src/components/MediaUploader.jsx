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
        className={`border-2 border-dashed border-[#111116] rounded-2xl p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 ${
          isUploading
            ? 'bg-[#fef7e6] cursor-wait'
            : 'bg-[#fdfaf3] hover:bg-[#fef7e6] hover:shadow-[3px_3px_0px_#111116]'
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
          <div className="flex items-center gap-2 text-xs font-display font-bold text-[#111116]">
            <Loader2 className="w-4 h-4 animate-spin text-[#6a6afe]" />
            <span>Uploading photo asset...</span>
          </div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-[#ffe400] border-2 border-[#111116] flex items-center justify-center text-[#111116] shadow-[2px_2px_0px_#111116]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-display font-bold text-[#111116]">
                Click or drag & drop media attachments
              </p>
              <p className="text-[11px] text-[#111116]/60 font-medium">
                PNG, JPG, GIF, WebP (Analyzed automatically for contextual captioning)
              </p>
            </div>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-[#b71c1c] bg-[#ffebee] border-2 border-[#111116] px-3 py-1.5 rounded-xl font-medium shadow-[2px_2px_0px_#111116]">
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
                className="group relative aspect-video bg-white rounded-xl overflow-hidden border-2 border-[#111116] shadow-[2px_2px_0px_#111116]"
              >
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#111116] text-white">
                    <Film className="w-5 h-5" />
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
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#f9665f] border border-[#111116] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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
