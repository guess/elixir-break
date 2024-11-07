# Elixir Debug Helper

A VSCode extension that automatically adds/removes `dbg()` calls when setting breakpoints in Elixir files.

## Features

- Automatically adds `|> dbg()` when you set a breakpoint
- Automatically removes the `dbg()` call when you remove the breakpoint
- Works with all Elixir files (`.ex`, `.exs`)

## Requirements

- VSCode 1.80.0 or higher
- Elixir installed

## Usage

1. Start your Elixir server with debugging enabled:
   ```bash
   iex --dbg pry -S mix phx.server
   ```

2. In VSCode, set breakpoints as normal in your Elixir files. The extension will automatically add `|> dbg()` calls.

3. When you remove a breakpoint, the `dbg()` call will be automatically removed.

## Extension Settings

This extension has no configurable settings.

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release:
- Add/remove dbg() calls automatically with breakpoints