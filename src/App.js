import React from 'react';
import './App.scss';
import SalesOrders from './data/sales-orders.json';
import { Dimensions } from './data/Dimensions';
import DataBoundPivotTable from './components/DataBoundPivotTable';

console.log(SalesOrders);

const makeURL = (exampleId, rowDimensions, columnDimensions) =>
  ({ rowStart, columnStart, rowCount, columnCount }) =>
    `https://api.mottion.com/ds/${exampleId}?
  rows=${rowDimensions.join(',')}&columns=${columnDimensions.join(',')}&
  rowStart=${rowStart}&columnStart=${columnStart}&rowCount=${rowCount}&columnCount=${columnCount}`;

const examples = [
  {
    id: 'example1',
    rowCount: 10,
    columnCount: 10,
    rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
    columnDimensions: [Dimensions.State],
  },
  {
    id: 'example2',
    rowCount: 20,
    columnCount: 100,
    rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
    columnDimensions: [Dimensions.State],
  }
].map(example => ({ ...example, dataSource: makeURL(example.id, example.rowDimensions, example.columnDimensions) }));

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Pivot Table Demo</h1>
        <h3 className="author">by Ciprian Dragomir</h3>
      </header>
      <div className="app-examples">
        {examples.map(example => <DataBoundPivotTable key={example.id} {...example} />)}
      </div>
    </div>
  );
}

export default App;
