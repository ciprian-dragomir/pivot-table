import React from 'react';
import ReactDOM from 'react-dom';
import PivotTable from './PivotTable';
import { Dimensions } from '../data/Dimensions';

const pivotTableData1 = {
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
    Edinburgh: null,
    London: null,
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
      London: 66,
      York: 0,
    }
  },
  grandTotal: {
    Edinburgh: 1.1,
    London: 2.2,
    York: 3.3,
  },
};

test('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <PivotTable
      data={pivotTableData1}
      id="TestTable1"
      title={['PRODUCTS', 'CITIES']}
    />, div);
});