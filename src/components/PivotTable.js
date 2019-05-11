import React from 'react';
import PropTypes from 'prop-types';

const tableSide = (props) => {

};

const tableHead = (props) => {

};

const generateTableCss = (config) => {
  const {
    rowsVisible,
    columnsVisible,
    rowHeight,
    columnWidth,
    id,
  } = config;
  
  let css = `#${id} > div {width:${columnWidth}px;height:${rowHeight}px}`;
  for (let i = 0; i < rowsVisible; ++i) {
    css = `${css}\n#${id} .r${i} {top:${i * rowHeight}px}`;
  }

  for (let i = 0; i < columnsVisible; ++i) {
    css = `${css}\n#${id} .c${i} {left:${i * columnWidth}px}`;
  }

  return css;
};

const PivotTable = (props) => {
  const {
    rowCount,
    columnCount,
    rowStart,
    columnStart,
    rowHeight,
    columnWidth,
    parentSize,
    getData,
    id,
  } = props;

  const { width: parentWidth, height: parentHeight } = parentSize;
  console.log(parentWidth);

  const rowsVisible = Math.min(rowCount, Math.ceil(parentHeight / rowHeight));
  const columnsVisible = Math.min(columnCount, Math.ceil(parentWidth / columnWidth));

  console.log(rowsVisible, columnsVisible);
  const { getCellAt, getColumnLabelAt, getRowLabelAt } = getData({rowStart, columnStart, rowCount: rowsVisible, columnCount: columnsVisible });

  const cellElements = [];
  const rowLabelElements = [];
  const columnLabelElements = [];

  for(let i = rowStart; i < rowsVisible; ++i) {
    let label = getRowLabelAt(i);
    

    for(let j = columnStart; j < columnsVisible; ++j) {
      let cell = getCellAt(i, j);
      cell = typeof cell.value !== 'undefined' ? cell.value : cell;
      cellElements.push(
        <div key={`cell-${i}-${j}`} className={`r${i} c${j}`}>{cell}</div>
      );
    }
  }

  const tableId = `t_${id}`;
  return (
    <div className="pivot-table" id={tableId}>
      <style>{generateTableCss({ id: tableId, rowsVisible, columnsVisible, rowHeight, columnWidth })}</style>
      {cellElements}
    </div>
  );
};

PivotTable.propTypes = {
  rowCount: PropTypes.number.isRequired,
  columnCount: PropTypes.number.isRequired,
  rowStart: PropTypes.number.isRequired,
  columnStart: PropTypes.number.isRequired,
  parentSize: PropTypes.object.isRequired,
  getData: PropTypes.func.isRequired,
};

PivotTable.defaultProps = {
  rowCount: 0,
  columnCount: 0,
  rowStart: 0,
  columnStart: 0,
  rowHeight: 30,
  columnWidth: 80,
};

export default PivotTable;