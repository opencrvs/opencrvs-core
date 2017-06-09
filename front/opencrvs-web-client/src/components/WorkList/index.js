import React from 'react';
import styles from './styles.css';
import SearchForm from 'components/SearchForm';



const WorkList = ({props}) => (
    <div className={styles.list + ' pure-u-1'}>
      <SearchForm {...props} />
      <div className={styles.workItem + ' pure-g'}>
        <div className="pure-u">
          <span className={styles.labelDeclaration}></span>
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
          <span className={styles.labelValidation} ></span>
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
          <span className={styles.labelDeclaration} ></span>
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
          <span className={styles.labelDeclaration} ></span>
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
          <span className={styles.labelRegistration} ></span>
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
          <span className={styles.labelRegistration} ></span>
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
);

export default WorkList;

    