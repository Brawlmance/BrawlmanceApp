declare global {
  interface Window {
    ga?: (...args: unknown[]) => void
    GoogleAnalyticsObject?: string
  }

  /** Classic analytics.js global set by setupGoogleAnalytics */
  function ga(...args: unknown[]): void
}

export {}
