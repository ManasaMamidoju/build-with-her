import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/** Renders an Instagram post/reel inline. Falls back to a plain link until embed.js loads. */
export function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    const process = () => window.instgrm?.Embeds.process();

    if (window.instgrm) {
      process();
      return undefined;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-instagram-embed]");
    if (existing) {
      existing.addEventListener("load", process);
      return () => existing.removeEventListener("load", process);
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.dataset["instagramEmbed"] = "true";
    script.addEventListener("load", process);
    document.body.appendChild(script);
    return undefined;
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ background: "#FFF", border: 0, margin: "0 auto", maxWidth: 540, width: "100%" }}
    >
      <a href={url} target="_blank" rel="noreferrer">
        Watch the interview on Instagram
      </a>
    </blockquote>
  );
}
