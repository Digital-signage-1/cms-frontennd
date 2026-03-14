# Power BI Integration

Complete documentation for the Power BI integration in the Digital Signage CMS platform.

## Overview

The platform supports embedding Power BI content (reports, dashboards) into digital signage layouts via the official `powerbi-client` JS SDK with OAuth2 authentication through Microsoft, plus a simpler iframe-based path for public "Publish to Web" URLs.

---

## Supported App Types

| App Type | Description | Auth Required |
|---|---|---|
| `powerbi_report` | Full SDK-embedded Power BI Report with page rotation, filter pane control | Yes (Microsoft OAuth) |
| `powerbi_dashboard` | Full SDK-embedded Power BI Dashboard | Yes (Microsoft OAuth) |
| `powerbi_url` | Simple iframe embed for "Publish to Web" public URLs | No |

---

## Configuration Options

### `powerbi_report`

| Field | Type | Default | Description |
|---|---|---|---|
| `integration_id` | `string` | *required* | Links to a connected Microsoft OAuth integration |
| `workspace_id` | `string` | *required* | Power BI workspace GUID |
| `report_id` | `string` | *required* | Report GUID |
| `show_filter_pane` | `boolean` | `false` | Show/hide the filter side panel |
| `show_nav_pane` | `boolean` | `false` | Show/hide the page navigation bar |
| `auto_rotate_pages` | `boolean` | `true` | Auto-cycle through report pages |
| `page_duration` | `number` | `15` | Seconds per page when rotating |
| `theme` | `'dark' \| 'light'` | `'dark'` | Background color for loading/error states |
| `refresh_interval` | `number` | `30` | Minutes between token refreshes (iframe path only) |

### `powerbi_dashboard`

| Field | Type | Default | Description |
|---|---|---|---|
| `integration_id` | `string` | *required* | Links to a connected Microsoft OAuth integration |
| `workspace_id` | `string` | *required* | Power BI workspace GUID |
| `dashboard_id` | `string` | *required* | Dashboard GUID |
| `theme` | `'dark' \| 'light'` | `'dark'` | Background color for loading/error states |
| `refresh_interval` | `number` | `30` | Minutes between token refreshes (iframe path only) |

### `powerbi_url`

| Field | Type | Default | Description |
|---|---|---|---|
| `embed_url` | `string` | *required* | "Publish to Web" public URL |
| `theme` | `'dark' \| 'light'` | `'dark'` | Background color for empty states |
| `refresh_interval` | `number` | `30` | Minutes between iframe reloads |

---

## Architecture

### Rendering Pipeline

```
ContentRenderer
  └─ detects powerbi_report / powerbi_dashboard in INTEGRATION_DATA_TYPES
  └─ calls useIntegrationAppData() to fetch embed URL + token from backend
  └─ injects fetched data as config._data
  └─ renders PowerBIReportRenderer / PowerBIDashboardRenderer / PowerBIURLRenderer
```

### Dual Render Paths (Report & Dashboard)

Both `PowerBIReportRenderer` and `PowerBIDashboardRenderer` support two rendering modes:

**SDK Path** (preferred — used when `powerbi-client` is available and an embed token exists):
- Dynamically imports `powerbi-client` via `usePowerBIEmbed` hook
- Embeds into a `<div>` managed by the SDK's `Service.embed()` method
- Token refresh via `setAccessToken()` — no re-embed flicker
- Transparent background mode
- Report-specific: filter pane, nav pane, page rotation, starting page selection

**Iframe Fallback** (used when SDK is unavailable or no embed token):
- Renders a plain `<iframe>` with the embed URL
- Query params appended for filter/nav pane control
- Periodic iframe remount for token refresh
- Compatible with Chrome 38+ (Smart TV players)

### `usePowerBIEmbed` Hook

Central hook managing the Power BI JS SDK lifecycle.

**Returns:**
| Value | Type | Description |
|---|---|---|
| `sdkAvailable` | `boolean` | `true` once `powerbi-client` loaded successfully |
| `sdkLoading` | `boolean` | `true` while the dynamic import is in flight |
| `loaded` | `boolean` | `true` after the SDK `'loaded'` event fires (report ready for API calls) |
| `containerRef` | `RefObject` | Attach to a `<div>` — SDK renders into it |
| `reportRef` | `MutableRefObject` | The raw SDK embed object for `getPages()` / `setPage()` |

**Key behaviors:**
- Module-level singleton: the `import('powerbi-client')` is attempted only once per page lifecycle
- One `Service` instance per hook instance
- Re-embed is skipped if already embedded — calls `setAccessToken` instead
- Cleanup via `service.reset()` on unmount

---

## Page Auto-Rotation

When a Power BI Report has multiple pages and `auto_rotate_pages` is enabled:

1. Waits for the SDK `'loaded'` event to fire (report fully ready)
2. Calls `report.getPages()` to retrieve all pages
3. Filters to visible pages only (excludes hidden pages where `visibility === 1`)
4. Starts an interval timer every `page_duration` seconds
5. On each tick, navigates to the next page via `report.setPage(pageName)`
6. Wraps around to page 1 after the last page
7. Displays a page indicator overlay in the bottom-right corner (e.g., `2 / 6`)
8. Cleans up the interval on unmount or when config changes

If the report has only 1 visible page, no rotation occurs and no indicator is shown.

---

## Microsoft OAuth Flow

### Connection Flow

1. User clicks "Connect Microsoft Account" in the integrations panel or inline in the app creation form
2. `MicrosoftOAuthButton` calls `POST /api/v1/workspaces/{wid}/integrations/oauth/init?provider=powerbi&redirect_uri=...`
3. Backend returns a Microsoft authorization URL
4. Browser redirects to Microsoft login
5. After consent, Microsoft redirects back to `/integrations/microsoft/callback`
6. `MicrosoftOAuthCallbackPage` reads `code` and `state` from URL params
7. Calls `POST /api/v1/workspaces/{wid}/integrations/oauth/callback?provider=powerbi` with `{ code, state, redirect_uri }`
8. Backend exchanges the code for tokens and creates/updates the Integration record
9. UI shows success state with a link back to the integrations page

### Token Types

| Token Type | Value | Description |
|---|---|---|
| `embed` | `models.TokenType.Embed` | Server-side `GenerateToken` embed token (requires service principal or Pro license) |
| `aad` | `models.TokenType.Aad` | User's OAuth access token passed directly |

---

## Dashboard UI Components

### `PowerBIResourcePicker`

A browsable resource picker used in the app creation form. Supports three resource types:

- **Workspaces**: Lists all Power BI workspaces accessible to the connected account
- **Reports**: Lists reports within a selected workspace
- **Dashboards**: Lists dashboards within a selected workspace

Features:
- Auto-detects active PowerBI integrations; shows inline "Connect" button if none found
- Text search filter (appears when > 5 resources)
- Manual refresh/sync button
- Selected item highlighting with checkmark
- Cascading dependency: report/dashboard pickers require a workspace selection first
- `allow_manual` toggle for direct ID entry

### `AddIntegrationModal`

Handles PowerBI provider specifically: when the provider is `powerbi` with `auth_flow: 'oauth2'`, renders `MicrosoftOAuthButton` for the connection step.

### `IntegrationCard`

Displays connected PowerBI integrations with provider icon, status badge, and disconnect option.

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/workspaces/{wid}/integrations?provider=powerbi` | List PowerBI integrations |
| `GET` | `/api/v1/workspaces/{wid}/integrations/{id}/resources?resource_type=workspace` | List PBI workspaces |
| `GET` | `/api/v1/workspaces/{wid}/integrations/{id}/resources?resource_type=report&pbi_workspace_id=...` | List reports in a workspace |
| `GET` | `/api/v1/workspaces/{wid}/integrations/{id}/resources?resource_type=dashboard&pbi_workspace_id=...` | List dashboards |
| `GET` | `/api/v1/workspaces/{wid}/integrations/{id}/data?resource_id={wsId}/{reportId}&resource_type=report` | Fetch embed URL + token |
| `POST` | `/api/v1/workspaces/{wid}/integrations/oauth/init?provider=powerbi&redirect_uri=...` | Start Microsoft OAuth |
| `POST` | `/api/v1/workspaces/{wid}/integrations/oauth/callback?provider=powerbi` | Complete OAuth callback |
| `POST` | `/api/v1/workspaces/{wid}/integrations/{id}/disconnect` | Disconnect Microsoft account |
| `DELETE` | `/api/v1/workspaces/{wid}/integrations/{id}` | Remove integration record |

**Note:** The `resource_id` for reports/dashboards uses a composite format: `"workspace_id/report_id"` so the backend can resolve both IDs from a single parameter.

---

## Data Flow (Player)

1. **ContentRenderer** detects `powerbi_report` or `powerbi_dashboard` in `INTEGRATION_DATA_TYPES`
2. **`useIntegrationAppData`** constructs a composite `resource_id` (`workspace_id/report_id`) and calls the integration data endpoint
3. **`IntegrationDataFetcher`** (context-injected) polls the backend at the configured `refresh_interval`
4. Backend returns `_data` containing `embed_url`, `embed_token`, `token_type`, `token_expiry`, and optionally `token_error`
5. **Renderer** receives `_data` and either embeds via SDK or falls back to iframe

### Dashboard Preview

`useDashboardIntegrationFetcher` is used in the dashboard editor — one-shot fetch with an in-memory `Map` cache, no polling.

---

## Offline Support

Both `PowerBIReportRenderer` and `PowerBIDashboardRenderer` cache successful `_data` to `localStorage`:
- Key format: `pbi_report_{report_id}` or `pbi_dashboard_{dashboard_id}`
- On next render, if `_data` is absent, attempts to read from cache
- Shows an "Offline — cached data" amber badge when serving cached content

---

## Browser Compatibility

| Renderer | Minimum Browser |
|---|---|
| `PowerBIReportRenderer` (SDK path) | Modern browsers (Chrome 60+, Edge, Firefox, Safari) |
| `PowerBIReportRenderer` (iframe fallback) | Chrome 38+ (Smart TV) |
| `PowerBIDashboardRenderer` (SDK path) | Modern browsers |
| `PowerBIDashboardRenderer` (iframe fallback) | Chrome 38+ (Smart TV) |
| `PowerBIURLRenderer` | Chrome 38+ (Smart TV) |

The SDK is dynamically imported — if it fails to load (e.g., on old browsers), the iframe fallback activates automatically.

---

## File Reference

| File | Purpose |
|---|---|
| `packages/renderer/src/hooks/usePowerBIEmbed.ts` | SDK lifecycle hook |
| `packages/renderer/src/renderers/PowerBIReportRenderer.tsx` | Report renderer (SDK + iframe) |
| `packages/renderer/src/renderers/PowerBIDashboardRenderer.tsx` | Dashboard renderer (SDK + iframe) |
| `packages/renderer/src/renderers/PowerBIURLRenderer.tsx` | Public URL iframe renderer |
| `packages/renderer/src/renderers/registry.ts` | Lazy-load registry for renderers |
| `packages/renderer/src/hooks/useIntegrationAppData.ts` | Data fetching for integration apps |
| `packages/renderer/src/renderers/ContentRenderer.tsx` | Top-level renderer routing |
| `apps/dashboard/src/components/integrations/MicrosoftOAuthButton.tsx` | OAuth initiation button |
| `apps/dashboard/src/components/integrations/PowerBIResourcePicker.tsx` | Resource browser component |
| `apps/dashboard/src/app/(dashboard)/integrations/microsoft/callback/page.tsx` | OAuth callback page |
| `apps/dashboard/src/hooks/useDashboardIntegrationFetcher.ts` | Dashboard preview data fetcher |
| `apps/dashboard/src/components/apps/FormFieldRenderer.tsx` | Form field rendering (integration_selector, resource_picker) |
| `packages/api-client/src/endpoints/integrations.ts` | API client endpoints |
| `packages/types/src/app.ts` | App type definitions and config interfaces |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| No Microsoft account connected | Inline "Connect" button in resource picker and form |
| Embed token unavailable (no Pro/Premium license) | Shows error: "Embed token unavailable — check Power BI license" |
| Backend returns `token_error` | Displays the specific error message |
| SDK fails to load | Falls back to iframe embed automatically |
| OAuth `access_denied` | Callback page shows specific "access was denied" message |
| Network offline | Serves cached embed data from localStorage with amber badge |
