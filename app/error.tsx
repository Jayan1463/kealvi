"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="workspace"><section className="empty-state" role="alert">
    <h1>We couldn’t load your workspace</h1>
    <p>The data service may be temporarily unavailable. Try again in a moment.</p>
    <button className="primary-button" onClick={reset}>Try again</button>
  </section></main>;
}
