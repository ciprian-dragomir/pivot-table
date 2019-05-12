import React from 'react';
import PropTypes from 'prop-types';
import PivotTable from './PivotTable';
import '../data/FetchMock';

export default class DataBoundPivotTable extends React.Component {

  static propTypes = {
    dataSource: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    fetch(this.props.dataSource)
      .then(response => response.json())
      .then((data) => this.setState({ data }));
  }

  render() {

    const { id, title } = this.props;

    return (
      <div className='pivot-table-container' ref={this.tableRef}>
        {this.state.data ?
          <PivotTable
            id={id}
            title={title}
            data={this.state.data}
          /> :
          null}
      </div>
    );
  }
}