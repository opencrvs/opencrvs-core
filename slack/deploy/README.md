# Slack deploy app

A [Slack automation app](https://api.slack.com/automation) (Deno, run with the
Slack CLI) that lets the team trigger OpenCRVS deployments to internal
environments from Slack.

Clicking the app's link trigger opens a short form (**environment** + **branch /
tag / commit**). On submit the app dispatches the
[`deploy-opencrvs.yml`](https://github.com/opencrvs/opencrvs-testland-infrastructure/actions/workflows/deploy-opencrvs.yml)
workflow in `opencrvs-testland-infrastructure` via the GitHub REST API, then
posts a Block Kit message (with a link to the workflow run) to a fixed channel.

## How it works

1. **Trigger** (`triggers/deploy.ts`) — a link/shortcut trigger that starts the
   workflow and passes through the invoking user, channel, and interactivity.
2. **Workflow** (`workflows/deploy.ts`) — opens the input form, then runs the
   deploy function.
3. **Function** (`functions/deploy.ts`) — resolves the ref to a published
   `core-image-tag`, dispatches the infra workflow, polls for the run URL
   (`workflow_dispatch` returns no run id), and posts the result message.

The image tag is resolved from the user's input the same way
`opencrvs-core` tags its images (commit hash → 7‑char tag, otherwise the
sanitized branch/tag name; empty → `develop`).

## Configuration

Set as environment variables (`.env` for local runs, `slack env add <KEY> <value>`
for the deployed app):

| Variable         | Required | Purpose                                                                 |
| ---------------- | -------- | ----------------------------------------------------------------------- |
| `GITHUB_TOKEN`   | yes      | Token that can dispatch + read runs on the infra repo (`repo` scope, or a fine‑grained token with Actions: read & write). |
| `OUTPUT_CHANNEL` | no       | Overrides the channel the result message is posted to (defaults to `#opencrvs-developers`). |
| `TRIGGER_URL`    | no       | Overrides the "run again" footer link (defaults to the deployed trigger). |

The bot must be able to post to the output channel (public channels are covered
by the `chat:write.public` scope; invite the app to a private channel).

## Developing

Requires the [Slack CLI](https://api.slack.com/automation/cli/install) and Deno.

```zsh
# Run locally (creates a separate "(local)" app + trigger)
slack run

# Type-check and lint (also enforced in CI — see
# .github/workflows/slack-deploy-checks.yml)
deno check .
deno lint
```

## Deploying

```zsh
slack deploy
slack env add GITHUB_TOKEN <token>   # first deploy only
```

On first deploy the CLI prompts you to create the link trigger for the deployed
app; share that Shortcut URL (e.g. as a channel bookmark) to let people deploy.

View live logs with `slack activity --tail`.

## Project structure

| Path            | Description                                                    |
| --------------- | ------------------------------------------------------------- |
| `manifest.ts`   | App configuration (name, scopes, outgoing domains, workflow). |
| `workflows/`    | Workflow definitions (ordered steps).                         |
| `functions/`    | Custom function implementations.                              |
| `triggers/`     | Trigger definitions that start workflows.                     |
| `.slack/`       | Slack CLI project state (managed by the CLI).                 |
