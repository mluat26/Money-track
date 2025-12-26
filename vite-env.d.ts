/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Manually declare process to fix TS2580 without installing @types/node
declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};