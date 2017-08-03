/*
 * @Author: Euan Millar 
 * @Date: 2017-07-14 20:45:00 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-28 19:42:18
 */

import React from 'react';
// import PropTypes from 'prop-types';
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card';
import { Button } from 'react-toolbox/lib/button';

class ImageCard extends React.Component {
 /* static defaultProps = {
    imageUrl: 'blah',
    imageTitle: 'blah',
    imageSubtitle: 'blah',
  }

  static propTypes = {
    imageUrl: PropTypes.string.isRequired,
    imageTitle: PropTypes.string,
    imageSubtitle: PropTypes.string,
  }
*/
  handleZoom = (event) => {
    this.props.onZoomImage(this.props.id);
  }


  handleDelete = (event) => {
    this.props.onDeleteImage(this.props.id);
  }

  render = () => {
    const { 
      imageUrl, 
      imageTitle, 
      imageSubtitle,
    } = this.props;

    return (
      <Card>
        <CardMedia
          aspectRatio="wide"
          image={imageUrl}
        />
        <CardTitle
          title={imageTitle}
          subtitle={imageSubtitle}
        />
        <CardActions>
          <Button icon="delete" label="Trash" flat onClick={this.handleDelete} />
          <Button icon="search" label="Zoom" flat onClick={this.handleZoom} />
        </CardActions>
      </Card>
    );
  }
}

export default ImageCard;

