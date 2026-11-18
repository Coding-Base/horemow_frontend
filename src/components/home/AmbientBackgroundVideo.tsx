import { useEffect, useState } from "react";

export default function AmbientBackgroundVideo() {
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("home-hero");
    if (!hero) {
      setHeroVisible(false);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      setHeroVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-1000 ${
        heroVisible ? "opacity-100" : "opacity-15"
      }`}
    >
      <video
        autoPlay
        className="size-full object-cover"
        data-testid="home-background-video"
        loop
        muted
        playsInline
        preload="auto"
        src="/video.mp4"
      />
      <div className="absolute inset-0 bg-[#071523]/35" />
    </div>
  );
}
