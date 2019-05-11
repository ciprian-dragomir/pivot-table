import './FetchMock';

const DEBOUNCE_VALUE = 200; // ms
const EMPTY_CELL_VALUE = '...';

const cacheMap = new Map();
const getCacheForDataSource = (dataSource) => {
  let cache = cacheMap.get(dataSource);
  if (!cache) {
    cache = {
      columnLabels: {},
      rowLabels: {},
      cells: {},
      regionsRequested: new Set(),
    };
    cacheMap.set(dataSource, cache);
  } else {
    console.log('CACHE EXISTS', cache);
  }

  return cache;
};

export default (dataSource, onDataRetrieved) => {
  let debounceId = null;
  const { columnLabels, rowLabels, cells, regionsRequested } = getCacheForDataSource(dataSource);

  const cacheAccess = {
    getCellAt: (row, column) => {
      if (cells[row]) {
        const c = cells[row][column];
        return c || EMPTY_CELL_VALUE;
      }

      return EMPTY_CELL_VALUE;
    },
    getRowLabelAt: (rowIndex) => {
      return rowLabels[rowIndex] || rowIndex;
    },
    getColumnLabelAt: (columnIndex) => {
      return columnLabels[columnIndex] || columnIndex;
    },
  };

  return (region) => {
    const { rowStart, columnStart, rowCount, columnCount } = region;
    const regionId = `${rowStart}-${columnStart}-${rowCount}-${columnCount}`;

    if (regionsRequested.has(regionId)) {
      return cacheAccess;
    }

    regionsRequested.add(regionId);
    if (debounceId) {
      clearTimeout(debounceId);
    }

    debounceId = setTimeout(() => {
      console.log('Fetching data for', rowStart, columnStart);
      fetch(dataSource(region))
      .then(response => response.json())
      .then((data) => console.log(data));
      console.log(dataSource(region));

      for (let i = 0; i < rowCount; ++i) {
        rowLabels[i] = { value: `Row ${i}` };
        if (!cells[i]) {
          cells[i] = {};
        }

        for (let j = 0; j < columnCount; ++j) {
          cells[i][j] = { value: `${i * 100000 + j}` };
        }
      }

      for (let i = 0; i < columnCount; ++i) {
        columnLabels[i] = { value: `Col ${i}` };
      }

      if (typeof onDataRetrieved === 'function') {
        onDataRetrieved(cacheAccess);
      }
    }, DEBOUNCE_VALUE);
    return cacheAccess;
  };
};