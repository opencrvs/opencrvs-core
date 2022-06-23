<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [How to Contribute to OpenCRVS](#how-to-contribute-to-opencrvs)
  - [Internal Dev Process - for the core team (Plan, Jembi and DSI)](#internal-dev-process---for-the-core-team-plan-jembi-and-dsi)
    - [Sprint work process](#sprint-work-process)
    - [Code review process](#code-review-process)
    - [Finalizing stories](#finalizing-stories)
  - [External Dev Process - for open source contributions](#external-dev-process---for-open-source-contributions)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# How to Contribute to OpenCRVS

## Internal Dev Process - for the core team (Plan, Jembi and DSI)

Current Tech Leads:

- Euan Millar https://github.com/euanmillar
- Ryan Crichton https://github.com/rcrichton
- Riku Rouvila https://github.com/rikukissa
- Mushraful Hoque Anik https://github.com/mushrafulhoque-dsi

We work in 2 week sprints. We will have a meeting day after the end of the previous sprint and before the new sprint starts. This is a time for us to perform the the following sprint ceremonies:

- Technical design - where the Tech Leads will meet to decide how stories will be done and break them into tasks.
- Sprint review - where we will show off what was completed in the previous sprint
- Retrospective - where we discuss what worked well and what didn't work well in the previous sprint and what we can change going forward
- Sprint planning - where we explain, discuss and estimate stories and their sub-tasks in the backlog and decide on how many stories we can do in the next sprint based on our current velocity

### Sprint work process

After all the planning is done the sprint will be started. From there the following process is followed whenever you are looking for work:

1. Pickup a task from the 'TODO' column and move it into the 'In Progress' column in Jira, this will automatically assign it to you.
2. Create a new branch off of the **latest** master code using the convension `ocrvs-123-some-descriptive-name` - all lowercase with dashes between words.
3. Write code man! Commit often and write tests as you go. Use the commit format shows here - https://codeinthehole.com/tips/a-useful-template-for-commit-messages/
4. When you think the issue is **resolved** _OR_ when you have a **question** about design or your current approach, open up a PR. Set the correct labels for the PR. `WIP` for in progress and `Wating for review` when it's ready to be looked at **Note:** please **add the Jira issue number to the name of the PR** so it will be linked to the issue in Jira so reviewers can find it easily. e.g. `OCRVS-123 - Some descriptive name`. Please **add an image or gif for new UI functionality** so reviewers can see this without building the project.
5. Move the issue to 'Ready for Review' in Jira if it is complete _OR_ if you just have a question, ping someone on chat to have a look at the PR.
6. As an author of the PR, keep track of the comments made on the PR and push new commit to the PR to address them.
7. `GOTO 1.`

### Code review process

The Tech Leads are responsible for doing code review and landing code into master. They should check for new review tasks before pick up anything new. When reviewing follow this process:

1. When you pick up an issue to review, move it to 'In Review' in Jira so other Tech Leads know it's being looked at
2. Provide any comments in the PR. If the code requires work move the issue back to 'In Progress' in Jira and assign it to the original author. If all looks good then merge the PR, click the delete branch button in github.
3. If the issue is a sub-task of a story move it directly to 'DONE' in Jira.
4. If this is the last sub-task for the story then the reviewer should fire up the project and ensure that all acceptance criteria of the story are covered, if there are gaps or errors create issues for those. If all's good move the 'Finalize' sub-task to 'Ready to deploy' (every story should have a finalise tasks, if it doesn't create one)
5. If the issue is a stand-alone issue just move it to 'Ready to deploy' in Jira.

### Finalizing stories

All stories should have a 'Finalize' sub-task. This is the only sub-task that should use the 'Ready to deploy' and 'Design review & QA' columns (standalone issues, like bugs or simple issues with no sub-tasks also use these). This ensures that deployment and QA are only requested when a story is fully complete so that the designer and QA can expect everything to work.

We deploy to QA every Friday. One of the Tech Leads will be responsible for the deployment. They will:

- Do the deployment to QA
- Check that each deployed story is available on QA server
- If it is, move the 'Finalize' sub-task for that story from 'Ready to deploy' to 'Design review & QA'

When the designer and QA have feedback they will create new sub-tasks under original story for these and move the 'Finalize' sub-task back to 'TODO'.

## External Dev Process - for open source contributions

1. Fork the repo
2. Create a branch with your changes
3. Submit a PR
4. Address any comments the core contributors may have
5. The core contributors will merge the code once it is ready, thanks for you contribution!

By contributing to the OpenCRVS code, you are conforming to the terms of the license below.

## License

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration & Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS graphic logo are (registered/a) trademark(s) of Plan International.
