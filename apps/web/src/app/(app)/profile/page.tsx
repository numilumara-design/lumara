'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileData {
  birthDate: string | null
  birthTime: string | null
  birthPlace: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState<ProfileData>({ birthDate: '', birthTime: '', birthPlace: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
            birthTime: data.birthTime ?? '',
            birthPlace: data.birthPlace ?? '',
          })
        }
        setLoading(false)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-2xl">
        <div className="text-white/40 text-sm">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Мій профіль</h1>
        <p className="text-white/50">Астрологічні дані для точнішого аналізу</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {/* Дата народження */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Дата народження
          </label>
          <input
            type="date"
            value={form.birthDate ?? ''}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-lumara-400/50 transition-colors [color-scheme:dark]"
          />
        </div>

        {/* Час народження */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Час народження
          </label>
          <input
            type="time"
            value={form.birthTime ?? ''}
            onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-lumara-400/50 transition-colors [color-scheme:dark]"
          />
          <p className="text-white/30 text-xs mt-1">Необов'язково, але підвищує точність</p>
        </div>

        {/* Місце народження */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Місце народження
          </label>
          <input
            type="text"
            value={form.birthPlace ?? ''}
            onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
            placeholder="Наприклад: Київ, Україна"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-lumara-400/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-lumara-500/30 hover:bg-lumara-500/40 border border-lumara-400/30 text-lumara-300 font-medium py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-60"
          >
            {saving ? 'Зберігаємо...' : 'Зберегти'}
          </button>
          {saved && (
            <span className="text-green-400 text-sm">✓ Збережено</span>
          )}
        </div>
      </form>

      <button
        onClick={() => router.back()}
        className="mt-6 text-white/40 hover:text-white/60 text-sm transition-colors"
      >
        ← Назад
      </button>
    </div>
  )
}
