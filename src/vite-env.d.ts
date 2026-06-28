/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_PDF_API_URL?: string
  readonly VITE_PDF_BACKEND_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
