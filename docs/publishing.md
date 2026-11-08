# Publish to npm

`compose-slides` is an unscoped public package. A maintainer with npm publish access must make the first release. The package is not published yet.

1. Make sure the main branch is ready and CI passes. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run demo:build`, and `npm pack --dry-run` locally. Review the tarball file list for private content.
2. Authenticate with `npm login` and verify the account with `npm whoami`. Keep credentials outside this repository.
3. Publish with `npm publish --access public`. The `prepublishOnly` hook runs typecheck, lint, and demo build; `prepack` builds the package and declarations.
4. Confirm with `npm view compose-slides version` and test `npm install compose-slides react react-dom motion` in a fresh React app.

For later releases, bump the package version before publishing. npm does not allow reusing a published package name and version. Do not put private presentation material in this repository or package tarball.
