/*
 * @Author: Euan Millar 
 * @Date: 2017-07-13 11:58:11 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-13 12:51:56
 */
import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';

const UserAvatar = ({
  given,
  family,
  avatar,
  workView,
}) => (
  <img
    className={
      !workView
        ? styles.homeAvatar
        : styles.workAvatar
    }
    alt={given + ' ' + family  + '&#x27;s avatar'}
    src={'static/img/avatars/' + avatar}
  />
);
const mapStateToProps = ({ declarationsReducer }) => {
  const { workView } = declarationsReducer;
  return {
    workView,
  };
};

export default connect(mapStateToProps, null)(UserAvatar);
