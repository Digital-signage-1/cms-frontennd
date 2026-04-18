'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { CreateAppTemplatePicker } from '@/components/apps/CreateAppTemplatePicker'
import { CreateAppConfigureModal } from '@/components/apps/CreateAppConfigureModal'
import type { AppType } from '@/components/apps/create-app-shared'

const STEPS = ['Select Type', 'Configure', 'Deploy'] as const

export default function CreateAppPage() {
  const router = useRouter()
  const { setBreadcrumbItems, clearBreadcrumbs } = useBreadcrumb()
  const [configureType, setConfigureType] = useState<AppType | null>(null)

  const step = configureType ? 1 : 0

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Apps', href: '/apps' }, { label: 'Create New App' }])
    return () => clearBreadcrumbs()
  }, [setBreadcrumbItems, clearBreadcrumbs])

  return (
    <div style={{ backgroundColor: '#f0f9ff', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #bae6fd', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button
          onClick={() => router.push('/apps')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0369a1', fontSize: 13, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Apps
        </button>

        <h1 style={{ color: '#0c4a6e', fontWeight: 600, fontSize: 15, flex: 1, margin: 0 }}>Create New App</h1>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((label, i) => {
            const isActive = step === i
            const isDone = step > i
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 8, backgroundColor: isActive ? 'rgba(14,165,233,0.08)' : 'transparent' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: isActive || isDone ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)' : '#e0f2fe', color: isActive || isDone ? '#FFFFFF' : '#6b7280', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#0ea5e9' : isDone ? '#0369a1' : '#6b7280' }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4" style={{ color: '#bae6fd', margin: '0 2px' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <CreateAppTemplatePicker
          highlightTypeId={configureType?.type_id ?? null}
          onChooseType={(tpl) => setConfigureType(tpl)}
        />
      </div>

      <CreateAppConfigureModal
        appType={configureType}
        onClose={() => setConfigureType(null)}
      />
    </div>
  )
}
