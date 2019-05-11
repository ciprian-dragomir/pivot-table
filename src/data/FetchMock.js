import fetchMock from 'fetch-mock';
import SalesOrders from './sales-orders.json';

const parseURL = (url) => {
  const params = new URL(url).searchParams;
  let rowDimensions = params.get('rows');
  rowDimensions = rowDimensions ? rowDimensions.split(',') : [];
  let columnDimensions = params.get('columns');
  columnDimensions = columnDimensions ? columnDimensions.split(',') : [];
  const region = ['rowStart', 'columnStart', 'rowCount', 'columnCount'].reduce(
    (acc, prop) => {
      acc[prop] = +params.get(prop);
      return acc;
    },
    {}
  );

  return { rowDimensions, columnDimensions, region };
};

const getStructuredRecords = (dimensions, records) => {
  const res = {};
  records.forEach((record) => {
    let tar = res;
    dimensions.forEach((dim, i) => {
      if (!tar[record[dim]]) {
        if (i === dimensions.length - 1) {
          tar[record[dim]] = [];
        } else {
          tar[record[dim]] = {};
        }
      }

      tar = tar[record[dim]];
    });

    tar.push(record);
  });

  return res;
};

const getDimensionElements = (dimensions, records) => {
  const elements = dimensions.reduce((acc, dim) => {
    acc[dim] = new Set();
    return acc;
  }, {});

  records.forEach(record => {
    dimensions.forEach(d => elements[d].add(record[d]));
  });

  return Object.entries(elements).reduce((acc, [k, v]) => {
    acc[k] = [...v].sort((a, b) => a.localeCompare(b));
    return acc;
  }, {});
};

const dataQuery = ({ rowDimensions, columnDimensions, region }) => {
  const dimensions = rowDimensions.concat(columnDimensions);
  const { rowStart, columnStart, rowCount, columnCount } = region;

  const dimensionalElements = getDimensionElements(dimensions, SalesOrders);
  const rows = dimensionalElements[rowDimensions[rowDimensions.length - 1]];
  const columns = dimensionalElements[columnDimensions[columnDimensions.length - 1]];



  // SalesOrders.reduce((acc, order) => {

  // },
  // { rowLabels: {}, columnLabels: {}, cells: {} });
  const structuredRecords = getStructuredRecords(dimensions, SalesOrders);
  const structuredColumnRecords = getStructuredRecords(columnDimensions, SalesOrders);
  

  console.log(structuredRecords, structuredColumnRecords);
};

Object.assign(fetchMock.config, {
  fallbackToNetwork: true,
  warnOnFallback: false,
});
fetchMock.mock(
  (url) => url.startsWith('https://api.mottion.com/ds'),
  (url) => {
    console.log('Fetch called with url', url);
    const query = parseURL(url);
    dataQuery(query);

    return { cells: [], rowLabels: [], columnLabels: [] };
  });