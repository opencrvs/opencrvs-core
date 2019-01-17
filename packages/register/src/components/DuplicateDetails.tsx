import * as React from 'react'
import { Box } from '@opencrvs/components/lib/interface'
import styled from 'src/styled-components'
import { StatusGray, StatusOrange } from '@opencrvs/components/lib/icons'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

const DetailsBox = styled(Box)`
  border-top: ${({ theme }) => ` 4px solid ${theme.colors.expandedIndicator}`};
`

const Separator = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.background};
  margin: 24px -25px 24px -25px;
`

const DetailTextContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const DetailText = styled.div`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.copy};
  font-size: 16px;
`

const DetailTextSplitContainer = styled(DetailText)`
  display: flex;
  justify-content: stretch;
`

const Link = styled.a`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
  text-decoration: underline;
`

const TagContainer = styled.div`
  display: flex;
`

const StyledStatus = styled.div`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 16px 2px 0;
  display: flex;
  align-items: center;
  height: 32px;
  & span {
    color: ${({ theme }) => theme.colors.placeholder};
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0.58px;
  }
` // copied code, extract to new component

const ListContainer = styled.div`
  display: flex;
`

const ListStatusContainer = styled.span`
  margin: 4px 8px;
`

export class DuplicateDetails extends React.Component {
  render() {
    return (
      <DetailsBox>
        <DetailTextContainer>
          <DetailText>
            <b>Name:</b> Isa Annika Gomes
            <br />
            <b>D.o.B.:</b> 04.10.2018
            <br />
            <b>Gender:</b> Female
            <br />
            <b>Date of application:</b> 10.10.2018
            <br />
            <b>Tracking ID:</b> 413276930474
            <br />
            <br />
          </DetailText>
          <Link>Not a duplicate?</Link>
        </DetailTextContainer>
        <DetailTextSplitContainer>
          <DetailText>
            <b>Mother</b>
            <br />
            <b>Name:</b> Jane Gomes
            <br />
            <b>D.o.B.:</b> 04.10.2018
            <br />
            <b>Gender:</b> Female
            <br />
            <b>ID:</b> 413276930474
            <br />
          </DetailText>
          <DetailText>
            <b>Father</b>
            <br />
            <b>Name:</b> Paul Gomes
            <br />
            <b>D.o.B.:</b> 04.10.2018
            <br />
            <b>Gender:</b> Male
            <br />
            <b>ID:</b> 413276930474
            <br />
          </DetailText>
        </DetailTextSplitContainer>
        <Separator />
        <TagContainer>
          <StyledStatus key={1}>
            <StatusGray />
            <span>Birth</span>
          </StyledStatus>
          <StyledStatus key={2}>
            <StatusOrange />
            <span>Application</span>
          </StyledStatus>
        </TagContainer>
        <Separator />
        <ListContainer>
          <ListStatusContainer>
            <StatusOrange />
          </ListStatusContainer>
          <DetailText>
            <b>Application submitted on:</b> 10.10.2018
            <br />
            <b>By:</b> Riku Rouvila
            <br />
            Family Welfare Assistant
            <br />
            Gazipur Union Health Clinic
            <br />
          </DetailText>
        </ListContainer>
        <Separator />
        <PrimaryButton>Review</PrimaryButton>
      </DetailsBox>
    )
  }
}
