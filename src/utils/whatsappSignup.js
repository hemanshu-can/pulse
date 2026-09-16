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

/** Backstop so a popup that never reports back can't hang the UI forever. */
const POPUP_TIMEOUT_MS = 120_000

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
 * Resolves with `{ code, businessId, wabaId, phoneNumberId }` once the owner
 * completes the flow, and rejects if they cancel, dismiss the popup, or the
 * flow errors.
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
        const session = { code: null, businessId: null, wabaId: null, phoneNumberId: null }
        let settled = false

        const timer = window.setTimeout(
          () => fail('WhatsApp signup timed out. Please try again.'),
          POPUP_TIMEOUT_MS,
        )
        const cleanup = () => {
          window.clearTimeout(timer)
          window.removeEventListener('message', onMessage)
        }
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

        // The code arrives via the FB.login callback and the identifiers via
        // the WA_EMBEDDED_SIGNUP message event, in either order. Resolve only
        // once both sources have landed.
        const maybeSucceed = () => {
          if (session.code && session.businessId && session.wabaId && session.phoneNumberId) succeed()
        }

        // Meta posts the business / WABA / phone number ids here on completion.
        function onMessage(event) {
          if (!isFacebookOrigin(event.origin)) return
          if (typeof event.data !== 'string') {
            // Debug: Meta posted a non-string payload — expected a JSON string.
            console.log('FB message dropped (non-string data)', { dataType: typeof event.data })
            return
          }

          let payload
          try {
            payload = JSON.parse(event.data)
          } catch {
            return
          }
          if (payload.type !== MESSAGE_TYPE) return

          // Debug with booleans only — the event data carries ids, not secrets.
          console.log('WA_EMBEDDED_SIGNUP event', {
            event: payload.event,
            hasBusinessId: Boolean(payload.data?.business_id),
            hasWabaId: Boolean(payload.data?.waba_id),
            hasPhoneNumberId: Boolean(payload.data?.phone_number_id),
          })

          // Success arrives as FINISH or one of FINISH_ONLY_WABA,
          // FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING, FINISH_OBO_MIGRATION,
          // FINISH_GRANT_ONLY_API_ACCESS — match the whole family.
          if (typeof payload.event === 'string' && payload.event.startsWith('FINISH')) {
            session.businessId = payload.data?.business_id ?? null
            session.wabaId = payload.data?.waba_id ?? null
            session.phoneNumberId = payload.data?.phone_number_id ?? null
            maybeSucceed()
          } else if (payload.event === 'CANCEL') {
            fail('WhatsApp connection was cancelled.')
          } else if (payload.event === 'ERROR') {
            fail(payload.data?.error_message ?? 'WhatsApp signup failed.')
          }
        }

        window.addEventListener('message', onMessage)

        FB.login(
          (response) => {
            // Debug with booleans only — the raw response carries tokens/codes.
            const hasCode = Boolean(response?.authResponse?.code)
            const hasAccessToken = Boolean(response?.authResponse?.accessToken)
            const hasSignedRequest = Boolean(response?.authResponse?.signedRequest)
            console.log('WA Embedded Signup response', { hasCode, hasAccessToken, hasSignedRequest })

            if (hasCode) {
              // Meta's documented source for the exchangeable code is the login
              // response (response.authResponse.code) — not signedRequest and
              // not the WA_EMBEDDED_SIGNUP message payload.
              session.code = response.authResponse.code
              console.log('WA Embedded Signup code received', {
                hasIdentifiers: Boolean(session.businessId && session.wabaId && session.phoneNumberId),
              })
              maybeSucceed()
            } else {
              // No code — distinguish a real dismissal from a login that
              // reported connected but returned nothing exchangeable.
              console.log('WA Embedded Signup login status', { status: response?.status })
              fail(
                response?.status === 'connected'
                  ? 'WhatsApp signup did not return an authorization code.'
                  : 'WhatsApp connection was cancelled.',
              )
            }
          },
          {
            config_id: META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            // sessionInfoVersion is required for Meta to post the
            // WA_EMBEDDED_SIGNUP message — v2 session logging is opt-in, so
            // without it the code arrives but the ids never do.
            extras: { setup: {}, sessionInfoVersion: '3' },
          },
        )
      }),
  )
}
