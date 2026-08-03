"use client";
import { useEffect } from "react";
import { CONSENT_KEY } from "@/components/operations/consent-manager";

export function AnalyticsTracker({ siteSlug }: { siteSlug: string }) {
  useEffect(() => {
    let sent = false;
    const send = () => {
      if (sent || localStorage.getItem(CONSENT_KEY) !== "all") return;
      sent = true;
      let session = localStorage.getItem("vexora-analytics-session");
      if (!session) {
        session = crypto.randomUUID();
        localStorage.setItem("vexora-analytics-session", session);
      }
      let referrerHost = "";
      try {
        referrerHost = document.referrer
          ? new URL(document.referrer).hostname
          : "";
      } catch {}
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteSlug,
          eventName: "page_view",
          path: location.pathname,
          referrerHost,
          sessionId: session,
          viewport: `${innerWidth}x${innerHeight}`,
        }),
        keepalive: true,
      });
    };
    send();
    const onConsent = () => send();
    window.addEventListener("vexora-consent", onConsent);
    return () => window.removeEventListener("vexora-consent", onConsent);
  }, [siteSlug]);
  return null;
}
