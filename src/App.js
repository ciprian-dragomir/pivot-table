import React from 'react';
import './App.scss';
import { Dimensions } from './data/Dimensions';
import DataBoundPivotTable from './components/DataBoundPivotTable';
import Metrics from './data/Metrics';

const makeURL = (exampleId, rowDimensions, columnDimensions, metric) =>
    `https://api.mottion.com/ds/${exampleId}?rows=${rowDimensions.join(',')}&columns=${columnDimensions.join(',')}&metric=${metric}`;

const examples = [
  {
    id: 'example1',
    rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
    columnDimensions: [Dimensions.State],
    metric: Metrics.Sales,
    title: ['PRODUCTS', 'STATES'],
  },
  {
    id: 'example2',
    rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
    columnDimensions: [Dimensions.Region, Dimensions.State],
    metric: Metrics.Sales,
    title: ['PRODUCTS', 'STATES'],
  },
  {
    id: 'example3',
    rowDimensions: [Dimensions.Category],
    columnDimensions: [Dimensions.Region, Dimensions.State, Dimensions.City],
    metric: Metrics.Sales,
    title: ['PRODUCTS', 'CITIES'],
  },
].map(example => ({
  ...example,
  dataSource: makeURL(
    example.id,
    example.rowDimensions,
    example.columnDimensions,
    example.metric,
  )
}));

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
