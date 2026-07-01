import type { CVState } from './store'

export function selectActiveVersion(state: CVState) {
  return state.workspace.versions.find((version) => version.id === state.workspace.activeVersionId) ?? state.workspace.versions[0]
}

export function selectActiveCV(state: CVState) {
  return selectActiveVersion(state)?.cv
}

export function selectActiveLocale(state: CVState) {
  return selectActiveVersion(state)?.locale ?? 'en'
}
