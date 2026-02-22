# Task 11: CLI Entry Point & Argument Parsing

## Status: pending

## Priority: high

## Dependencies: 01, 03

## Description

Rewrite `cli.tsx` to handle both TUI mode (default) and subcommand mode. Parse arguments with meow, route to the right handler.

## Acceptance Criteria

- [ ] `source/cli.tsx` rewritten
- [ ] Default (no subcommand) → launch TUI via `render(<App />)`
- [ ] Subcommands routed: `get`, `set`, `delete`, `list`, `validate`, `path`
- [ ] Global flags: `--global`, `--project`, `--help`, `--version`
- [ ] `--global` / `--project` passed through to both TUI and subcommands
- [ ] Subcommands call functions from `source/commands/` and print results (no Ink rendering)
- [ ] Clean error handling with process.exit codes
- [ ] Help text shows all subcommands and examples

## CLI Signature

```
lazy-opencode-config [command] [args] [flags]

Commands:
  (none)         Launch interactive TUI
  get <path>     Get config value at dot-path
  set <path> <v> Set config value at dot-path
  delete <path>  Remove config key
  list <what>    List providers, models, agents, keys
  validate       Validate config against schema
  path           Print resolved config file path

Flags:
  --global       Use global config
  --project      Use project config
  --help         Show help
  --version      Show version
```

## Notes

- meow handles the basic parsing, we just route
- Subcommands are thin — they call lib functions and format output
