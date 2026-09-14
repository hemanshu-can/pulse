/**
 * Meta WhatsApp Embedded Signup (Facebook Login for Business).
 *
 * Launches the hosted signup flow so an owner can connect their WhatsApp
 * Business Account without leaving PULSE. The flow returns a short-lived
 * `code` plus the WABA id and phone number id — the code must be exchanged
 * for an access token by a backend before any message can be sent.
 *
 * Config comes from Vite env vars (see .env.local):
 *   VITE_META_APP_ID     — Meta app id
 *   VITE_META_CONFIG_ID  — Embedded Signup configuration id
 */

const SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js'
const SDK_VERSION = 'v23.0'
const MESSAGE_TYPE = 'WA_EMBEDDED_SIGNUP'

export const META_APP_ID = import.meta.env.VITE_META_APP_ID ?? ''
export const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID ?? ''

export const isWhatsAppConfigured = () => Boolean(META_APP_ID && META_CONFIG_ID)

let sdkPromise

/** Loads and initialises the Facebook JS SDK once, then reuses it. */
export function loadFacebookSdk() {
  if (window.FB) return Promise.resolve(window.FB)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: SDK_VERSION,
      })
      resolve(window.FB)
    }

    const script = document.createElement('script')
    script.src = SDK_SRC
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      sdkPromise = undefined
      reject(new Error('Could not load the Facebook SDK. Check your network or ad blocker.'))
    }
    document.body.appendChild(script)
  })

  return sdkPromise
}

const isFacebookOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'facebook.com' || hostname.endsWith('.facebook.com')
  } catch {
    return false
  }
}

/**
 * Opens Meta's Embedded Signup popup.
 *
 * Resolves with `{ code, wabaId, phoneNumberId }` once the owner completes the
 * flow, and rejects if they cancel or the flow errors.
 */
export function launchWhatsAppSignup() {
  if (!isWhatsAppConfigured()) {
    return Promise.reject(
      new Error('WhatsApp signup is not configured — set VITE_META_APP_ID and VITE_META_CONFIG_ID.'),
    )
  }

  return loadFacebookSdk().then(
    (FB) =>
      new Promise((resolve, reject) => {
        const session = { code: null, wabaId: null, phoneNumberId: null }
        let settled = false

        const cleanup = () => window.removeEventListener('message', onMessage)
        const succeed = () => {
          if (settled) return
          settled = true
          cleanup()
          resolve({ ...session })
        }
        const fail = (message) => {
          if (settled) return
          settled = true
          cleanup()
          reject(new Error(message))
        }

        // Meta posts the WABA / phone number ids here once signup completes.
        function onMessage(event) {
          if (!isFacebookOrigin(event.origin) || typeof event.data !== 'string') return

          let payload
          try {
            payload = JSON.parse(event.data)
          } catch {
            return
          }
          if (payload.type !== MESSAGE_TYPE) return

          if (payload.event === 'FINISH') {
            session.wabaId = payload.data?.waba_id ?? null
            session.phoneNumberId = payload.data?.phone_number_id ?? null
            // The login callback carries the exchangeable code; resolve now if
            // it has already landed, otherwise let it settle the promise.
            if (session.code) succeed()
          } else if (payload.event === 'CANCEL') {
            fail('WhatsApp connection was cancelled.')
          } else if (payload.event === 'ERROR') {
            fail(payload.data?.error_message ?? 'WhatsApp signup failed.')
          }
        }

        window.addEventListener('message', onMessage)

        FB.login(
          (response) => {
            console.log('META FB.login RESPONSE:', response)
            if (response.authResponse?.code) {
              session.code = response.authResponse.code
              succeed()
            } else {
              fail('WhatsApp connection was cancelled.')
            }
          },
          {
            config_id: META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            extras: { setup: {} },
          },
        )
      }),
  )
}
