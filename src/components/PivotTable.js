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
  return columnsArr.map(column => ({
    ...column,
    leafDescendantCount: level === 1
      ? 1
      : applyLeafDescendantCount(column.children, level - 1)
        .reduce((sum, { leafDescendantCount }) => sum + leafDescendantCount, 0),
  }));
};

const getRenderers = ({ formatValue, nextKey }) => {
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
          <tr key={nextKey()} className="total"><td colSpan={level + 1}>{`${label} total`}</td></tr>,
        ];
      }, []);
    },
    renderHeader: (title, columns, level) => {
      if (level === 1) {

      }
    },
    renderHeaderRows: (title, columns, rowDimensions, columnDimensions) => {
      const totalLeafCount = columns.reduce((totalLeafCount, { leafDescendantCount }) => totalLeafCount + leafDescendantCount, 0);
      return [
        <tr key={nextKey()}>
          <th className="title" colSpan={rowDimensions.length}>{title[0]}</th>
          <th className="title" colSpan={totalLeafCount}>{title[1]}</th>
        </tr>,
        ...columnDimensions.map((cd, i) =>
          <tr>
            {i < columnDimensions.length - 1 
            ? <th className="column-dimension" colSpan={rowDimensions.length}>{DimensionNames[cd]}</th>
            : rowDimensions.map((rd, j) => j < rowDimensions.length - 1 
              ? <th className="row-dimension">{DimensionNames[rd]}</th>
              : <th className="row-dimension">{`${DimensionNames[rd]}/${DimensionNames[cd]}`}</th>
              )
            }
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

  const tableId = `t_${id}`;
  console.log('Render Pivot table', data);
  const { rows: rowData, columns: columnData, rowDimensions, columnDimensions } = data;
  // Rows and columns data structures differ
  const rows = traverseRows(rowData, rowDimensions.length);
  const columns = applyLeafDescendantCount(
    translateColumns(columnData),
    columnDimensions.length,
  );

  console.log('Traversed', rows);
  console.log('Translated columns', columns);
  // console.log('Rendered by row', renderByRow(rows.children, rowDimensions.length - 1, []))
  // Object.

  let nextKey = 0;
  const renderers = getRenderers({
    formatValue,
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
      </table>
    </div>
  );
};

PivotTable.propTypes = {
  data: PropTypes.object.isRequired,
  formatValue: PropTypes.func,
};

PivotTable.defaultProps = {
  formatValue: v => Math.round(v),
};

export default PivotTable;