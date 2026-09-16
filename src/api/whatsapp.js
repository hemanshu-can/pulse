import { request } from './client.js'

const EMBEDDED_SIGNUP_PATH = '/api/v1/whatsapp/embedded-signup'

/**
 * Completes WhatsApp Embedded Signup.
 *
 * The backend exchanges the single-use `code` for a business token, subscribes
 * the app to the WABA, registers the phone number, and persists the account.
 * Reconnect/retry uses this same call — the backend reuses the stored PIN.
 *
 * Call this immediately after the signup popup signals FINISH: the code is
 * single-use and expires ~30 seconds after the popup closes.
 */
export function completeEmbeddedSignup({ businessId, wabaId, phoneNumberId, code }) {
  return request(EMBEDDED_SIGNUP_PATH, {
    method: 'POST',
    body: { businessId, wabaId, phoneNumberId, code },
  })
}
