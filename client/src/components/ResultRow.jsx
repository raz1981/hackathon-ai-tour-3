import { useState } from 'react';
import { StarRating } from './StarRating.jsx';
import { formatCost, formatTime, scoreToStars } from '../format.js';

export function ResultRow({ result }) {
  const [open, setOpen] = useState(false);
  const failed = Boolean(result.error);

  return (
    <>
      <tr>
        <td>
          {failed ? (
            <>
              <span className="model-name">{result.name}</span>
              <p className="row-error">{result.error}</p>
            </>
          ) : (
            <button
              type="button"
              className="expand"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true">{open ? '▾' : '▸'}</span> {result.name}
            </button>
          )}
        </td>
        <td>{formatCost(result.costUsd)}</td>
        <td>{formatTime(result.latencyMs)}</td>
        <td>{failed ? '—' : <StarRating value={scoreToStars(result.quality?.score)} />}</td>
      </tr>
      {open && (
        <tr className="details">
          <td colSpan={4}>
            <dl className="token-stats">
              <div>
                <dt>Input tokens</dt>
                <dd>{result.inputTokens}</dd>
              </div>
              <div>
                <dt>Output tokens</dt>
                <dd>{result.outputTokens}</dd>
              </div>
              <div>
                <dt>Total tokens</dt>
                <dd>{result.totalTokens}</dd>
              </div>
              <div>
                <dt>Tokens per second</dt>
                <dd>{result.tokensPerSecond ?? '—'}</dd>
              </div>
            </dl>
            {result.quality?.rationale && <p className="rationale">Judge: {result.quality.rationale}</p>}
            <pre className="output">{result.output}</pre>
          </td>
        </tr>
      )}
    </>
  );
}
