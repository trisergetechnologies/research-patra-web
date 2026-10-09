const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

let accessToken = null;
let refreshPromise = null;
let onSessionExpired = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

export class ApiRequestError extends Error {
  constructor(status, data) {
    super(data?.message || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

async function parse(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
}

// Single-flight: a rotated refresh token can only be used once, so concurrent
// callers (and StrictMode double effects) must share the same request.
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        const data = await parse(res);
        if (!res.ok) throw new ApiRequestError(res.status, data);
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      onSessionExpired();
      throw new ApiRequestError(401, { message: 'Session expired, please sign in again' });
    }
    return api(path, { method, body, auth, retry: false });
  }

  const data = await parse(res);
  if (!res.ok) throw new ApiRequestError(res.status, data);
  return data;
}

export const authApi = {
  requestCode: (email) => api('/auth/otp/request', { method: 'POST', body: { email }, auth: false }),
  verifyCode: (email, code) => api('/auth/otp/verify', { method: 'POST', body: { email, code }, auth: false }),
  logout: () => api('/auth/logout', { method: 'POST', auth: false }),
  logoutAll: () => api('/auth/logout-all', { method: 'POST' }),
};

export const userApi = {
  me: () => api('/users/me'),
  updateMe: (data) => api('/users/me', { method: 'PATCH', body: data }),
};

const toQuery = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false)).toString();
  return qs ? `?${qs}` : '';
};

function xhrUpload(path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${path}`);
    xhr.withCredentials = true;
    if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data = null;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = { message: xhr.responseText };
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiRequestError(xhr.status, data));
    };
    xhr.onerror = () => reject(new ApiRequestError(0, { message: 'Network error, check your connection' }));
    xhr.send(formData);
  });
}

/** Multipart upload with progress; retries once after refreshing an expired access token. */
async function upload(path, formData, onProgress) {
  try {
    return await xhrUpload(path, formData, onProgress);
  } catch (err) {
    if (err.status !== 401) throw err;
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      onSessionExpired();
      throw new ApiRequestError(401, { message: 'Session expired, please sign in again' });
    }
    return xhrUpload(path, formData, onProgress);
  }
}

export const cmsApi = {
  stats: () => api('/cms/stats'),
  listSeries: () => api('/cms/series'),

  listPosts: (params) => api(`/cms/posts${toQuery(params)}`),
  getPost: (id) => api(`/cms/posts/${id}`),
  postHistory: (id, params) => api(`/cms/posts/${id}/history${toQuery(params)}`),
  createPost: (data) => api('/cms/posts', { method: 'POST', body: data }),
  updatePost: (id, data) => api(`/cms/posts/${id}`, { method: 'PATCH', body: data }),
  deletePost: (id, version) => api(`/cms/posts/${id}?version=${version}`, { method: 'DELETE' }),
  postAction: (id, action, body) => api(`/cms/posts/${id}/${action}`, { method: 'POST', body }),
  previewTicket: (id, target) => api(`/cms/posts/${id}/preview-ticket`, { method: 'POST', body: { target } }),
  startPlagiarism: (id) => api(`/cms/posts/${id}/plagiarism`, { method: 'POST' }),
  getPlagiarism: (id) => api(`/cms/posts/${id}/plagiarism`),
  getReview: (id) => api(`/cms/posts/${id}/review`),
  addComment: (id, data) => api(`/cms/posts/${id}/comments`, { method: 'POST', body: data }),
  updateComment: (id, cid, data) => api(`/cms/posts/${id}/comments/${cid}`, { method: 'PATCH', body: data }),
  deleteComment: (id, cid) => api(`/cms/posts/${id}/comments/${cid}`, { method: 'DELETE' }),
  replyComment: (id, cid, body) => api(`/cms/posts/${id}/comments/${cid}/replies`, { method: 'POST', body: { body } }),

  mediaRules: () => api('/cms/media/rules'),
  listMedia: (params) => api(`/cms/media${toQuery(params)}`),
  uploadMedia: ({ file, slot, alt }, onProgress) => {
    const fd = new FormData();
    fd.append('slot', slot);
    fd.append('alt', alt);
    fd.append('file', file);
    return upload('/cms/media', fd, onProgress);
  },
  updateMedia: (id, data) => api(`/cms/media/${id}`, { method: 'PATCH', body: data }),
  mediaUsage: (id) => api(`/cms/media/${id}/usage`),
  deleteMedia: (id) => api(`/cms/media/${id}`, { method: 'DELETE' }),

  listCategories: (params) => api(`/cms/categories${toQuery(params)}`),
  createCategory: (data) => api('/cms/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) => api(`/cms/categories/${id}`, { method: 'PATCH', body: data }),
  deleteCategory: (id) => api(`/cms/categories/${id}`, { method: 'DELETE' }),

  listTags: (params) => api(`/cms/tags${toQuery(params)}`),
  createTag: (data) => api('/cms/tags', { method: 'POST', body: data }),
  updateTag: (id, data) => api(`/cms/tags/${id}`, { method: 'PATCH', body: data }),
  mergeTag: (id, into) => api(`/cms/tags/${id}/merge`, { method: 'POST', body: { into } }),
  deleteTag: (id) => api(`/cms/tags/${id}`, { method: 'DELETE' }),

  myAuthor: () => api('/cms/authors/me'),
  updateMyAuthor: (data) => api('/cms/authors/me', { method: 'PATCH', body: data }),
  submitMyAuthor: () => api('/cms/authors/me/submit', { method: 'POST' }),
  removeMyAuthor: () => api('/cms/authors/me/remove', { method: 'POST' }),
  listAuthors: () => api('/cms/authors'),
  updateAuthor: (id, data) => api(`/cms/authors/${id}`, { method: 'PATCH', body: data }),
  approveAuthor: (id) => api(`/cms/authors/${id}/approve`, { method: 'POST' }),
  rejectAuthor: (id, note) => api(`/cms/authors/${id}/reject`, { method: 'POST', body: { note } }),
  removeAuthor: (id) => api(`/cms/authors/${id}/remove`, { method: 'POST' }),
  restoreAuthor: (id) => api(`/cms/authors/${id}/restore`, { method: 'POST' }),
};

/** First field-level message if the API returned one, else the general message. */
export const errorMessage = (err) => err?.data?.details?.[0]?.message || err?.message || 'Something went wrong';

export const adminApi = {
  listUsers: (params = {}) => api(`/admin/users${toQuery(params)}`),
  listSubscribers: (params = {}) => api(`/admin/subscribers${toQuery(params)}`),
  createUser: (data) => api('/admin/users', { method: 'POST', body: data }),
  updateUser: (id, data) => api(`/admin/users/${id}`, { method: 'PATCH', body: data }),
};
