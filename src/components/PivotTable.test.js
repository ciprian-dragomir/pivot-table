import React from 'react';
import ReactDOM from 'react-dom';
import PivotTable from './PivotTable';
import { Dimensions } from '../data/Dimensions';

const pivotTableData = {
  rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
  columnDimensions: [Dimensions.City],
  rows: {
    Fruit: {
      Apples: {
        London: { value: 125.32 },
        York: { value: 14.23 },
        Edinburgh: { value: 86.145 },
      },
      Bananas: {
        London: { value: 55.32 },
        York: { value: 66.05 },
        Edinburgh: { value: 42.97 },
      }
    },
    Vegetables: {
      Tomatoes: {
        London: { value: 288.45 },
        York: { value: 12.99 },
      },
      Potatoes: {
        London: { value: 422.10 },
      },
    }
  },
  columns: {
    London: null,
    Edinburgh: null,
    York: null,
  },
  totals: {
    Fruit: {
      Edinburgh: 128.143,
      London: 180.64,
      York: 80.28,
    },
    // Values need not represent the actual total since
    // the aggregation is not performed by the PivotTable component.
    Vegetables: {
      Edinburgh: 66,
      London: 60,
      York: 0,
    }
  },
  grandTotal: {
    Edinburgh: 1.1,
    London: 2.2,
    York: 3.3,
  },
};

const rowLabelArray = (rows, depth) => {
  if (depth) {
    return Object.keys(rows).reduce((acc, r) => {
      acc.push(r, ...rowLabelArray(rows[r], depth - 1));
      if (depth > 1) {
        acc.push(`${r} total`);
      }
      return acc;
    }, []);
  }

  return [];
};

const rowValuesAtDepth = (rows, depth) => {
  if (depth === 0) {
    return Object.values(rows);
  }

  return Object.keys(rows).reduce((acc, r) => {
    acc.push(...rowValuesAtDepth(rows[r], depth - 1));
    return acc;
  }, []);
};

const formatValue = v => String(Math.round(v));

const rowLabels = rowLabelArray(pivotTableData.rows, pivotTableData.rowDimensions.length);
const columnLabels = Object.keys(pivotTableData.columns).sort((a, b) => a.localeCompare(b));

/**
 * @TODO If timeRemaining, snapshot testing would be useful.
 */

describe('PivotTable tests', () => {

  let container;
  beforeEach(() => {
    container = document.createElement('container');
    ReactDOM.render(
      <PivotTable
        data={pivotTableData}
        id="TestTable1"
        title={['PRODUCTS', 'CITIES']}
      />, container);
  });

  test('renders with the correct id', () => {
    expect(container.querySelector('.pivot-table').getAttribute('id')).toBe('pivotTable_TestTable1');
  });

  test('renders table title correctly', () => {
    const titleNodeList = container.querySelectorAll('thead > tr th.title');
    expect(titleNodeList[0].textContent).toBe('PRODUCTS');
    expect(titleNodeList[1].textContent).toBe('CITIES');

    // Title elements should span across the correct number of columns in the table
    expect(titleNodeList[0].getAttribute('colSpan')).toBe(String(pivotTableData.rowDimensions.length));
    expect(titleNodeList[1].getAttribute('colSpan')).toBe(String(Object.keys(pivotTableData.columns).length));
  });

  test('renders column labels in the table header', () => {
    const columnLabelNodes = container.querySelectorAll('thead > tr:nth-child(2) th:not(.row-dimension)');
    columnLabels.forEach((columnName, i) => {
      expect(columnLabelNodes[i].textContent).toBe(columnName);
    });
  });

  test('renders row labels with correct row and column spans', () => {
    const rowLabelNodes = container.querySelectorAll('tbody > tr td:not(.cell--numeric):not(.total--numeric)');
    rowLabels.forEach((rowLabel, index) => {
      expect(rowLabelNodes[index].textContent).toBe(rowLabel);
      if (index % 4 === 0) {
        expect(rowLabelNodes[index].rowSpan).toBe(pivotTableData.rowDimensions.length);
      } else if ((index - 3) % 4 === 0) {
        expect(rowLabelNodes[index].colSpan).toBe(pivotTableData.rowDimensions.length);
      }
    });
  });

  test('renders data cells with correct values', () => {
    const cellNodes = container.querySelectorAll('tbody > tr td.cell--numeric');
    const rowValues = rowValuesAtDepth(pivotTableData.rows, 1);
    rowValues.forEach((rowValue, i) => {
      columnLabels.forEach((columnLabel, j) => {
        const cellContent = cellNodes[i * columnLabels.length + j].textContent;
        const expectedContent = rowValue[columnLabel]
          ? formatValue(rowValue[columnLabel].value) : "0";
        expect(cellContent).toBe(expectedContent);
      });
    });
  });

  test('renders total values correctly', () => {
    const totalsNodeLists = [3, 6]
      .map(rowIndex => container.querySelectorAll(`tbody > tr:nth-child(${rowIndex}) td.total--numeric`));
    columnLabels.forEach((columnLabel, i) => {
      expect(totalsNodeLists[0][i].textContent).toBe(
        formatValue(pivotTableData.totals.Fruit[columnLabel]));
      expect(totalsNodeLists[1][i].textContent).toBe(
        formatValue(pivotTableData.totals.Vegetables[columnLabel]));
    });
  });

  test('renders grand totals in the table footer', () => {
    const grandTotalsNodeList = container.querySelectorAll('tfoot > tr td.total--numeric');
    columnLabels.forEach((columnLabel, i) => {
      expect(grandTotalsNodeList[i].textContent)
        .toBe(formatValue(pivotTableData.grandTotal[columnLabel]));
    });
  });
});

