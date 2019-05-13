import SalesOrders from './sales-orders.json';
import Metrics from './Metrics.js';

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

/**
 * If timeRemaining > 0, investigate this on hierarchical structures already computed and
 * for each parent level in the hierarchy.
 * 
 * Note: Assuming unique leaf level column names to proceed faster.
 * This is incorrect however, there are cases where the same entity name appears
 * associated with two or more properties 
 * (for example Bloomington appears both in Indiana and Illinois)
 */
const computeTotalsForDimension = (dimensionPredicate, columnDimension, records, metric) => {
  const filteredRecords = records.filter(dimensionPredicate);
  const columns = filteredRecords.reduce((acc, rec) => {
    acc.add(rec[columnDimension]);
    return acc;
  }, new Set());

  return Array.from(columns).reduce((acc, c) => {
    acc[c] = filteredRecords.filter(record => record[columnDimension] === c)
      .reduce((sum, record) => sum + record[metric], 0);
    return acc;
  }, {});
};

/**
 * Generates a data structure sufficient and optimal for rendering
 * a pivot table out of list of entries where each member can be
 * a dimension and properties with numeric values can be featured as metrics.
 */
export default ({ rowDimensions, columnDimensions, metric }) => {
  const dimensions = rowDimensions.concat(columnDimensions);
  const rows = getDataFromRecords(dimensions, SalesOrders, metric);
  const columns = getDataFromRecords(columnDimensions, SalesOrders, metric, false);

  const totals = Object.keys(rows).reduce((totals, dimension) => {
    totals[dimension] = computeTotalsForDimension(
      rec => rec[rowDimensions[0]] === dimension,
      columnDimensions[columnDimensions.length - 1],
      SalesOrders,
      Metrics.Sales
    );
    return totals;
  }, {});

  const grandTotal = computeTotalsForDimension(
    () => true, columnDimensions[columnDimensions.length - 1], SalesOrders, Metrics.Sales);

  return {
    rows, columns, rowDimensions, columnDimensions, totals, grandTotal,
  }
};