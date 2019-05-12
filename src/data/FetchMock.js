import fetchMock from 'fetch-mock';
import SalesOrders from './sales-orders.json';

const parseURL = (url) => {
  const params = new URL(url).searchParams;
  let rowDimensions = params.get('rows');
  rowDimensions = rowDimensions ? rowDimensions.split(',') : [];
  let columnDimensions = params.get('columns');
  columnDimensions = columnDimensions ? columnDimensions.split(',') : [];
  let metric = params.get('metric');

  return { rowDimensions, columnDimensions, metric };
};

const getDataFromRecords = (dimensions, records, metric, aggregate = (a, b) => a + b) => {
  const res = {};
  records.forEach((record) => {
    let tar = res;
    dimensions.forEach((dim, i) => {
      if (!tar[record[dim]]) {
        if (i === dimensions.length - 1) {
          tar[record[dim]] = aggregate ? { value: 0 } : null;
        } else {
          tar[record[dim]] = {};
        }
      }

      tar = tar[record[dim]];
    });

    if (aggregate) {
      tar.value = aggregate(tar.value, record[metric]);
    }
  });

  return res;
};

const dataQuery = ({ rowDimensions, columnDimensions, metric }) => {
  const dimensions = rowDimensions.concat(columnDimensions);
  const rows = getDataFromRecords(dimensions, SalesOrders, metric);
  const columns = getDataFromRecords(columnDimensions, SalesOrders, metric, false);

  console.log(rows, columns);
  return {
    rows, columns, rowDimensions, columnDimensions,
  }
};

Object.assign(fetchMock.config, {
  fallbackToNetwork: true,
  warnOnFallback: false,
});

fetchMock.mock(
  (url) => url.startsWith('https://api.mottion.com/ds'),
  (url) => {
    console.log('Fetch called with url', url);
    return dataQuery(parseURL(url));
  });