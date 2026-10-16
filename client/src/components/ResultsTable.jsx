import { ResultRow } from './ResultRow.jsx';

export function ResultsTable({ results }) {
  return (
    <div className="table-wrap">
      <table className="results">
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Cost</th>
            <th scope="col">Time</th>
            <th scope="col">Output quality</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <ResultRow key={result.model} result={result} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
