import { useState } from "react";
import { useReveal } from "../hooks/useReveal.js";
import { VideoTile, Lightbox } from "../components/VideoTile.jsx";
import { FASHION_VIDEOS } from "../data/media.js";
import { IconPlay } from "../components/Icons.jsx";

const TAGS = ["All", ...new Set(FASHION_VIDEOS.map((v) => v.tag))];

export default function VideosPage() {
  const [active, setActive] = useState("All");
  const [playing, setPlaying] = useState(null);
  const revealRef = useReveal([active]);

  const list = active === "All" ? FASHION_VIDEOS : FASHION_VIDEOS.filter((v) => v.tag === active);

  return (
    <div ref={revealRef}>
      {/* header */}
      <section className="collection-banner" style={{ height: 300 }}>
        <div
          className="banner-fallback"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80&auto=format&fit=crop)",
          }}
        />
        <div className="collection-banner-content container">
          <h1>Fashion Films</h1>
          <p>Eight short films from the VASTRA studio — hover to preview, click to watch in full.</p>
        </div>
      </section>

      <section className="section container">
        {/* tag filter */}
        <div className="toolbar" style={{ justifyContent: "center" }}>
          <div className="toolbar-chips">
            {TAGS.map((t) => (
              <button key={t} className={`chip ${active === t ? "active" : ""}`} onClick={() => setActive(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* grid */}
        <div className="videos-grid">
          {list.map((v, i) => (
            <div className={v.orientation === "landscape" ? "reveal-zoom" : "reveal"} key={v.id} style={{ transitionDelay: `${(i % 4) * 0.06}s` }}>
              <VideoTile video={v} onOpen={setPlaying} />
            </div>
          ))}
        </div>

        {/* note */}
        <div className="panel reveal" style={{ marginTop: 40, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span className="usp-icon" style={{ width: 52, height: 52 }}><IconPlay size={22} /></span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ marginBottom: 4 }}>Shot in our atelier</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.93rem" }}>
              Every film is filmed on location with the actual pieces you can shop — no renders, no studio tricks.
              See the drape, the stitching and the movement before you buy.
            </p>
          </div>
        </div>
      </section>

      <Lightbox video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}
