export const environment = {
  production: false,
  /**
   * Base origin for backend API calls, e.g. 'http://localhost:8090'.
   *
   * In development the app runs behind the Angular dev-server proxy
   * (proxy.conf.json), so the browser calls same-origin `/api/*` and the
   * proxy forwards to the gateway. In that case keep this empty string.
   * Set an absolute origin when serving without the proxy (or for prod).
   */
  apiUrl: '',
};
