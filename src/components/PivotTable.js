import React from 'react';
import PropTypes from 'prop-types';
import { DimensionNames } from '../data/Dimensions';

const traverseRows = (node, level, label = null) => {
  if (level === 0) {
    return {
      label,
      node,
      leafDescendantCount: 0,
    };
  }

  return Object.entries(node).reduce((acc, [key, value]) => {
    const child = traverseRows(value, level - 1, key);
    acc.children.push(child);
    acc.leafDescendantCount += child.leafDescendantCount || 1;
    return acc;
  }, { node, label, children: [], leafDescendantCount: 0 });
};

/**
 * Translate a object based column hierarchy, suitable for aggregations
 * to an array based structure which is more appropriate for traversal
 * and is sorted.
 */
const translateColumns = (columns, sort = (a, b) => a.localeCompare(b)) => {
  return Object.keys(columns).map(c => ({
    name: c,
    children: columns[c] ? translateColumns(columns[c], sort) : [],
  })).sort((a, b) => sort(a.name, b.name));
};

const applyLeafDescendantCount = (columnsArr, level) => {
  return columnsArr.map(column => {
    let leafDescendantCount = 1;
    let children = column.children;
    if (level > 1) {
      children = applyLeafDescendantCount(column.children, level - 1);
      leafDescendantCount = children.reduce((sum, { leafDescendantCount }) => sum + leafDescendantCount, 0);
    }

    return {
      ...column,
      children,
      leafDescendantCount,
    };
  });
};

const getRenderers = ({ formatValue, nextKey, rowDimensions, columnDimensions, totals }) => {
  const R = Object.freeze({
    renderNodeByColumn: (rowNode, columns) => {
      if (!rowNode || !Array.isArray(columns) || columns.length === 0) {
        return <td className="cell--numeric" key={nextKey()}>{rowNode ? formatValue(rowNode.value) : 0}</td>;
      }

      return columns.reduce((acc, { name, children }) => {
        const el = R.renderNodeByColumn(rowNode[name], children);
        if (Array.isArray(el)) {
          acc = [...acc, ...el];
        } else {
          acc.push(el);
        }

        return acc;
      }, []);
    },
    renderTotalsByColumn: (branchTotals, columns) => {
      return columns.reduce((acc, { name, children }) => {
        if (children.length === 0) {
          acc.push(<td className="total total--numeric" key={nextKey()}>{formatValue(branchTotals[name] || 0)}</td>);
        } else {
          acc.push(...R.renderTotalsByColumn(branchTotals, children));
        }
        return acc;
      }, []);
    },
    renderByRow: (rows, columns, level, preceding = []) => {
      // When the innermost level is reached in the table's left hand side,
      // (that is, for one branch in the dimension hierarchy), then generate 
      // all rows correlating to this level.
      // Preceding elements (with corresponding row spans) will be prepended
      // to the first row, as required.
      if (level === 0) {
        return rows.reduce((acc, r, i) => {
          const tdElements = [];
          if (i === 0) {
            tdElements.push(...preceding);
          }

          tdElements.push(
            <td key={nextKey()}>{r.label}</td>,
            ...R.renderNodeByColumn(r.node, columns),
          );
          acc.push(tdElements);

          return acc;
        }, []).map(r => <tr key={nextKey()}>{r}</tr>);
      }

      return rows.reduce((acc, { label, children, leafDescendantCount }) => {
        const td = <td key={nextKey()} rowSpan={leafDescendantCount}>{label}</td>;
        return [
          ...acc,
          ...R.renderByRow(children, columns, level - 1, [...preceding, td]),
          <tr key={nextKey()} className="total">
            <td colSpan={rowDimensions.length}>{`${label} total`}</td>
            {R.renderTotalsByColumn(totals[label], columns)}
          </tr>,
        ];
      }, []);
    },
    renderColumnsAtLevel: (columns, level) => {
      if (level === 0) {
        return columns.map(({ name, leafDescendantCount }) => <th key={nextKey()} colSpan={leafDescendantCount}>{name}</th>);
      }

      return columns.reduce((acc, column) => [
        ...acc,
        ...R.renderColumnsAtLevel(column.children, level - 1)],
        []);
    },
    renderHeaderRows: (title, columns) => {
      const totalLeafCount = columns.reduce((totalLeafCount, { leafDescendantCount }) => totalLeafCount + leafDescendantCount, 0);
      return [
        <tr key={nextKey()}>
          <th className="title" colSpan={rowDimensions.length}>{title[0]}</th>
          <th className="title" colSpan={totalLeafCount}>{title[1]}</th>
        </tr>,
        ...columnDimensions.map((cd, i) =>
          <tr key={nextKey()} data-level={columnDimensions.length - i - 1}>
            {i < columnDimensions.length - 1
              ? <th key={nextKey()} className="column-dimension" colSpan={rowDimensions.length}>{DimensionNames[cd]}</th>
              : rowDimensions.map((rd, j) => j < rowDimensions.length - 1
                ? <th key={nextKey()} className="row-dimension">{DimensionNames[rd]}</th>
                : <th key={nextKey()} className="row-dimension">{`${DimensionNames[rd]}/${DimensionNames[cd]}`}</th>
              )
            }
            {R.renderColumnsAtLevel(columns, i)}
          </tr>
        ),
      ];
    }
  });

  return R;
};

const PivotTable = (props) => {
  const {
    data,
    id,
    formatValue,
    title,
  } = props;

  const tableId = `pivotTable_${id}`;
  const {
    rows: rowData,
    columns: columnData,
    rowDimensions,
    columnDimensions,
    totals,
    grandTotal,
  } = data;
  // console.log(rowData, columnData, totals, grandTotal);
  // Rows and columns data structures differ
  const rows = traverseRows(rowData, rowDimensions.length);
  const columns = applyLeafDescendantCount(
    translateColumns(columnData),
    columnDimensions.length,
  );

  let nextKey = 0;
  const renderers = getRenderers({
    rowDimensions,
    columnDimensions,
    formatValue,
    totals,
    nextKey: () => nextKey++,
  });

  return (
    <div className="pivot-table" id={tableId}>
      <table>
        <colgroup>
          <col span={rowDimensions.length} className="pivot-table__side" />
        </colgroup>
        <thead>
          {renderers.renderHeaderRows(title, columns, rowDimensions, columnDimensions)}
        </thead>
        <tbody>
          {renderers.renderByRow(
            rows.children,
            columns,
            rowDimensions.length - 1,
          )}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={rowDimensions.length}>Grand total</th>
            {renderers.renderTotalsByColumn(grandTotal, columns)}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

PivotTable.propTypes = {
  data: PropTypes.object.isRequired,
  formatValue: PropTypes.func,
};

PivotTable.defaultProps = {
  formatValue: v => Math.round(v).toLocaleString(),
};

export default PivotTable;