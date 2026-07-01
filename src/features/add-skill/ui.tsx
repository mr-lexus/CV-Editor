import { useEffect, useState, type DragEvent } from 'react'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DEFAULT_SKILL_GROUP_ID } from '@/entities/cv/model/defaults'
import type { SkillGroup } from '@/entities/cv/model/types'
import { selectActiveCV } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/shared/i18n'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { GripVertical, Plus, Trash2, X } from 'lucide-react'

type GroupDropIndicator = {
  groupId: string
  position: 'before' | 'after'
} | null

interface SortableSkillGroupCardProps {
  group: SkillGroup
  indicatorPosition?: 'before' | 'after'
  t: (key: string, variables?: Record<string, string | number>) => string
  onUpdateGroupName: (groupId: string, name: string) => void
  onRemoveGroup: (groupId: string) => void
  onDropSkill: (event: DragEvent<HTMLElement>, groupId: string, targetIndex: number) => void
  onStartSkillDrag: (event: DragEvent<HTMLDivElement>, skillId: string) => void
  onEndSkillDrag: () => void
  onRemoveSkill: (skillId: string) => void
}

const SortableSkillGroupCard = ({
  group,
  indicatorPosition,
  t,
  onUpdateGroupName,
  onRemoveGroup,
  onDropSkill,
  onStartSkillDrag,
  onEndSkillDrag,
  onRemoveSkill,
}: SortableSkillGroupCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id })

  return (
    <div ref={setNodeRef} className="relative" style={{ transform: CSS.Transform.toString(transform), transition }}>
      {indicatorPosition === 'before' && (
        <div className="pointer-events-none absolute -top-1 left-2 right-2 z-10 h-1 rounded-full bg-blue-500 shadow-sm" />
      )}
      {indicatorPosition === 'after' && (
        <div className="pointer-events-none absolute -bottom-1 left-2 right-2 z-10 h-1 rounded-full bg-blue-500 shadow-sm" />
      )}

      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-gray-50 p-2',
          isDragging && 'z-20 border-blue-300 bg-blue-50/60 shadow-lg opacity-90',
        )}
      >
        <div className="mb-2 flex flex-col gap-1.5 md:flex-row md:items-center">
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          {!group.isDefault && (
            <Input
              value={group.name}
              onChange={(e) => onUpdateGroupName(group.id, e.target.value)}
              placeholder={t('skills.groupPlaceholder')}
              className="h-8 px-2.5 py-1.5 text-xs md:max-w-xs"
            />
          )}
          {!group.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveGroup(group.id)}
              className="h-8 justify-start px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t('skills.deleteGroup')}
            </Button>
          )}
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => onDropSkill(event, group.id, group.skills.length)}
          className="flex min-h-[2.75rem] flex-wrap gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white p-2"
        >
          {group.skills.map((skill, index) => (
            <div
              key={skill.id}
              draggable
              onDragStart={(event) => onStartSkillDrag(event, skill.id)}
              onDragOver={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onDrop={(event) => {
                event.stopPropagation()
                onDropSkill(event, group.id, index)
              }}
              onDragEnd={onEndSkillDrag}
              className="inline-flex cursor-grab items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 active:cursor-grabbing"
            >
              <GripVertical className="mr-1 h-3 w-3 text-blue-400" />
              <span>{skill.name}</span>
              <button
                onClick={() => onRemoveSkill(skill.id)}
                className="ml-1.5 text-blue-400 hover:text-blue-600 focus:outline-none"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const AddSkill = () => {
  const { t } = useI18n()
  const skillGroups = useCVStore((state) => selectActiveCV(state).skillGroups)
  const addSkillGroup = useCVStore((state) => state.addSkillGroup)
  const updateSkillGroup = useCVStore((state) => state.updateSkillGroup)
  const removeSkillGroup = useCVStore((state) => state.removeSkillGroup)
  const moveSkillGroup = useCVStore((state) => state.moveSkillGroup)
  const addSkill = useCVStore((state) => state.addSkill)
  const removeSkill = useCVStore((state) => state.removeSkill)
  const moveSkill = useCVStore((state) => state.moveSkill)
  const [skillName, setSkillName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState(DEFAULT_SKILL_GROUP_ID)
  const [draggedSkillId, setDraggedSkillId] = useState<string | null>(null)
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null)
  const [groupDropIndicator, setGroupDropIndicator] = useState<GroupDropIndicator>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  useEffect(() => {
    if (skillGroups.some((group) => group.id === selectedGroupId)) {
      return
    }

    setSelectedGroupId(skillGroups[0]?.id ?? DEFAULT_SKILL_GROUP_ID)
  }, [selectedGroupId, skillGroups])

  const handleAdd = () => {
    const name = skillName.trim()

    if (name) {
      addSkill({ id: crypto.randomUUID(), name }, selectedGroupId)
      setSkillName('')
    }
  }

  const handleAddGroup = () => {
    const name = groupName.trim()

    if (!name) {
      return
    }

    addSkillGroup(name)
    setGroupName('')
  }

  const readDraggedSkillId = (event: DragEvent<HTMLElement>) => {
    return draggedSkillId ?? event.dataTransfer.getData('text/plain')
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, skillId: string) => {
    setDraggedSkillId(skillId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', skillId)
  }

  const handleDropToGroup = (event: DragEvent<HTMLElement>, groupId: string, targetIndex: number) => {
    event.preventDefault()

    const skillId = readDraggedSkillId(event)

    if (!skillId) {
      return
    }

    moveSkill(skillId, groupId, targetIndex)
    setDraggedSkillId(null)
  }

  const handleGroupDragStart = (event: DragStartEvent) => {
    const groupId = String(event.active.id)

    if (!skillGroups.some((group) => group.id === groupId)) {
      return
    }

    setDraggedGroupId(groupId)
  }

  const handleGroupDragOver = (event: DragOverEvent) => {
    if (!draggedGroupId || !event.over) {
      setGroupDropIndicator(null)
      return
    }

    const overGroupId = String(event.over.id)

    if (!skillGroups.some((group) => group.id === overGroupId) || overGroupId === draggedGroupId) {
      setGroupDropIndicator(null)
      return
    }

    const translatedRect = event.active.rect.current.translated ?? event.active.rect.current.initial
    const activeCenterY = translatedRect.top + translatedRect.height / 2
    const overCenterY = event.over.rect.top + event.over.rect.height / 2

    setGroupDropIndicator({
      groupId: overGroupId,
      position: activeCenterY > overCenterY ? 'after' : 'before',
    })
  }

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const activeGroupId = String(event.active.id)
    const overGroupId = event.over ? String(event.over.id) : null

    setDraggedGroupId(null)
    setGroupDropIndicator(null)

    if (!overGroupId || activeGroupId === overGroupId) {
      return
    }

    const activeIndex = skillGroups.findIndex((group) => group.id === activeGroupId)
    const overIndex = skillGroups.findIndex((group) => group.id === overGroupId)

    if (activeIndex === -1 || overIndex === -1) {
      return
    }

    moveSkillGroup(activeGroupId, overIndex)
  }

  const handleGroupDragCancel = () => {
    setDraggedGroupId(null)
    setGroupDropIndicator(null)
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{t('skills.title')}</h2>
      <p className="text-xs text-gray-500">{t('skills.dragHint')}</p>

      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-[minmax(0,1fr)_200px_auto]">
        <Input
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={t('skills.placeholder')}
          className="h-8 px-2.5 py-1.5 text-xs"
        />
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {skillGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.isDefault ? t('skills.defaultGroup') : group.name || t('skills.groupPlaceholder')}
            </option>
          ))}
        </select>
        <Button onClick={handleAdd} size="sm" className="h-8 px-3 text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {t('common.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-1.5 md:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          placeholder={t('skills.createGroupPlaceholder')}
          className="h-8 px-2.5 py-1.5 text-xs"
        />
        <Button variant="outline" onClick={handleAddGroup} size="sm" className="h-8 px-3 text-xs">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {t('skills.addGroup')}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleGroupDragStart}
        onDragOver={handleGroupDragOver}
        onDragEnd={handleGroupDragEnd}
        onDragCancel={handleGroupDragCancel}
      >
        <SortableContext items={skillGroups.map((group) => group.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {skillGroups.map((group) => (
              <SortableSkillGroupCard
                key={group.id}
                group={group}
                indicatorPosition={groupDropIndicator?.groupId === group.id ? groupDropIndicator.position : undefined}
                t={t}
                onUpdateGroupName={updateSkillGroup}
                onRemoveGroup={removeSkillGroup}
                onDropSkill={handleDropToGroup}
                onStartSkillDrag={handleDragStart}
                onEndSkillDrag={() => setDraggedSkillId(null)}
                onRemoveSkill={removeSkill}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
