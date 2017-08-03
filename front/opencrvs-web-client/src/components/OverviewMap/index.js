

import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';
import { geoMercator, geoPath } from 'd3-geo';
import Navigation from 'react-toolbox/lib/navigation';
import Link from 'react-toolbox/lib/link';

class OverviewMap extends React.Component {
  constructor(props) {
    super(props);
  }

  projection() {
    return geoMercator()
      .scale(3000)
      .translate([800 / 2, 620]);
  }

  onMouseOut(e) {
    e.target.setAttribute('style', 'opacity: 1');
  }
  onMouseOver(e) {
    e.target.setAttribute('style', 'opacity: 0.5');
  }

  handleRegionClick(e, mapData, regionIndex) {
    this.props.onRegionClick(mapData[regionIndex].properties.HRname);
  }

  render = () => {
    const { selectedLocation,
            subLocation,
            selectedLocationMapData } = this.props;
    console.log(selectedLocation);
    return (
      <div className="pure-g">
        <div className={ styles.mapBreadcrumbs + ' pure-u-1 pure-u-md-1-1'}>
          <Navigation type="vertical">
            <Link label={selectedLocation.title} active />
          </Navigation>
        </div>
        <div className={ styles.mapSvgContainer + ' pure-u-1 pure-u-md-1-1'}>
          <svg preserveAspectRatio="xMinYMin meet" viewBox="0 0 800 450" className={styles.mapSvg}  >
            <g className={styles.svgG}>
              {
                selectedLocationMapData.map((d, i) => (
                  <path
                    key={ `path-${ i }` }
                    d={ geoPath().projection(this.projection())(d) }
                    fill="#FFFFFF"
                    style={{ opacity: 1 }}
                    stroke="#000000"
                    strokeWidth={ 0.5 }
                    onClick={ (e) => this.handleRegionClick(e, selectedLocationMapData, i) }
                    onMouseOut={ (e) => this.onMouseOut(e) }
                    onMouseOver={ (e) => this.onMouseOver(e) }
                  />
                ))
              }
              </g>
          </svg>
        </div>
      </div>
    );
  }
}

   
const mapStateToProps = ({ managerReducer }) => {
  const { selectedLocation,
          subLocation,
          selectedLocationMapData } = managerReducer;
  return {
    selectedLocation,
    subLocation,
    selectedLocationMapData,
  };
};

export default connect(mapStateToProps, null)(OverviewMap);
