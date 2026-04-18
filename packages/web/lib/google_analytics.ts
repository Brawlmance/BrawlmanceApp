/* eslint-disable -- legacy analytics.js bootstrap; not worth strict typing */
export default function setupGoogleAnalytics(): void {
  if (typeof window === 'undefined') return
  ;(function (i: Window & Record<string, unknown>, s: Document, o: string, g: string, r: string, a?: HTMLScriptElement, m?: Element | null) {
    i.GoogleAnalyticsObject = r
    i[r] =
      i[r] ||
      function () {
        const fn = i[r] as { q?: unknown[] }
        ;(fn.q = fn.q || []).push(arguments)
      }
    const fn = i[r] as { l?: number }
    fn.l = 1 * new Date().getTime()
    a = s.createElement(o) as HTMLScriptElement
    m = s.getElementsByTagName(o)[0]
    a.async = true
    a.src = g
    m!.parentNode!.insertBefore(a, m)
  })(window as unknown as Window & Record<string, unknown>, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')

  ga('create', 'UA-67731642-1', 'auto')
  ga('send', 'pageview')
}
