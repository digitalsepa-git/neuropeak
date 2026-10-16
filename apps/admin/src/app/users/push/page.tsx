import { DEFAULT_SEGMENTS } from '@neuropeak/content';

import { PushComposer } from '@/components/push-composer';
import { Shell } from '@/components/shell';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function PushPage() {
  return (
    <Shell
      title="Push kampanyası"
      description="Kitleyi seç, iki dilde metni yaz, kilit ekranında nasıl göründüğünü gör."
    >
      <PushComposer segments={DEFAULT_SEGMENTS} canSend={isSupabaseConfigured} />
    </Shell>
  );
}
