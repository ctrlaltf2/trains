import React from 'react';

import './Metrics.css';

class Metrics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { redLine, greenLine } = this.props;

    return (
      <div className="metricsContainer"/>
    );
  }
};

export default Metrics;
