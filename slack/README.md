# Slack Deno SDK applications

This directory contains custom workflows written with the [Deno Slack SDK](https://docs.slack.dev/tools/deno-slack-sdk/).

We decided to use Deno Slack SDK here because its the only way to write custom workflows and have Slack host the code (instead of us hosting the code somewhere).

To get started, first install the Slack CLI: `brew install --cask slack-cli`

### Creating new applications

`slack create`

### Deploying existing applications

```
# e.g. for deploy application
cd deploy
slack deploy
```
