# How to Contribute to OpenCRVS

## Internal Dev Process - for the core team (Plan, Futurice, Jembi and DSI)

We work in 2 week sprints. We will have a meeting day after the end of the previous sprint and before the new sprint starts. This is a time for us to perform the the following sprint ceremonies:

* Sprint review - where we will show off what was completed in the previous sprint
* Retrospective - where we discuss what worked well and what didn't work well in the previous sprint and what we can change going forward
* Sprint planning - where we explain, discuss and estimate stories in the backlog and decide on how many stories we can do in the next sprint based on our current velocity

After all the planning is done the sprint will be started. From there the following process is followed whenever you are looking for work:

1. (For Tech Leads) Look for any new code review to pick before starting any new task.
2. Pickup a task from the 'TODO' column and move it into the 'In Progress' column in Jira, this will automatically assign it to you.
3. Create a new branch off of the **latest** master code using a descriptive name e.g. 'adding-xyz-component' or 'fix-scrolling-bug'.
4. Write code man! Commit often and write tests as you go.
5. When you think the issue is resolved _OR_ when you have a question about design or your current approach, open up a PR. You may want to set the correct labels for the PR. **Note:** please add the Jira issue number to the bottom of description of the PR so it will be linked to the issue in Jira so reviewers can find it easily.
6. Move the issue to 'Ready for Review' if it is complete OR if you just have a question, ping someone on chat to have a look at the PR.
7. As a reviewer, when you pick up an issue to review, move it to 'In Review' then provide any comments in the PR. If the code requires work move the issue back to 'In Progress' and assign it to the original author. If all looks good then merge the PR, click the delete branch button in github and move the issue to 'Done' in Jira. Repeat this step as necessary.
8. As an author of the PR, keep track of the comments made on the PR and push new commit to the PR to address them.
9. `GOTO 1.`

## External Dev Process - for open source contributions

1. Fork the repo
2. Create a branch with your changes
3. Submit a PR
4. Address any comments the core contributors may have
5. The core contributors will merge the code once it is ready, thanks for you contribution!
