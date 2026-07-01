import { useEffect, useRef, useState } from 'react'
import { Download, Plus, Upload, X } from 'lucide-react'
import { selectActiveVersion } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { getLocaleLabel, getSupportedLocales, useI18n, type LocaleCode } from '@/shared/i18n'
import { Button } from '@/shared/ui/Button'

const EMPTY_SOURCE_ID = '__empty__'

export const ManageCVVersions = () => {
  const { t } = useI18n()
  const workspace = useCVStore((state) => state.workspace)
  const versions = useCVStore((state) => state.workspace.versions)
  const activeVersion = useCVStore(selectActiveVersion)
  const setActiveVersion = useCVStore((state) => state.setActiveVersion)
  const createLocalizedVersion = useCVStore((state) => state.createLocalizedVersion)
  const deleteVersion = useCVStore((state) => state.deleteVersion)
  const replaceWorkspace = useCVStore((state) => state.replaceWorkspace)
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState<LocaleCode>('ru')
  const [selectedSourceId, setSelectedSourceId] = useState<string>(activeVersion?.id ?? '')
  const importInputRef = useRef<HTMLInputElement>(null)

  const localeOptions = getSupportedLocales()
  const existingLocaleVersion = versions.find((version) => version.locale === selectedLocale)
  const createActionLabel = existingLocaleVersion ? t('workspace.openVersion') : t('workspace.createVersion')

  useEffect(() => {
    if (activeVersion?.id && selectedSourceId !== EMPTY_SOURCE_ID) {
      setSelectedSourceId(activeVersion.id)
    }
  }, [activeVersion?.id, selectedSourceId])

  const handleCreateVersion = () => {
    createLocalizedVersion(
      selectedLocale,
      selectedSourceId === EMPTY_SOURCE_ID ? null : selectedSourceId || activeVersion?.id || null,
    )
    setShowCreatePanel(false)
  }

  const handleDeleteVersion = (versionId: string) => {
    const version = versions.find((entry) => entry.id === versionId)

    if (!version || versions.length <= 1) {
      return
    }

    const confirmed = window.confirm(
      t('workspace.deleteConfirm', { language: getLocaleLabel(version.locale) }),
    )

    if (!confirmed) {
      return
    }

    deleteVersion(version.id)
  }

  const handleExportJson = () => {
    const exportPayload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      workspace,
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = objectUrl
    link.download = 'cv-workspace.json'
    link.click()

    URL.revokeObjectURL(objectUrl)
  }

  const handleImportClick = () => {
    importInputRef.current?.click()
  }

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const confirmed = window.confirm(t('workspace.importReplaceConfirm'))

      if (!confirmed) {
        return
      }

      const replaced = replaceWorkspace(parsed)

      if (!replaced) {
        window.alert(t('workspace.importInvalid'))
      }
    } catch {
      window.alert(t('workspace.importInvalid'))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2">
              {versions.map((version) => {
                const isActive = version.id === activeVersion?.id
                const isInitialVersion = version.id === versions[0]?.id
                const canDelete = versions.length > 1
                const metaLabel = version.sourceVersionId
                  ? t('workspace.createdFrom', {
                    language: getLocaleLabel(
                      versions.find((entry) => entry.id === version.sourceVersionId)?.locale ?? 'en',
                    ),
                  })
                  : isInitialVersion
                    ? t('workspace.originalBadge')
                    : t('workspace.createdFromScratch')

                return (
                  <div
                    key={version.id}
                    className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                    }`}
                    title={metaLabel}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveVersion(version.id)}
                      className="flex items-center gap-1.5 rounded-md text-left"
                    >
                      <span className="text-sm font-semibold text-gray-900">{getLocaleLabel(version.locale)}</span>
                      {isActive && (
                        <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-blue-700">
                          {t('common.current')}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteVersion(version.id)}
                      disabled={!canDelete}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                        canDelete
                          ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                          : 'cursor-not-allowed text-gray-300'
                      }`}
                      title={canDelete ? t('workspace.deleteVersion') : t('workspace.lastVersionLocked')}
                      aria-label={canDelete ? t('workspace.deleteVersion') : t('workspace.lastVersionLocked')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportJson}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleImportClick} className="whitespace-nowrap">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {t('workspace.importJson')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJson} className="whitespace-nowrap">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {t('workspace.exportJson')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreatePanel((value) => !value)}
            className="whitespace-nowrap"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {t('workspace.createAnotherLanguage')}
          </Button>
        </div>

        {showCreatePanel && (
          <div className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 lg:grid-cols-[minmax(180px,220px)_minmax(220px,1fr)_auto] lg:items-end">
            <label className="space-y-1">
              <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                {t('workspace.chooseLanguage')}
              </span>
              <select
                value={selectedLocale}
                onChange={(event) => setSelectedLocale(event.target.value as LocaleCode)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {localeOptions.map((locale) => (
                  <option key={locale} value={locale}>
                    {getLocaleLabel(locale)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                {t('workspace.chooseBase')}
              </span>
              <select
                value={selectedSourceId}
                onChange={(event) => setSelectedSourceId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={EMPTY_SOURCE_ID}>
                  {t('workspace.emptyBase')}
                </option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {getLocaleLabel(version.locale)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <Button onClick={handleCreateVersion} className="whitespace-nowrap">
                {createActionLabel}
              </Button>
              <Button variant="outline" onClick={() => setShowCreatePanel(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
