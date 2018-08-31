import { createTestApp } from './tests/util'
import { config } from '../src/config'
import {
  SELECT_VITAL_EVENT,
  SELECT_INFORMANT,
  DRAFT_BIRTH_PARENT_FORM
} from './navigation/routes'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Store } from 'redux'
import { storeDraft, createDraft } from './drafts'

const assign = window.location.assign as jest.Mock
const getItem = window.localStorage.getItem as jest.Mock

beforeEach(() => {
  history.replaceState({}, '', '/')
  assign.mockClear()
})

it('renders without crashing', async () => {
  createTestApp()
})

it("redirects user to SSO if user doesn't have a token", async () => {
  createTestApp()
  expect(assign.mock.calls[0][0]).toBe(config.LOGIN_URL)
})

const validToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

const expiredToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY2h3IiwiaWF0IjoxNTMwNzc2OTYxLCJleHAiOjE1MzA3Nzc1NjEsInN1YiI6IjViMzI1YTYyMGVmNDgxM2UzMDhhNDMxMyJ9.leJuSng-PmQvFCS-FrIl9-Z2iYitwuX274QHkDoVQGmHtfi9SsKIRmZ1OlNRS6g7eT4LvvUDjwBZvCO7Rvhf_vnrHmHE4JR_e9MWVoK_0vjxCkDmo-cZ6iM7aBzrB4-F1eaaZJwxrwPFY5o_rsxCAeHj-draVYQTEr388y-rffdaC7IHoHhTrGoj8n40d8RyvX7UVVG5w1zsxFhYlN44zvMDNy56zGpbJ7mNn3M6hJWGUjDaOhtsEpfyDeoeiuEkU4Rn_WxtbognqLt12P6TQWsQOy_eHqR2UfBdmPw_uSW28FFQh9ebOEjMSI0JnIFXagrWkkFVO2DcBh8YlGE5M_fZWrrkz9pTiVb1KQWTz_TPUf8VVlTRNBKCnumiQJRIkWNxIecYwKap_HpKd5SaD8sLgB3htmomfJE4h4nu-7Tjy_QYw_2Sm4upDCEcB-mjx_EeIVTQXk5Re3QMhY1hEh9tD0kDhJudPQWBG7g8GQy2ZBmy6CtP7FQ-tRdyOE_0TNazZSB4Ogz8im5c2ZSVRWalPZWp0TupiSWI5sY-k_Qab6hpbxAFxqsH-8eRelos4y9Ohh60mpNNIqZkizSLfoWKgR5tMBkyDbMPbfbDUEKYKSa5b29uCeAHeJXvW-A0Nk5YwiPNZIe2ycuVaWUaDnL3vvbb5yrTG1eDuhFm_xw'

describe('when user has a valid token in url but an expired one in localStorage', () => {
  beforeEach(() => {
    getItem.mockReturnValue(expiredToken)
    window.history.replaceState('', '', '?token=' + validToken)
    createTestApp()
  })

  it("doesn't redirect user to SSO", async () => {
    expect(assign.mock.calls).toHaveLength(0)
  })
})

describe('when user has a valid token in local storage', () => {
  let app: ReactWrapper
  let history: History
  let store: Store

  beforeEach(() => {
    getItem.mockReturnValue(validToken)
    const testApp = createTestApp()
    app = testApp.app
    history = testApp.history
    store = testApp.store
  })

  it("doesn't redirect user to SSO", async () => {
    expect(assign.mock.calls).toHaveLength(0)
  })

  describe('when user is in vital event selection view', () => {
    beforeEach(() => {
      history.replace(SELECT_VITAL_EVENT)
    })
    it('lists the options', () => {
      expect(app.find('button#select_birth_event')).toHaveLength(1)
    })
    describe('when selects "Birth"', () => {
      beforeEach(() => {
        app
          .find('#select_birth_event')
          .hostNodes()
          .simulate('click')
      })
      it('takes user to the informant selection view', () => {
        expect(app.find('#select_informant_view').hostNodes()).toHaveLength(1)
      })
    })
  })

  describe('when user is in informant selection view', () => {
    beforeEach(() => {
      history.replace(SELECT_INFORMANT)
      app.update()
    })
    describe('when selects "Parent"', () => {
      beforeEach(() => {
        app
          .find('#select_parent_informant')
          .hostNodes()
          .simulate('click')
      })
      it('takes user to the birth registration by parent informant view', () => {
        expect(app.find('#informant_parent_view').hostNodes()).toHaveLength(1)
      })
    })
  })

  describe('when user is in birth registration by parent informant view', () => {
    beforeEach(() => {
      const draft = createDraft()
      store.dispatch(storeDraft(draft))
      history.replace(
        DRAFT_BIRTH_PARENT_FORM.replace(':draftId', draft.id.toString())
      )
      app.update()
    })
    describe('when user clicks the "mother" tab', () => {
      beforeEach(() => {
        app
          .find('#tab_mother')
          .hostNodes()
          .simulate('click')
      })
      it('changes to the mother details section', () => {
        expect(app.find('#form_section_title_mother').hostNodes()).toHaveLength(
          1
        )
      })
    })
    describe('when user clicks "next" button', () => {
      beforeEach(() => {
        app
          .find('#next_section')
          .hostNodes()
          .simulate('click')
      })
      it('changes to the mother details section', () => {
        expect(app.find('#form_section_title_mother').hostNodes()).toHaveLength(
          1
        )
      })
    })
    describe('when user clicks the "father" tab', () => {
      beforeEach(() => {
        app
          .find('#tab_father')
          .hostNodes()
          .simulate('click')
      })
      it('changes to the father details section', () => {
        expect(app.find('#form_section_title_father').hostNodes()).toHaveLength(
          1
        )
      })
    })
  })
})
it("doesn't redirect user to SSO if user has a token in their URL", async () => {
  const token =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'

  history.replaceState({}, '', '?token=' + token)

  createTestApp()
  expect(assign.mock.calls).toHaveLength(0)
})
