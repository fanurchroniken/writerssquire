import { useState } from 'react';
import type { Media, MediaReference } from '../../types/worldbuilding';
import {
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon,
  PlusIcon,
  XMarkIcon,
  StarIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface MediaGalleryProps {
  media: (Media | MediaReference)[];
  coverImage?: string;
  onAddMedia?: () => void;
  onRemoveMedia?: (mediaId: string) => void;
  onSetCover?: (mediaUrl: string) => void;
  editable?: boolean;
  compact?: boolean;
}

function getMediaIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return PhotoIcon;
    case 'video':
      return VideoCameraIcon;
    case 'audio':
      return MusicalNoteIcon;
    default:
      return DocumentIcon;
  }
}

function isVideo(url: string): boolean {
  return url.includes('youtube') || url.includes('vimeo') || url.match(/\.(mp4|webm|ogg)$/i) !== null;
}

function isDirectVideo(url: string): boolean {
  return url.match(/\.(mp4|webm|ogg)$/i) !== null;
}

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?\s]+)/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

export default function MediaGallery({
  media,
  coverImage,
  onAddMedia,
  onRemoveMedia,
  onSetCover,
  editable = false,
  compact = false,
}: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | MediaReference | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const getMediaUrl = (item: Media | MediaReference): string => {
    return 'url' in item ? item.url : (item as Media).url;
  };

  const getMediaThumbnail = (item: Media | MediaReference): string => {
    if ('thumbnail_url' in item && item.thumbnail_url) {
      return item.thumbnail_url;
    }
    const url = getMediaUrl(item);
    const ytThumb = getYoutubeThumbnail(url);
    if (ytThumb) return ytThumb;
    if (isDirectVideo(url)) return '';
    return url;
  };

  const isMediaVideo = (item: Media | MediaReference): boolean => {
    if ('file_type' in item) {
      return item.file_type === 'video';
    }
    return isVideo(getMediaUrl(item));
  };

  const openLightbox = (item: Media | MediaReference) => {
    setSelectedMedia(item);
    setLightboxOpen(true);
  };

  if (media.length === 0 && !editable) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
        {/* Cover Image First (if different from gallery) */}
        {coverImage && !media.some(m => getMediaUrl(m) === coverImage) && (
          <div
            className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox({ url: coverImage, thumbnail_url: coverImage } as MediaReference)}
          >
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">Cover</span>
            </div>
          </div>
        )}

        {/* Gallery Items */}
        {media.map((item, index) => {
          const url = getMediaUrl(item);
          const thumbnail = getMediaThumbnail(item);
          const isVid = isMediaVideo(item);
          const isCover = url === coverImage;
          const mediaId = 'id' in item ? item.id : 'media_id' in item ? item.media_id : `media-${index}`;

          const showVideoPreview = isVid && isDirectVideo(url) && !thumbnail;

          return (
            <div
              key={mediaId}
              className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(item)}
            >
              {showVideoPreview ? (
                <video
                  src={url}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : thumbnail ? (
                <img
                  src={thumbnail}
                  alt={('name' in item ? item.name : '') || `Media ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40">📷</text></svg>';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-500">
                  {isVid ? '🎬' : '📷'}
                </div>
              )}

              {/* Video Play Icon */}
              {isVid && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                  <PlayIcon className="w-12 h-12 text-white opacity-80" />
                </div>
              )}

              {/* Cover Badge */}
              {isCover && (
                <div className="absolute top-2 left-2">
                  <StarIconSolid className="w-5 h-5 text-amber-400" />
                </div>
              )}

              {/* Hover Actions */}
              {editable && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isCover && onSetCover && !isVid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetCover(url);
                      }}
                      className="p-2 bg-amber-500 rounded-full hover:bg-amber-400 transition-colors"
                      title="Set as cover"
                    >
                      <StarIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                  {onRemoveMedia && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMedia(mediaId);
                      }}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-400 transition-colors"
                      title="Remove"
                    >
                      <XMarkIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Media Button */}
        {editable && onAddMedia && (
          <button
            onClick={onAddMedia}
            className="aspect-square bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-gray-750 transition-colors text-gray-400 hover:text-amber-500"
          >
            <PlusIcon className="w-8 h-8" />
            <span className="text-xs">Add Media</span>
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {isMediaVideo(selectedMedia) ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {getMediaUrl(selectedMedia).includes('youtube') ? (
                  <iframe
                    src={getMediaUrl(selectedMedia).replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : getMediaUrl(selectedMedia).includes('vimeo') ? (
                  <iframe
                    src={getMediaUrl(selectedMedia).replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={getMediaUrl(selectedMedia)}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                )}
              </div>
            ) : (
              <img
                src={getMediaUrl(selectedMedia)}
                alt={('name' in selectedMedia ? selectedMedia.name : '') || 'Media'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}

            {/* Caption */}
            {('caption' in selectedMedia && selectedMedia.caption) && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-center">
                {selectedMedia.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
