import React from 'react';
import styles from './styles.css';
import Worknav from 'components/Worknav';
import SearchForm from 'components/SearchForm';


const WorkContainer = ({
  onDeclarationClick,
  declaration,
  errorMessage,
}) => (
  <div className={styles.workItemContainer + ' content pure-g'}>
    { <Worknav /> }
    <div className={styles.list + ' pure-u-1'}>
      { <SearchForm
        onDeclarationClick={onDeclarationClick}
        errorMessage={errorMessage}
        declaration={declaration}
      /> }
      <div className={styles.workItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelDeclaration} />
        </div>
        <div className="pure-u-3-4">
          <h5 className={styles.workItemTitle}>Alhassan Adarkwa</h5>
          <h4 className={styles.workItemSubject}>Male</h4>
          <p className={styles.workItemDesc}>
            Kara - 25/6/17
          </p>
        </div>
      </div>
      <div className={styles.workItem + ' ' + styles.openedWorkItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelValidation} />
        </div>
        <div className="pure-u-3-4">
          <h5 className={styles.workItemTitle}>Frimpong Aggrey</h5>
          <h4 className={styles.workItemSubject}>Male</h4>
          <p className={styles.workItemDesc}>
            Adrume - 25/6/17
          </p>
        </div>
      </div>
      <div className={styles.workItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelDeclaration} />
        </div>
        <div className="pure-u-3-4">
          <h5 className={styles.workItemTitle}>Maridia Amenowode</h5>
          <h4 className={styles.workItemSubject}>Female</h4>
          <p className={styles.workItemDesc}>
            Soutouboua - 26/6/17
          </p>
        </div>
      </div>
      <div className={styles.workItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelDeclaration} />
        </div>
        <div className="pure-u-3-4">
          <h5 className={styles.workItemTitle}>Amina Akua</h5>
          <h4 className={styles.workItemSubject}>Female</h4>
          <p className={styles.workItemDesc}>
            Atakpame - 26/6/17
          </p>
        </div>
      </div>
      <div className={styles.workItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelRegistration} />
        </div>
        <div className="pure-u-3-4">
          <h5 className={styles.workItemTitle}>Ayeeshatu Ansah</h5>
          <h4 className={styles.workItemSubject}>Female</h4>
          <p className={styles.workItemDesc}>
            Kpalime - 26/6/17
          </p>
        </div>
      </div>
      <div className={styles.workItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelRegistration} />
        </div>

        <div className="pure-u-3-4">
          <h5 className={styles.workItemTitle}>Kwame Glover</h5>
          <h4 className={styles.workItemSubject}>Male</h4>
          <p className={styles.workItemDesc}>
            Aneho - 27/6/17
          </p>
        </div>
      </div>
    </div>

    <div className={styles.workingItemContainer + ' pure-u-1'}>
      <div className="email-content">
        <div className={styles.wiContentHeader + ' pure-g'}>
          <div className="pure-u-1-2">
            <h1 className={styles.wiContentTitle}>Validation required</h1>
            <p className={styles.wiContentSubtitle}>
              Declaration DV-874654681 <span>3:56pm, July 3, 2017</span> Declared by Chris Joffe
            </p>
          </div>
          <div className={styles.wiContentControls + ' pure-u-1-2'}>
            <button className={styles.secondaryButton + ' pure-button'}>
              Edit
            </button>
            <button className={styles.secondaryButton + ' pure-button'}>
              Submit
            </button>
            <button className={styles.secondaryButton + ' pure-button'}>
              Move to
            </button>
          </div>
        </div>
        <div className={styles.wiContentBody}>
        <form className="pure-form  pure-form-aligned">
          <fieldset>
            <h2 className="content-subhead">
              Personal details
              <a
                href="#default-form"
                className="content-link"
                title="Heading anchor"
              />
            </h2>
            <p>To validate the birth check/edit the following details.</p>
            <div className="pure-control-group">
              <label for="firstname">First Name</label>
              <input
                id="firstname"
                placeholder="First Name"
                value="Frimpong"
              />
              <span className="pure-form-message-inline">This is a required field.</span>
            </div>
            <div className="pure-control-group">
              <label for="firstname">Middle Name</label>
              <input
                id="middlename"
                placeholder="Middle Name"
                value="Joseph"
              />
              <span className="pure-form-message-inline">This is a required field.</span>
            
            </div>
            <div className="pure-control-group">
              <label for="firstname">Last Name</label>
              <input
                id="lastname"
                placeholder="Last Name"
                value="Aggrey"
              />
              <span className="pure-form-message-inline">This is a required field.</span>
            
            </div>
            
            <div className="pure-control-group">
              <label for="female" className="pure-radio">
                <input
                  id="female"
                  type="radio"
                  name="optionsRadios"
                  value="female"
                />
                Female
              </label>
              <label for="male" className="pure-radio">
                <input
                  id="male"
                  type="radio"
                  name="optionsRadios"
                  value="male"
                  checked
                />
                Male
              </label>
            
            </div>
            <div className="pure-control-group">
              <label for="personalidnumber">Personal ID Number</label>

              <input
                id="personalidnumber"
                placeholder="Personal ID number"
              />
              <span className="pure-form-message-inline">This is a required field.</span>
            
            </div>
            <div className="pure-control-group">
              <label for="firstname">Type of birth</label>
              <input
                id="type-of-birth"
                placeholder="Type of birth"
              />
              <span className="pure-form-message-inline">This is a required field.</span>
            
            </div>
            <div className="pure-control-group">
              <label for="state">District</label>
              <select id="state">
                <option>Ketu North</option>
                <option>Adaklu District</option>
                <option>Afadjato South District</option>
                <option>Agotime Ziope District</option>
                <option>Akatsi North District</option>
                <option>Akatsi South District</option>
                <option>Biakoye District</option>
                <option>Central Tongu District</option>
                <option>Ho Municipal District</option>
                <option>Ho West District</option>
                <option>Hohoe Municipal District</option>
                <option>Jasikan District</option>
                <option>Kadjebi District</option>
                <option>Keta Municipal District</option>
                <option>Ketu North District</option>
                <option>Ketu South Municipal District</option>
                <option>Kpando Municipal District</option>
                <option>Krachi East District</option>
                <option>Krachi Nchumuru District</option>
                <option>Krachi West District</option>
                <option>Nkwanta North District</option>
                <option>Nkwanta South District</option>
                <option>North Dayi District</option>
                <option>North Tongu District</option>
                <option>South Dayi District</option>
                <option>South Tongu District</option>
              </select>
              <span className="pure-form-message-inline">This is a required field.</span>
              </div>
          </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
);

export default WorkContainer;
