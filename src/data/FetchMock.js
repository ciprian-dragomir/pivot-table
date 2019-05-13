import fetchMock from 'fetch-mock';
import dataQuery from './DataQuery';

const parseURL = (url) => {
  const params = new URL(url).searchParams;
  let rowDimensions = params.get('rows');
  rowDimensions = rowDimensions ? rowDimensions.split(',') : [];
  let columnDimensions = params.get('columns');
  columnDimensions = columnDimensions ? columnDimensions.split(',') : [];
  let metric = params.get('metric');

  return { rowDimensions, columnDimensions, metric };
};

Object.assign(fetchMock.config, {
  fallbackToNetwork: true,
  warnOnFallback: false,
});

fetchMock.mock(
  (url) => url.startsWith('https://api.mottion.com/ds'),
  (url) => {
    console.log('Fetching url', url);
    return dataQuery(parseURL(url));
  });