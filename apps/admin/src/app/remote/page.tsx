import { DEFAULT_REMOTE_CONFIG, REMOTE_KEYS } from '@neuropeak/core';

import { RemoteConfigForm } from '@/components/remote-config-form';
import { Shell } from '@/components/shell';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function RemotePage() {
  return (
    <Shell
      title="Uzaktan kontrol"
      description="Paywall, reklam, özellik anahtarları ve zorunlu sürüm. Uygulama bu değerleri açılışta okur."
    >
      <RemoteConfigForm
        definitions={REMOTE_KEYS}
        values={DEFAULT_REMOTE_CONFIG}
        canSave={isSupabaseConfigured}
      />
    </Shell>
  );
}
