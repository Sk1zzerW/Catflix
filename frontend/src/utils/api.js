function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split(';') : []

  for (let cookie of cookies) {
    cookie = cookie.trim()

    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }

  return null
}

export async function apiFetch(url, options = {}) {
  const csrfToken = getCookie('csrftoken')

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...(options.headers || {}),
    },
  })
}