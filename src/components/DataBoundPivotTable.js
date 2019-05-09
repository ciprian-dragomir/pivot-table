import React from 'react';
import PropTypes from 'prop-types';
import PivotTable from './PivotTable';
import pivotTableDataProvider from './PivotTableDataProvider';

export default class DataBoundPivotTable extends React.Component {

  static propTypes = {
    dataSource: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.state = {
      containerAvailable: false,
      // Delegate from props later
      startRow: 0,
      startColumn: 0,
    };
  }

  componentDidMount() {
    console.log('Component did mount', this.props);
    console.log(this.tableRef.current);
    this.setState({ containerAvailable: true });
  }

  render() {

    const { rowCount, columnCount, id } = this.props;
    const { startRow, startColumn } = this.state;
    const containerNode = this.tableRef.current;

    return (
      <div className='pivot-table-container' ref={this.tableRef}>
        {this.state.containerAvailable ?
          <PivotTable
            id={id}
            rowCount={rowCount}
            columnCount={columnCount}
            startColumn={startColumn}
            startRow={startRow}
            parentSize={{ 
              width: containerNode.offsetWidth,
              height: containerNode.offsetHeight,
            }}
            getData={pivotTableDataProvider(this.props.dataSource)}
          /> :
          null}
      </div>
    );
  }
}