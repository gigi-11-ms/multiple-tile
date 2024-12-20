import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {ComparisonDataPoint} from './ComparisonDataPoint';
import ReactHtmlParser from 'react-html-parser';
import DOMPurify from 'dompurify';
import {removeStyles, loadStylesheet} from '../lib/common';

const DataPointsWrapper = styled.div`
  font-family: 'Google Sans', 'Roboto', 'Noto Sans JP', 'Noto Sans',
    'Noto Sans CJK KR', Helvetica, Arial, sans-serif;
  display: ${props => (props.gridColumns ? 'grid' : 'flex')};
  flex-direction: ${props =>
    props.layout === 'horizontal' ? 'row' : 'column'};
  grid-template-columns: ${props =>
    props.gridColumns ? `repeat(${props.gridColumns}, 1fr)` : 'unset'};
  align-items: center;
  margin: 10px;
  height: 100%;
`;

const dataPointGroupDirectionDict = {
  below: 'column',
  above: 'column-reverse',
  left: 'row-reverse',
  right: 'row',
};

const DataPointGroup = styled.div`
  margin: 20px 5px;
  text-align: center;
  width: 100%;
  display: flex;
  flex-shrink: ${props => (props.layout === 'horizontal' ? 'auto' : 0)};
  flex-direction: ${props =>
    props.comparisonPlacement
      ? dataPointGroupDirectionDict[props.comparisonPlacement]
      : 'column'};
  align-items: center;
  justify-content: center;
`;
const Divider = styled.div`
  background-color: #282828;
  height: 35vh;
  width: 1px;
`;

const DataPoint = styled.div`
  display: flex;
  flex-shrink: ${props => (props.layout === 'horizontal' ? 'auto' : 0)};
  flex-direction: ${props =>
    props.titlePlacement === 'above' ? 'column' : 'column-reverse'};
  flex: 1;
`;

const DataPointTitle = styled.div`
  font-weight: 100;
  color: ${props => props.color};
  margin: 5px 0;
`;

const DataPointValue = styled.div`
  font-size: 3em;
  font-weight: 100;
  color: ${props => props.color};

  a.drillable-link {
    color: ${props => props.color};
    text-decoration: none;
  }
  :hover {
    text-decoration: underline;
  }
`;
const parser = new DOMParser();

class MultipleValue extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.groupingLayout = 'horizontal';
    this.state.fontSize = this.calculateFontSize();
  }

  componentDidMount() {
    const {
      config: {loadCustomTheme, customTheme},
    } = this.props;
    if (loadCustomTheme) {
      removeStyles();
      loadStylesheet(customTheme);
    } else {
      removeStyles();
    }
    window.addEventListener('resize', this.recalculateSizing);
  }

  componentDidUpdate() {
    console.log('update');
    const {
      config: {loadCustomTheme, customTheme},
    } = this.props;
    if (loadCustomTheme) {
      removeStyles();
      loadStylesheet(customTheme);
    } else {
      removeStyles();
    }
    this.recalculateSizing();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateSizing);
  }

  getLayout = () => {
    let CONFIG = this.props.config;
    if (
      CONFIG['orientation'] === 'auto' ||
      typeof CONFIG['orientation'] === 'undefined'
    ) {
      return this.state.groupingLayout;
    }
    return CONFIG['orientation'];
  };

  getWindowSize = () => {
    return Math.max(window.innerWidth, window.innerHeight);
  };

  calculateFontSize = () => {
    const multiplier =
      this.state.groupingLayout === 'horizontal' ? 0.015 : 0.02;
    return Math.round(this.getWindowSize() * multiplier);
  };

  handleClick = (cell, event) => {
    cell.link !== undefined
      ? LookerCharts.Utils.openDrillMenu({
          links: cell.link,
          event: event,
        })
      : LookerCharts.Utils.openDrillMenu({
          links: [],
          event: event,
        });
  };

  recalculateSizing = () => {
    const EM = 16;
    const groupingLayout = window.innerWidth >= 768 ? 'horizontal' : 'vertical';

    let CONFIG = this.props.config;

    var font_check = CONFIG.font_size_main;
    var font_size =
      font_check !== '' && typeof font_check !== 'undefined'
        ? CONFIG.font_size_main
        : this.calculateFontSize();
    font_size = font_size / EM;

    this.setState({
      fontSize: font_size,
      groupingLayout,
    });
  };

  checkData = compDataPoint => {
    return !compDataPoint | (typeof !compDataPoint === 'undefined');
  };

  render() {
    const {config, data} = this.props;
    let message;
    let display = false;

    console.log({config, data});

    return (
      <DataPointsWrapper
        className={'grid'}
        layout={this.getLayout()}
        font={config['grouping_font']}
        gridColumns={config.gridColumns}
        style={{fontSize: `${this.state.fontSize}em`}}
      >
        {data.map((dataPoint, index) => {
          const compDataPoint = dataPoint.comparison;
          if (compDataPoint < 0 || compDataPoint > 0) {
            display = false;
          } else if (compDataPoint === 0 || compDataPoint === null) {
            display = true;
            message = (
              <a>
                {
                  'Comparison point can not be zero. Adjust the value to continue.'
                }
              </a>
            );
          }

          return (
            <>
              <DataPointGroup
                className={'grid__group'}
                comparisonPlacement={
                  compDataPoint &&
                  config[`comparison_label_placement_${compDataPoint.name}`]
                }
                key={`group_${dataPoint.name}`}
                layout={this.getLayout()}
              >
                <DataPoint
                  className={'grid__group__item'}
                  titlePlacement={config[`title_placement_${dataPoint.name}`]}
                >
                  {config[`show_title_${dataPoint.name}`] === false ? null : (
                    <DataPointTitle
                      color={config[`style_${dataPoint.name}`]}
                      className={'item__label'}
                    >
                      {config[`title_override_${dataPoint.name}`] ||
                        dataPoint.label}
                    </DataPointTitle>
                  )}
                  <DataPointValue
                    className={'item__value'}
                    color={config[`style_${dataPoint.name}`]}
                    onClick={() => {
                      this.handleClick(dataPoint, event);
                    }}
                    layout={this.getLayout()}
                  >
                    {config[`show_total_${dataPoint.name}`]
                      ? dataPoint.fomrattedTotalValue
                      : dataPoint.html
                      ? ReactHtmlParser(DOMPurify.sanitize(dataPoint.html))
                      : dataPoint.formattedValue}
                  </DataPointValue>
                </DataPoint>
                {this.checkData(compDataPoint) ? null : (
                  <ComparisonDataPoint
                    config={config}
                    compDataPoint={compDataPoint}
                    dataPoint={dataPoint}
                    handleClick={this.handleClick}
                  />
                )}
              </DataPointGroup>
              {config.dividers &&
                config.orientation === 'horizontal' &&
                index < data.length - 1 && <Divider />}
            </>
          );
        })}
        {display && message}
      </DataPointsWrapper>
    );
  }
}

MultipleValue.propTypes = {
  config: PropTypes.object,
  data: PropTypes.array,
};

export default MultipleValue;
