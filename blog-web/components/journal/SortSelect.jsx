'use client';

export const SORTS = { latest: 'Latest', popular: 'Most read', quick: 'Quickest read' };

// Submits the surrounding search form, so sorting works through the same GET URL as search.
export default function SortSelect({ defaultValue = 'latest' }) {
  return (
    <select
      className="j-input"
      name="sort"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {Object.entries(SORTS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}
