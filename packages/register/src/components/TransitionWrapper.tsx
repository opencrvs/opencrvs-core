import * as React from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  PAGE_TRANSITIONS_CLASSNAME
} from '@register/utils/constants'
import * as routes from '@register/navigation/routes'

interface IPros {
  location: any
}

interface IState {
  locations: any
}

let locationKey = 'key'

const getAnimationKey = (currLocation: any, prevLocation: any): string => {
  const prevLocParts = prevLocation.pathname.split('/')
  const currLocParts = currLocation.pathname.split('/')

  if (
    [
      routes.HOME,
      routes.FIELD_AGENT_HOME_TAB.replace(':tabId', prevLocParts[2]),
      routes.REGISTRAR_HOME,
      routes.REGISTRAR_HOME_TAB.replace(':tabId', prevLocParts[2]).replace(
        ':selectorId?',
        prevLocParts[3]
      )
    ].includes(prevLocation.pathname.toString()) &&
    currLocation.pathname.toString() === routes.SELECT_VITAL_EVENT
  ) {
    locationKey = currLocation.key
  } else if (
    [
      routes.DRAFT_BIRTH_PARENT_FORM.replace(':applicationId', prevLocParts[2]),
      routes.DRAFT_BIRTH_PARENT_FORM_PAGE.replace(
        ':applicationId',
        prevLocParts[2]
      )
        .replace(':pageId', prevLocParts[5])
        .toString(),
      routes.DRAFT_BIRTH_PARENT_FORM_PAGE_GROUP.replace(
        ':applicationId',
        prevLocParts[2]
      )
        .replace(':pageId', prevLocParts[5])
        .replace(':groupId', prevLocParts[7])
        .toString(),
      routes.REVIEW_EVENT_PARENT_FORM_PAGE.replace(
        ':applicationId',
        prevLocParts[2]
      )
        .replace(':event', prevLocParts[4])
        .replace(':pageId', prevLocParts[6])
        .toString(),
      routes.DRAFT_DEATH_FORM.replace(':applicationId', prevLocParts[2]),
      routes.DRAFT_DEATH_FORM_PAGE.replace(':applicationId', prevLocParts[2])
        .replace(':pageId', prevLocParts[5])
        .toString(),
      routes.DRAFT_DEATH_FORM_PAGE_GROUP.replace(
        ':applicationId',
        prevLocParts[2]
      )
        .replace(':pageId', prevLocParts[5])
        .replace(':groupId', prevLocParts[7])
        .toString()
    ].includes(prevLocation.pathname.toString()) &&
    [
      routes.HOME,
      routes.FIELD_AGENT_HOME_TAB.replace(':tabId', currLocParts[2]),
      routes.REGISTRAR_HOME,
      routes.REGISTRAR_HOME_TAB.replace(':tabId', currLocParts[2]).replace(
        ':selectorId?',
        currLocParts[3]
      )
    ].includes(currLocation.pathname.toString())
  ) {
    locationKey = currLocation.key
  }

  return locationKey
}

export default class TransitionWrapper extends React.Component<IPros, IState> {
  constructor(props: IPros) {
    super(props)

    this.state = {
      locations: [{ pathname: '' }, { pathname: '' }]
    }
  }

  static getDerivedStateFromProps(
    { location: currLocation }: IPros,
    { locations: [prevLocation] }: IState
  ) {
    return { locations: [currLocation, prevLocation] }
  }

  render() {
    const { children } = this.props
    const {
      locations: [currLocation, prevLocation]
    } = this.state

    return (
      <TransitionGroup component={null}>
        <CSSTransition
          unmountOnExit
          timeout={{
            enter: PAGE_TRANSITIONS_ENTER_TIME,
            exit: PAGE_TRANSITIONS_ENTER_TIME - 25
          }}
          classNames={PAGE_TRANSITIONS_CLASSNAME}
          key={getAnimationKey(currLocation, prevLocation)}
        >
          {children}
        </CSSTransition>
      </TransitionGroup>
    )
  }
}
