# Publish to npm

`kinetic-slides` is an unscoped public npm package. Maintainers need npm publish access and two-factor authentication.

1. Bump the package version; npm does not allow reusing a published version. Make sure the main branch is ready and CI passes. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run demo:build`, and `npm pack --dry-run` locally. Review the tarball file list for private content.
2. Authenticate with `npm login` and verify the account with `npm whoami`. Keep credentials outside this repository.
3. Publish with `npm publish --access public`. The `prepublishOnly` hook runs typecheck, lint, and demo build; `prepack` builds the package and declarations.
4. Confirm with `npm view kinetic-slides version` and test `npm install kinetic-slides react react-dom motion` in a fresh React app.

Do not put private presentation material in this repository or package tarball.
