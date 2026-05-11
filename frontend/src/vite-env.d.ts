/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_USERS_URL: string;
  readonly VITE_API_BOOKS_URL: string;
  readonly VITE_API_LOANS_URL: string;
  readonly VITE_API_RECO_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
