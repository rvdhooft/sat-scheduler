/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_LOGROCKET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
