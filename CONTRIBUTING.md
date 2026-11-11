<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Become part of the OpenCRVS Community

We want to see OpenCRVS implemented across the world. We can’t do this alone. Through the OpenCRVS Community, we are uniting experts in civil registration and other interested parties.

[Visit our website](https://www.opencrvs.org)

[Join our community](https://community.opencrvs.org)

We greatly appreciate any contributions to opencrvs-core

<a href="https://github.com/opencrvs/opencrvs-core/issues">Raise an issue</a> or <a href="https://community.opencrvs.org">join our community to ask for a new feature</a>

1. Raise an issue
2. Involve yourself in design discussions
3. Co-create development tasks with our team
4. Fork the repo
5. Create a branch with your changes
6. Check your changes against the [coding standards](docs/coding-standards/README.md), then submit a PR that follows the [pull request rules](#pull-requests)
7. Address any comments the core contributors may have
8. The core contributors will merge the code once it is ready, thanks for you contribution to ensure every individual on the planet is recognised, protected and provided for from birth!

By contributing to the OpenCRVS code, you are conforming to the terms of the [license](https://www.opencrvs.org/license).

## Pull requests

- Keep each PR to one concern. Open a separate PR or an issue for other findings.
- Fix the root cause, and reproduce the bug first. If a workaround is necessary, give the reason in the description and open an issue for the cause.
- Write the description that the [PR template](.github/PULL_REQUEST_TEMPLATE.md) asks for.
- Give the PR a title that describes the change. The title becomes the squash commit.
- Send a hotfix for a released version to the hotfix branch of its minor version, such as `release/2.1.x`. A patch branch that is already released, such as `release/2.1.3`, is closed.
- Backport a fix that the live release lines need. A risky refactor with no user benefit waits until `develop` is on the next release line.
- Read all the code, comments, tests and text that an agent wrote before you ask a person to review them. A finding from a bot review is a suggestion. Check it before you act on it.
