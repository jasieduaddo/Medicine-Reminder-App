import { useLocaleStore } from '@/stores/localeStore'
import { translations } from '@/lib/translations'

export function useT() {
  const locale = useLocaleStore((s) => s.locale)
  return translations[locale]
}
