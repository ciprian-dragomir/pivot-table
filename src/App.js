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
    description: 'MVP - as illustrated in design and Google Sheet example.',
    rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
    columnDimensions: [Dimensions.State],
    metric: Metrics.Sales,
    title: ['PRODUCTS', 'STATES'],
  },
  {
    id: 'example2',
    description: 'Featuring two dimensions on both rows and columns.',
    rowDimensions: [Dimensions.Category, Dimensions.SubCategory],
    columnDimensions: [Dimensions.Region, Dimensions.State],
    metric: Metrics.Sales,
    title: ['PRODUCTS', 'STATES'],
  },
  {
    id: 'example3',
    description: 'One dimension on rows and three dimensions on columns. (There is known issue in relation to the grand total aggregation mentioned in the release notes).',
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

function ExampleDescription(props) {
  return (
    <div className="example-description">
      <h2>{props.id}</h2>
      <p>{props.description}</p>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Pivot Table Examples</h1>
        <h3 className="author">by Ciprian Dragomir</h3>
      </header>
      <div className="app-examples">
        {examples.map(example => <React.Fragment key={`ex-${example.id}`}>
          <ExampleDescription {...example} />
          <DataBoundPivotTable {...example} />
        </React.Fragment>)}
      </div>
    </div>
  );
}

export default App;
