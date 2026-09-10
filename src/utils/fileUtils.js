/* Small browser file helpers shared by import/export features. */

export function download(name, text, mime = 'text/csv') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function buildCsvTemplate() {
  const headers = ['name', 'email', 'phone', 'company', 'status', 'source']
  const example = ['Meera Shah', 'meera.shah@example.com', '+91 98100 12345', 'Meridian Estates', 'active', 'Referral']
  return [headers, example].map((r) => r.join(',')).join('\n')
}
