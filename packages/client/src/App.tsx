import * as React from 'react'
import { Provider } from 'react-redux'
import { IntlProvider, injectIntl, defineMessages } from 'react-intl'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { Button } from '@opencrvs/components/lib/Button'
import { injectGlobal } from 'styled-components'
import { globalStyles } from '@opencrvs/components/lib/common/global'
import { LocaleThemes } from '@opencrvs/components/lib/common/global/LocaleThemes'
import './App.css'
import logo from './logo.svg'
import { store, history } from './store'
import { Route } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { RegistrationList } from './registrations/RegistrationList'

const GRAPHQL_URL = `${process.env.REACT_APP_API_GATEWAY_URL}`
const LANGUAGE = `${process.env.REACT_APP_LANGUAGE}`
const LOCALE = `${process.env.REACT_APP_LOCALE}`

// Injecting global styles for @font-face and the body tag - used only once
// tslint:disable-next-line
injectGlobal`${globalStyles}`

const foo = () => alert('sdf')

const messages = defineMessages({
	welcome: {
		id: 'app.welcome',
		defaultMessage: 'Welcome',
		description: 'Test text'
	}
})

const Title = injectIntl(({ intl }) => <h1 className="App-title">{intl.formatMessage(messages.welcome)}</h1>)

const Home = () => (
	<div className="App">
		<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			<Title />
			<Button onClick={foo}>Hello</Button>
		</header>
		<p className="App-intro">
			To get started, edit
			<code>src/App.tsx</code>
			and save to reload.
		</p>
		<RegistrationList />
	</div>
)
const Other = () => (
	<div className="App">
		<h1>page 2</h1>
	</div>
)

const client = new ApolloClient({
	uri: resolve(GRAPHQL_URL, 'graphql')
})
export class App extends React.Component<
	{
		client?: ApolloClient<{}>
	},
	{}
> {
	public render() {
		return (
			<ApolloProvider client={this.props.client || client}>
				<Provider store={store}>
					<IntlProvider locale={LANGUAGE}>
						<ThemeProvider theme={LocaleThemes[LOCALE]}>
							<ConnectedRouter history={history}>
								<div>
									<Route exact path="/" component={Home} />
									<Route exact path="/other" component={Other} />
								</div>
							</ConnectedRouter>
						</ThemeProvider>
					</IntlProvider>
				</Provider>
			</ApolloProvider>
		)
	}
}
