import { useState, useCallback } from "react";

interface SearchFilterProps {
  onFilterChange: (query: string) => void;
  isDisabled?: boolean;
}

export function SearchFilter({ onFilterChange, isDisabled = false }: SearchFilterProps) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      onFilterChange(value.toLowerCase());
    },
    [onFilterChange],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onFilterChange("");
  }, [onFilterChange]);

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <input
        type="text"
        placeholder="🔍 Buscar em todas as colunas..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isDisabled}
        style={{
          padding: "6px 10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          fontSize: "14px",
          width: "200px",
          minWidth: "150px",
        }}
      />
      {query && (
        <button
          onClick={handleClear}
          disabled={isDisabled}
          title="Limpar filtro"
          style={{
            padding: "4px 8px",
            fontSize: "12px",
            minWidth: "auto",
            background: "#f5f5f5",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
