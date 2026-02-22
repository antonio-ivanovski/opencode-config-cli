# Task 03: Config Path Resolution

## Status: pending

## Priority: high

## Dependencies: 02

## Description

Implement logic to find and resolve the correct config file path for both global and project scopes. Handles auto-detection, traversal to git root, and `.json` vs `.jsonc` variants.

## Acceptance Criteria

- [ ] `source/lib/config-path.ts` created
- [ ] `resolveGlobalPath()` → `~/.config/opencode/opencode.json` or `.jsonc` (check which exists, prefer `.jsonc`)
- [ ] `resolveProjectPath()` → traverse from CWD up to nearest `.git` dir looking for `opencode.json(c)`
- [ ] `autoDetectScope()` → returns `{ scope, filePath }` — project if found, else global
- [ ] `resolveConfigPath(scope: 'global' | 'project' | 'auto')` → unified resolver
- [ ] Handle case where no config file exists (return expected path for creation)
- [ ] Exported as pure functions (no side effects)

## Notes

- Use `os.homedir()` for `~`
- Use `fs.existsSync` for checking — simple and sync is fine here (startup only)
- Walk up directories with a simple loop, stop at filesystem root or `.git`
