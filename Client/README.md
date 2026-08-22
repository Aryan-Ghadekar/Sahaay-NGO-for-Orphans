# Sahaay — Web

React + Vite frontend for Sahaay (Supporting Orphans, Building Futures). This
replaces the earlier static/design-canvas prototype (`Sahaay.dc.html`) with a
real, buildable React app.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
```

## Folder structure

```
src/
  api/
    client.js         one fetch wrapper every request goes through
    endpoints/         one file per resource (auth, donor, volunteer, staff, admin, publicSite)
    mockData/           the data endpoints return until a real backend exists
  context/
    AuthContext.jsx     current user + role
  hooks/
    useFetch.js          loading/error/data for any endpoint function
    useCountUp.js        animated number-climb for stats
    useReveal.js          scroll-into-view detection
  components/
    layout/              Header (logo + nav, merged for every route), Footer,
                          Logo, DashboardLayout
    common/               Button/Card styles live in styles/global.css; JS
                          components here are StatCard, Sidebar, ImagePlaceholder,
                          Reveal, AsyncState (Loader/ErrorState)
    sections/             marketing-page building blocks (Hero, AboutSection,
                          StorySection, …)
  constants/
    roles.js              role ids, display labels, and dashboard paths —
                          single source of truth for Login, Header, AppRoutes
  pages/
    public/               Home, Login, NotFound
    donor/ volunteer/ staff/ admin/   one dashboard page per role
  routes/
    AppRoutes.jsx         the route table
    ProtectedRoute.jsx    gates a dashboard route by auth + role
  styles/
    theme.css             design tokens (colors, radii, shadows, fonts)
    global.css             resets + shared classes (.btn, .card, .table, .tag …)
```

## Connecting a real backend

The mock/real switch lives in one place: `src/api/client.js`.

1. Set `VITE_API_BASE_URL` in `.env` (copy `.env.example`) to your API's origin.
2. Set `VITE_USE_MOCKS=false`.
3. Each function in `src/api/endpoints/*.js` already has the real `apiClient.get/post(...)`
   call written next to the mock branch — just confirm the path matches your
   API and remove the mock branch once it's live. No component code changes:
   pages call the endpoint functions, never `fetch` directly.

`AuthContext` (`src/context/AuthContext.jsx`) already awaits `login`/`logout`
as real network calls, and `role` is derived from the logged-in `user`
object rather than settable independently — wire a real session
cookie/token into `login`/`logout` and the rest of the app doesn't change.

`/donor`, `/volunteer`, `/staff`, `/admin` are already gated by
`ProtectedRoute` (`src/routes/ProtectedRoute.jsx`): an unauthenticated visit
redirects to `/login`, and a logged-in user of the wrong role is redirected
home rather than shown a dashboard that isn't theirs.

## Notes

- There is no session persistence yet (no cookie/localStorage) — a hard
  page reload logs the demo session out, since `AuthContext`'s user lives
  only in memory. Add persistence alongside the real backend integration.
- The role picker on the Login page is a stand-in for real credential-based
  auth — once a backend exists, the role comes back from `/api/auth/login`
  with the account, it isn't chosen at sign-in.
- Photos are placeholders (`ImagePlaceholder`) — swap for `<img>` once a
  media/CMS source exists per section.
