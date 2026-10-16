/**
 * Push bildirimi metni ve doğrulaması.
 *
 * Bildirim metni panelden yazılıyor ve gönderildikten sonra geri
 * alınamıyor; bu yüzden doğrulama gönderme anında değil yazarken
 * çalışıyor. Sınırlar iOS ve Android'in kilit ekranında kırpma
 * davranışına göre: başlık kısa kalmazsa ortadan kesiliyor.
 */

export const PUSH_TITLE_MAX = 48;
export const PUSH_BODY_MAX = 140;

export type PushMessage = {
  readonly title: string;
  readonly body: string;
};

export type PushCampaign = {
  readonly id: string;
  readonly segmentId: string;
  readonly tr: PushMessage;
  readonly en: PushMessage;
  /** Gönderim saati, kullanıcının yerel saatiyle (0–23); boşsa hemen. */
  readonly localHour?: number;
};

export type PushIssue = {
  readonly field: 'title' | 'body';
  readonly locale: 'tr' | 'en';
  readonly message: string;
};

function checkMessage(message: PushMessage, locale: 'tr' | 'en'): PushIssue[] {
  const issues: PushIssue[] = [];
  const title = message.title.trim();
  const body = message.body.trim();

  if (title.length === 0) {
    issues.push({ field: 'title', locale, message: 'Başlık boş olamaz' });
  } else if (title.length > PUSH_TITLE_MAX) {
    issues.push({
      field: 'title',
      locale,
      message: `Başlık ${PUSH_TITLE_MAX} karakteri geçemez`,
    });
  }

  if (body.length === 0) {
    issues.push({ field: 'body', locale, message: 'Metin boş olamaz' });
  } else if (body.length > PUSH_BODY_MAX) {
    issues.push({ field: 'body', locale, message: `Metin ${PUSH_BODY_MAX} karakteri geçemez` });
  }

  return issues;
}

/**
 * Kampanyanın gönderilmeye hazır olup olmadığı. İki dil de zorunlu:
 * eksik çeviriyle gönderilen bildirim, o dildeki kullanıcıya boş ya da
 * yabancı dilde düşüyor.
 */
export function validateCampaign(campaign: PushCampaign): PushIssue[] {
  const issues = [...checkMessage(campaign.tr, 'tr'), ...checkMessage(campaign.en, 'en')];

  if (
    campaign.localHour !== undefined &&
    (!Number.isInteger(campaign.localHour) || campaign.localHour < 0 || campaign.localHour > 23)
  ) {
    issues.push({ field: 'body', locale: 'tr', message: 'Gönderim saati 0–23 arasında olmalı' });
  }

  return issues;
}

export function isCampaignReady(campaign: PushCampaign): boolean {
  return validateCampaign(campaign).length === 0;
}

/** Kilit ekranında görüneceği gibi kısaltır. */
export function previewText(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}
