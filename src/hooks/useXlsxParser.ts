import { useRef, useCallback } from "react";

interface ParsedSheet {
  name: string;
  rows: (string | number | null)[][];
}

export function useXlsxParser() {
  const workerRef = useRef<Worker | null>(null);

  const parse = useCallback(
    (
      file: File,
      onProgress: (status: string) => void,
      onComplete: (sheets: ParsedSheet[]) => void,
      onError: (error: string) => void,
    ): (() => void) => {
      // Lazy-load worker (apenas cria uma instância)
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL("../workers/xlsxParser.worker.ts", import.meta.url),
          { type: "module" },
        );
      }

      const worker = workerRef.current;

      // Listeners
      const handleMessage = (event: MessageEvent) => {
        const { type, data, status, error } = event.data;

        if (type === "progress") {
          onProgress(status);
        } else if (type === "complete") {
          onComplete(data);
        } else if (type === "error") {
          onError(error);
        }
      };

      const handleError = (err: ErrorEvent) => {
        onError(`Erro no worker: ${err.message}`);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);

      // Parse
      file.arrayBuffer().then((buf) => {
        worker.postMessage({ type: "parse", arrayBuffer: buf });
      });

      // Cleanup function
      return () => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
      };
    },
    [],
  );

  const dispose = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return { parse, dispose };
}
