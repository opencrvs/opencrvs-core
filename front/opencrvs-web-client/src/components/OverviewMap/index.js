

import React from 'react';
import styles from './styles.css';
import { connect } from 'react-redux';
import { geoMercator, geoPath } from 'd3-geo';
import Navigation from 'react-toolbox/lib/navigation';
import Link from 'react-toolbox/lib/link';
import Dropdown from 'react-toolbox/lib/dropdown';
import { calculateRagStatusOnMap } from 'utils/manager-utils';
import OverviewPerformance from 'components/OverviewPerformance';
import { get, map, head } from 'lodash';

class OverviewMap extends React.Component {
  constructor(props) {
    super(props);
  }

  projection(scale, transX, transY) {
    return geoMercator()
      .scale(scale)
      .translate([transX / 2, transY]);
  }

  onMouseOut(e) {
    e.target.setAttribute('style', 'opacity: 1');
    this.props.disableTooltipData();
  }
  onMouseOver(e, mapData, regionIndex) {
    e.target.setAttribute('style', 'opacity: 0.70');
    if (this.props.countryLevel) {
      this.props.updateTooltipData(mapData[regionIndex].properties.HRname);
    }

    if (this.props.regionLevel) {
      this.props.updateTooltipData(mapData[regionIndex].properties.NAME_2);
    }
  }

  handleRegionClick(e, mapData, regionIndex) {
    if (this.props.countryLevel) {
      if (mapData[regionIndex].properties.HRname == 'Volta') {
        this.props.onRegionClick(mapData[regionIndex].properties.HRname);
      }
    }
    if (this.props.regionLevel) {
      this.props.updateTooltipData(mapData[regionIndex].properties.NAME_2);
    }
  }

  handleEventFilter = (value) => {
    this.props.onEventChange(value);
  }

  handlePeriodFilter = (value) => {
    this.props.onPeriodChange(value);
  }

  handleBreadcrumbClick(e, name) {
    if (name == this.props.country && this.props.regionLevel) {
      this.props.onCountryClick();
    }
  }

  randomIntFromInterval = ( min, max ) => {
    return Math.floor(Math.random() * ( max - min + 1 ) + min);
  }

  render = () => {
    const { selectedLocation,
            selectedLocationMapData,
            selectedRegion,
            countryLevel,
            regionLevel,
            districtLevel,
            selectedDistrict,
            mapLocations,
            mapEvent,
            mapTimePeriod,
            totalCerts,
            rolloverMapData,
            country } = this.props;
    const myCountry = country.charAt(0).toUpperCase() + country.slice(1);
    let reg28Days = null;
    let reg1Year = null;
    let certRate = null;
    let regUnder5 = null;
    let regAllIndividuals = null;
    if (selectedLocation && rolloverMapData == null) {
      if (selectedLocation.title == 'Ghana') {
        reg28Days = 20;
        reg1Year = 56;
        certRate = 80;
        regUnder5 = 70;
        regAllIndividuals = 41;
      } else if (selectedLocation.title == 'Volta') {
        reg28Days = 10;
        reg1Year = 31;
        certRate = 60;
        regUnder5 = 42;
        regAllIndividuals = 31;
      } else {
        reg28Days = this.randomIntFromInterval(20, 30);
        reg1Year = this.randomIntFromInterval(50, 60);
        certRate = this.randomIntFromInterval(78, 85);
        regUnder5 = this.randomIntFromInterval(68, 80);
        regAllIndividuals = Math.round((totalCerts.registrations / totalCerts.registrationsKpi) * 100);
      }
      
    } else if (rolloverMapData) {
      
      if (rolloverMapData.title == 'Volta' || rolloverMapData.title == 'Adaklu Anyigbe') {
        reg28Days = 10;
        reg1Year = 31;
        certRate = 60;
        regUnder5 = 42;
        regAllIndividuals = 31;
      } else {
        reg28Days = this.randomIntFromInterval(20, 30);
        reg1Year = this.randomIntFromInterval(50, 60);
        certRate = this.randomIntFromInterval(78, 85);
        regUnder5 = this.randomIntFromInterval(68, 80);
        regAllIndividuals = Math.round((totalCerts.registrations / totalCerts.registrationsKpi) * 100);
      }
      if (rolloverMapData.title == 'Adaklu Anyigbe') {
        regAllIndividuals = 10;
      }
    }


    let scale;
    let transX;
    let transY;
    if (countryLevel) {
      scale = 3000;
      transX = 800;
      transY = 620;
    }
    if (regionLevel) {
      scale = 6000;
      transX = 610;
      transY = 940;
    }
    let vitalEvents = [];
    let timePeriods = [];
    map(mapLocations.country.events, (event, index ) => {
      let obj = {label:null, value: null};
      obj.value = get(event, 'type');
      obj.label = obj.value.charAt(0).toUpperCase() + obj.value.slice(1);
      vitalEvents.push(obj);
    });
    map(get(head(mapLocations.country.events), 'timePeriod'), (period, index ) => {
      let obj = {label:null, value: null};
      obj.value = obj.label = get(period, 'title');
      timePeriods.push(obj);
    });
    return (
      <div className={styles.overviewMap + ' pure-g'}>
        <div className="pure-u-1-3">
          <Navigation type="horizontal">
            <Link label={
              regionLevel
              ? myCountry + ' > '
              : myCountry
            } active={countryLevel}
            onClick={ (e) => this.handleBreadcrumbClick(e, country) } />
            { regionLevel && <Link label={selectedRegion} active={regionLevel}
              onClick={ (e) => this.handleBreadcrumbClick(e, selectedRegion) } /> }
            { districtLevel && <Link label={selectedRegion + ' > '} active={regionLevel}
              onClick={ (e) => this.handleBreadcrumbClick(e, selectedRegion) } /> }
            { districtLevel && <Link label={selectedDistrict}  active={districtLevel}
              onClick={ (e) => this.handleBreadcrumbClick(e, selectedDistrict) } /> }
          </Navigation>
          <div className={ styles.dropdownOption }>
            <Dropdown
              auto
              onChange={this.handleEventFilter}
              source={vitalEvents}
              value={mapEvent}
              label="Life Event"
            />
            <Dropdown
              auto
              onChange={this.handlePeriodFilter}
              source={timePeriods}
              value={mapTimePeriod}
              label="Timeframe"
            />
            <div className={styles.certifications}>
              <p className={styles.title}>Registration within 28 days of birth:  
              <span className={styles.totalCerts}>
              { reg28Days }%
              </span></p>
              <p className={styles.title}>Registration within 1 year of birth:  
              <span className={styles.totalCerts}>
              { reg1Year }%
              </span></p>
              <p className={styles.title}>Rate of certification:  
              <span className={styles.totalCerts}>
                { certRate }%
              </span></p>
              <p classname={styles.titleBlack}>As of 19/10/2017:</p>
              <p className={styles.title}>Registration of children under 5:  
              <span className={styles.totalCerts}>
              { regUnder5 }%
              </span></p>
              <p className={styles.title}>Registration of all individuals:  
              <span className={styles.totalCerts}>
              { regAllIndividuals }%
              </span></p>
            </div>
          </div>
        </div>
        <div className="pure-u-1-3">
          <div className={
          countryLevel
          ? styles.mapSvgContainerCountry
          : styles.mapSvgContainerRegion
          }>
            <svg preserveAspectRatio="xMinYMin meet" viewBox="0 0 800 450" className={styles.mapSvg}  >
              <g className={styles.svgG}>
                {
                  selectedLocationMapData.map((d, i) => (
                    <path
                      key={ `path-${ i }` }
                      d={ geoPath().projection(this.projection(scale, transX, transY))(d) }
                      fill={calculateRagStatusOnMap(
                        selectedLocationMapData,
                        i,
                        selectedLocation.subEntries.entries,
                        mapEvent,
                        mapTimePeriod,
                        countryLevel,
                        regionLevel)}
                      style={{ opacity: 1 }}
                      stroke="#000000"
                      strokeWidth={ 0.5 }
                      onClick={ (e) => this.handleRegionClick(e, selectedLocationMapData, i) }
                      onMouseOut={ (e) => this.onMouseOut(e, selectedLocationMapData, i) }
                      onMouseOver={ (e) => this.onMouseOver(e, selectedLocationMapData, i) }
                    />
                  ))
                }
                </g>
            </svg>
          </div>
        </div>
        <div className="pure-u-1-3">
          <OverviewPerformance {...this.props} />
        </div>
      </div>
    );
  }
}


const mapStateToProps = ({ managerReducer, globalReducer }) => {
  const { selectedLocation,
          subLocation,
          selectedLocationMapData,
          selectedRegion,
          selectedDistrict,
          countryLevel,
          regionLevel,
          mapEvent,
          mapTimePeriod,
          districtLevel,
          totalCerts,
          rolloverMapData } = managerReducer;
  const { country } = globalReducer;
  return {
    selectedLocation,
    selectedRegion,
    selectedDistrict,
    subLocation,
    selectedLocationMapData,
    country,
    countryLevel,
    regionLevel,
    districtLevel,
    mapEvent,
    mapTimePeriod,
    totalCerts,
    rolloverMapData,
  };
};

export default connect(mapStateToProps, null)(OverviewMap);
