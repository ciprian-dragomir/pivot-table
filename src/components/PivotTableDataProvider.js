// Mock fetch

const DEBOUNCE_VALUE = 200; // ms

export default (dataSource) => {
  let debounceId = null;
  return (region) => {

    if (debounceId) {
      clearTimeout(debounceId);
    }

    const { rowStart, columnStart } = region;
    debounceId = setTimeout(() => {
      console.log('Fetching data for', rowStart, columnStart);
      console.log(dataSource(region));
    }, DEBOUNCE_VALUE);
  };
};