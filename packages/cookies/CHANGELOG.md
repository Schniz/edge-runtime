# @edge-runtime/cookies

## 3.0.0

### Major Changes

- BREAKING CHANGE: Drop Node.js 12 ([#191](https://github.com/vercel/edge-runtime/pull/191))

## 2.0.2

### Patch Changes

- remove #cached in favor of doing computation in the constructor ([#188](https://github.com/vercel/edge-runtime/pull/188))

## 2.0.1

### Patch Changes

- Align `RequestCookies` API with `ResponseCookies` ([#187](https://github.com/vercel/edge-runtime/pull/187))

## 2.0.0

### Major Changes

- Align `RequestCookies` and `ResponseCookies` APIs as much as possible with [CookieStore](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) ([#181](https://github.com/vercel/edge-runtime/pull/181))

- Make `RequestCookies` and `ResponseCookies` more spec compliant by resembling the [Cookie Store API](https://wicg.github.io/cookie-store). The main difference is that the methods do not return `Promise`. ([#177](https://github.com/vercel/edge-runtime/pull/177))

  Breaking changes:

  - `ResponseCookies#get` has been renamed to `ResponseCookies#getValue`
  - `ResponseCookies#getWithOptions` has been renamed to `ResponseCookies#get`

### Patch Changes

- Change release method to Changesets ([#110](https://github.com/vercel/edge-runtime/pull/110))

- upgrading undici ([`3207fa2`](https://github.com/vercel/edge-runtime/commit/3207fa224783fecc70ac63aef4cd49a8404ecbc0))

## 2.0.0-beta.35

### Major Changes

- Align `RequestCookies` and `ResponseCookies` APIs as much as possible with [CookieStore](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) ([#181](https://github.com/vercel/edge-runtime/pull/181))

## 2.0.0-beta.34

### Major Changes

- Make `RequestCookies` and `ResponseCookies` more spec compliant by resembling the [Cookie Store API](https://wicg.github.io/cookie-store). The main difference is that the methods do not return `Promise`. ([#177](https://github.com/vercel/edge-runtime/pull/177))

  Breaking changes:

  - `ResponseCookies#get` has been renamed to `ResponseCookies#getValue`
  - `ResponseCookies#getWithOptions` has been renamed to `ResponseCookies#get`

## 1.1.0-beta.33

### Patch Changes

- upgrading undici ([`3207fa2`](https://github.com/vercel/edge-runtime/commit/3207fa224783fecc70ac63aef4cd49a8404ecbc0))

## 1.1.0-beta.32

### Patch Changes

- Change release method to Changesets ([#110](https://github.com/vercel/edge-runtime/pull/110))
