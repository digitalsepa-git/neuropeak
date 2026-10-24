import { DEFAULT_SEGMENTS } from '@neuropeak/content';

import { PushComposer } from '@/components/push-composer';
import { Shell } from '@/components/shell';
import { canEditContent } from '@/lib/content-mode';

export default function PushPage() {
  return (
    <Shell
      title="Push kampanyası"
      description="Kitleyi seç, iki dilde metni yaz, kilit ekranında nasıl göründüğünü gör."
    >
      <div className="mb-lg rounded-lg border border-border bg-surface-sunken p-md">
        <p className="text-bodysmall font-semibold">Gönderim henüz yok</p>
        <p className="mt-1 text-bodysmall text-fg-muted">
          Kampanya taslak olarak kaydediliyor. Taslakları alıp Expo&apos;ya yollayacak servis
          kurulmadı; o kurulana kadar hiçbir bildirim gitmiyor.
        </p>
      </div>

      <PushComposer segments={DEFAULT_SEGMENTS} canSend={canEditContent} />
    </Shell>
  );
}
