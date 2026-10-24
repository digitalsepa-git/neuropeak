import { describe, expect, it } from 'vitest';

import { parseBadge, parseDailyTask } from './content-edit';

/**
 * Doğrulama saf olduğu için testlenebilen tek yazma parçası bu.
 * Veritabanına yazmanın kendisi çalışan bir Supabase istiyor.
 */

const TASK = {
  id: 'play-2-games',
  title_tr: '2 oyun oyna',
  title_en: 'Play 2 games',
  target: '2',
  star_reward: '15',
  category: '',
};

describe('parseDailyTask', () => {
  it('geçerli formu okur', () => {
    const parsed = parseDailyTask(TASK);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value).toEqual({
      id: 'play-2-games',
      title_tr: '2 oyun oyna',
      title_en: 'Play 2 games',
      target: 2,
      star_reward: 15,
      category: null,
    });
  });

  it('boş başlığı reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, title_tr: '   ' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('Türkçe başlık');
  });

  it('hedefi sıfır ya da altına indirmiyor', () => {
    // Veritabanı kısıtı da bunu tutuyor (`target > 0`); buradaki
    // kontrol hatayı kullanıcıya anlatmak için.
    const parsed = parseDailyTask({ ...TASK, target: '0' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('en az 1');
  });

  it('ondalık hedefi reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, target: '2.5' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('tam sayı');
  });

  it('negatif yıldızı reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, star_reward: '-1' });
    expect(parsed.ok).toBe(false);
  });

  it('metin yazılmış sayıyı reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, star_reward: 'çok' });
    expect(parsed.ok).toBe(false);
  });

  it('tanınmayan kategoriyi reddeder', () => {
    const parsed = parseDailyTask({ ...TASK, category: 'uydurma' });
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.message).toContain('Kategori');
  });

  it('geçerli kategoriyi taşır', () => {
    const parsed = parseDailyTask({ ...TASK, category: 'memory' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.category).toBe('memory');
  });

  it('başlıkların başındaki ve sonundaki boşluğu atar', () => {
    const parsed = parseDailyTask({ ...TASK, title_tr: '  2 oyun oyna  ' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.title_tr).toBe('2 oyun oyna');
  });
});

const BADGE = {
  id: 'level-5',
  title_tr: 'İlk Adımlar',
  title_en: 'First Steps',
  description_tr: '5. seviyeye ulaş',
  description_en: 'Reach level 5',
  star_reward: '15',
};

describe('parseBadge', () => {
  it('geçerli formu okur', () => {
    const parsed = parseBadge(BADGE);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.star_reward).toBe(15);
    expect(parsed.value.is_secret).toBe(false);
  });

  it('işaretli onay kutusunu gizli olarak okur', () => {
    const parsed = parseBadge({ ...BADGE, is_secret: 'on' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.is_secret).toBe(true);
  });

  it('koşulu hiç okumuyor', () => {
    // Form koşulu göndermiyor; gönderse bile buradan geçmemeli.
    const parsed = parseBadge({ ...BADGE, requirement: '{"kind":"level","value":99}' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect('requirement' in parsed.value).toBe(false);
  });

  it('boş adı reddeder', () => {
    expect(parseBadge({ ...BADGE, title_en: '' }).ok).toBe(false);
  });

  it('açıklama boş kalabilir', () => {
    const parsed = parseBadge({ ...BADGE, description_tr: '', description_en: '' });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.description_tr).toBe('');
  });
});
