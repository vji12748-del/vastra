import { useRef, useState } from "react";
import { IconPlay, IconX } from "./Icons.jsx";

/** Video tile with hover-to-play preview; click opens lightbox */
export function VideoTile({ video, onOpen }) {
  const vidRef = useRef(null);

  const enter = () => {
    const v = vidRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const leave = () => {
    const v = vidRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <div
      className={`video-tile ${video.orientation === "landscape" ? "land" : ""}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={() => onOpen(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(video)}
      aria-label={`Play video: ${video.title}`}
    >
      <img src={video.poster} alt={video.title} loading="lazy" />
      <video ref={vidRef} src={video.url} muted loop playsInline preload="none" />
      <span className="video-tag">{video.tag}</span>
      <span className="video-play"><IconPlay /></span>
      <div className="video-meta">
        <h4>{video.title}</h4>
        <p>{video.desc}</p>
      </div>
    </div>
  );
}

/** Fullscreen lightbox video player */
export function Lightbox({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={video.title}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close player"><IconX size={22} /></button>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <video src={video.url} poster={video.poster} controls autoPlay playsInline />
        <div className="lightbox-title">{video.title} — {video.desc}</div>
      </div>
    </div>
  );
}
