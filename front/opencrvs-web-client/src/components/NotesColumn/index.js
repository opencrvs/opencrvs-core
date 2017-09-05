import React from 'react';
import styles from './styles.css';
import { map } from 'lodash';

class NotesColumn extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const {title, notes} = this.props;
   
    return (
      <div className={styles.column + ' pure-u-1-6'}>
      <div className={styles.title}>{title}</div>
      {
        map(notes, (note, index ) => (
          <div className={styles.sub}>
            <strong>{note.note}</strong>
            -{note.date}
          </div>
      ))}
    </div>
    );
  }
}

   

export default NotesColumn;
