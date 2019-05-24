import * as React from 'react'

interface IMutationProps {
  mutation: any
}

export class MutationCaller extends React.Component<IMutationProps> {
  componentDidMount() {
    this.props.mutation()
  }

  render() {
    return null
  }
}
