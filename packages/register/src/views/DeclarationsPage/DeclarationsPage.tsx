import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'

class Declarations extends React.Component<
  InjectedIntlProps & IViewHeadingProps
> {
  render() {
    return (
      <>
        <HomeViewHeader>
          <ViewHeading
            title="Hello Euan"
            description="Review | Registration | Certification"
            {...this.props}
          />
        </HomeViewHeader>
      </>
    )
  }
}

export const DeclarationsPage = connect(null, null)(injectIntl(Declarations))
