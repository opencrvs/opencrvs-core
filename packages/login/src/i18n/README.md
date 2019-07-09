# Internationalisation

## Add a new language
Create a `<language>.json` file. This will contain the master record of all strings shown in the app.
The file should be a regular flat JSON file, with all keys being message id's referred from the components, and values the actual texts that we want to be shown on the UI.


### Message ID format
Format:
`<view>.<component>.<section>`

e.g. `registrationForm.firstnameInput.label`

There's no limit for max length of an ID and it's always better to be as explicit as possible so that there's no ambiguity of which part of the UI the ID refers to.

## Using internationalisation in components

By default, translation items are used in components by passing message descriptors (1.) to `intl.format` method (2.).
All components receive this method as a prop when they are wrapped with `injectIntl` function (3.).

The message descriptor's `id` key refers back to the key you defined in `<lang>.json` for this message. `defaultMessage` is the message to be shown in case of `<lang>.json` not containing said item, or if it's still loading. `description` field is useful especially when the app is translated to a new language to give some context for the translator.


Example:

```js
import * as React from "react";
import { IntlProvider, injectIntl } from "react-intl";

interface IUsersListProps {
  users: User[]
}

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  title: { // 1.
    id: "usersList.title",
    defaultMessage: "Users:",
    description: "Title for the list of users"
  }
});

export class UsersListComponent extends React.Component<IUsersListProps, {}> {
  public render() {
    const { intl, users } = this.props;
    return (
      <div className="users-list">
        <h1>{intl.formatMessage(messages.title) /* 2. */}</h1>

        <ul>
          {users.map((user) => {
            <li>{user.username}</li>
          })}
        </ul>
      </div>
    );
  }
}

export const UsersList = injectIntl<IUsersListProps>(UsersList); // 3.
```

**⚠️Avoid  generating message descriptors dynamically**
In the future, we might need to have a way of generating a full list of required translations based on messages defined in component file. For this, all the definitions need to be static. Dynamically generated texts can easily be left out when we generate and submit the list of messages to be translated. They can also lead to bugs that are very difficult to debug and fix.

## Pluralisation & variables
### No complex pluralisation structures

It is tempting to cover only a minimal part of a message string with a complex argument (e.g., plural). However, this is difficult for translators for two reasons:
They might have trouble understanding how the sentence fragments in the argument sub-messages interact with the rest of the sentence, and
They will not know whether and how they can shrink or grow the extent of the part of the sentence that is inside the argument to make the whole message work for their language.

**Avoid this:**
```
This exchange rate is {minutes, plural,
  =0 {expired}
  other {valid for {minutes, plural,
    one {}
    other {the next}} {minutes} {minutes, plural, one {more minute} other {minutes}}}}
```

**Do this instead:**
```
{minutes, plural,
  =0 {This exchange rate is expired}
  one {This exchange rate is valid for 1 more minute}
  other {This exchange rate is valid for the next {minutes} minutes}
```

[Reference](http://userguide.icu-project.org/formatparse/messages)
