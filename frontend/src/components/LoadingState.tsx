export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return <p className="loading">{label}</p>;
}
