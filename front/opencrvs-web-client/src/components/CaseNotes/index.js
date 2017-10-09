import React, { Component } from 'react';
import styles from './styles.css';
import { map } from 'lodash';
import NotesColumn from 'components/NotesColumn';

class CaseNotes extends Component {
  handleChange = (name, value) => {
    console.log(value);
  }

  render = () => {
    const { caseNotes } = this.props;

    return (
      <div className="pure-u-1-1 pure-u-md-1-1">
        <div className={styles.caseNotesTable}>
          <div className="pure-g">
          {
            map(caseNotes, (note, index ) => (
              <NotesColumn
                key={note.id}
                title={note.title}
                notes={note.notes}
              />
          ))}
          </div>
        </div>
      </div>
    );
  }
}

export default CaseNotes;
