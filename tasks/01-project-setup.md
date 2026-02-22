# Task 01: Project Setup & Rename

## Status: pending

## Priority: high

## Dependencies: none

## Description

Rename the project from `opencode-config-cli` to `lazy-opencode-config`. Update package.json, bump Node engine to 18+, add required dependencies, set up the source directory structure.

## Acceptance Criteria

- [ ] `package.json` name is `lazy-opencode-config`
- [ ] `bin` field points to `dist/cli.js` with name `lazy-opencode-config`
- [ ] Node engine `>=18` (needed for native `fetch`)
- [ ] Dependencies added: `ajv`, `jsonc-parser`, `ink-text-input`, `ink-select-input`
- [ ] `chalk` moved from devDependencies to dependencies
- [ ] Source directory structure created:
  ```
  source/
  ├── cli.tsx
  ├── app.tsx
  ├── components/
  ├── hooks/
  ├── lib/
  ├── commands/
  └── types/
  ```
- [ ] Basic TypeScript types file created (`source/types/index.ts`) with placeholder types

## Notes

- Keep meow for CLI parsing
- No zustand — pure React state
- No node-fetch — native fetch
