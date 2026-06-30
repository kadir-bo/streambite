import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Streambite',
  description: 'Community chat, voice and streaming',
}

// Temporary mobile debugging aid: paints uncaught errors directly onto the
// screen since iOS Safari has no accessible devtools without a Mac. Runs as
// a raw inline script (not a React component) so it still works even if the
// React tree itself fails to mount. Dev-only — remove once the mobile
// blank-screen issue is diagnosed.
const MOBILE_ERROR_OVERLAY_SCRIPT = `
(function () {
  function showError(msg) {
    var el = document.getElementById('__mobile_err_overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = '__mobile_err_overlay';
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.zIndex = '999999';
      el.style.background = 'rgba(20,0,0,0.95)';
      el.style.color = '#fff';
      el.style.padding = '16px';
      el.style.fontFamily = 'monospace';
      el.style.fontSize = '12px';
      el.style.overflow = 'auto';
      el.style.whiteSpace = 'pre-wrap';
      document.body.appendChild(el);
    }
    el.textContent += msg + '\\n\\n';
  }
  window.addEventListener('error', function (e) {
    showError('Error: ' + (e.message || e) + (e.filename ? ' @ ' + e.filename + ':' + e.lineno : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    showError('Unhandled rejection: ' + (r && r.stack ? r.stack : r));
  });
})();
`

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        {process.env.NODE_ENV !== 'production' && (
          <Script
            id="mobile-error-overlay"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: MOBILE_ERROR_OVERLAY_SCRIPT }}
          />
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
