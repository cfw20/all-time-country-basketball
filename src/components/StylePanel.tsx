import type { SideStyle } from "../engine/style";

export function StylePanel({ style, kicker }: { style: SideStyle; kicker: string }) {
  return (
    <article className="panel style-panel">
      <span className="tag">{kicker}</span>
      <h3>{style.name}</h3>
      <p>{style.line}</p>
      <div className="style-facets">
        {style.facets.map((facet) => (
          <div key={facet.label}>
            <span className="tag">{facet.label}</span>
            <strong>{facet.value}</strong>
            <p>{facet.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
