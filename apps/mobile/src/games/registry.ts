import { CardMatchGame } from './card-match';
import { DigitSpanGame } from './digit-span';
import { GoNoGoGame } from './go-no-go';
import { LightSequenceGame } from './light-sequence';
import { OddOneOutGame } from './odd-one-out';
import { StroopGame } from './stroop';
import { SymbolHuntGame } from './symbol-hunt';
import type { GameDefinition } from './types';

/**
 * Oynanabilir oyunlar. Oyunlar sekmesindeki liste bu kayıttan beslenir;
 * henüz yazılmamış oyunlar listede "yakında" olarak görünür.
 */
export const GAME_DEFINITIONS: readonly GameDefinition[] = [
  {
    id: 'card-match',
    category: 'memory',
    mode: 'levels',
    title: 'Kart Eşleme',
    instruction: 'Aynı simgeye sahip iki kartı bul',
    description:
      'Kartları çevirip eşlerini bul. Her seviyede kart sayısı artar; az hamleyle bitirmek bonus getirir.',
    skills: ['Görsel hafıza', 'Konum hatırlama', 'Dikkat'],
    baseXp: 14,
    Component: CardMatchGame,
  },
  {
    id: 'light-sequence',
    category: 'memory',
    mode: 'timed',
    title: 'Işık Dizisi',
    instruction: 'Diziyi izle, sonra aynı sırayla tekrarla',
    description: 'Her turda diziye bir ışık eklenir. Diziyi hatırlayabildiğin sürece oyun sürer.',
    skills: ['Kısa süreli hafıza', 'Sıra hatırlama', 'Odaklanma'],
    baseXp: 16,
    Component: LightSequenceGame,
  },
  {
    id: 'digit-span',
    category: 'memory',
    mode: 'timed',
    title: 'Sayı Menzili',
    instruction: 'Rakamları aklında tut, sonra sırayla gir',
    description:
      'Doğru bildikçe sayı uzar, yanıldıkça kısalır. İki hakkın var; en uzun diziye ulaşmaya çalış.',
    skills: ['Çalışma belleği', 'Sayısal hafıza', 'Konsantrasyon'],
    baseXp: 16,
    Component: DigitSpanGame,
  },
  {
    id: 'stroop',
    category: 'attention',
    mode: 'timed',
    title: 'Renk Tuzağı',
    instruction: 'Yazının rengini seç, kelimeyi değil',
    description:
      'Kelime bir renk adı, ama hangi renkte yazıldığı başka. Beynin okumayı bastırıp rengi görmesi gerekiyor.',
    skills: ['Dürtü kontrolü', 'Seçici dikkat', 'Zihinsel esneklik'],
    baseXp: 15,
    Component: StroopGame,
  },
  {
    id: 'odd-one-out',
    category: 'attention',
    mode: 'timed',
    title: 'Farklı Olanı Bul',
    instruction: 'Izgaradaki tek farklı tonu bul',
    description:
      'Her doğruda ızgara büyür ve renk farkı incelir. Gözün ne kadar ayrıntı yakaladığını ölçer.',
    skills: ['Görsel ayırt etme', 'Tarama hızı', 'Sürdürülebilir dikkat'],
    baseXp: 15,
    Component: OddOneOutGame,
  },
  {
    id: 'symbol-hunt',
    category: 'attention',
    mode: 'timed',
    title: 'Simge Avı',
    instruction: "Sayıları 1'den başlayarak sırayla bul",
    description:
      'Dağınık bir tabloda sayıları sırayla bul. Tablo bitince yenisi gelir; amaç sürede kaç tablo bitirdiğin.',
    skills: ['Görsel tarama', 'Dikkat dağılmasına direnç', 'İşlem hızı'],
    baseXp: 15,
    Component: SymbolHuntGame,
  },
  {
    id: 'go-no-go',
    category: 'attention',
    mode: 'timed',
    title: 'Dur / Geç',
    instruction: 'Yeşil daireye dokun, kırmızı kareye dokunma',
    description: 'Hızlı tepki vermek yarısı; asıl zor olan yanlış uyaranda elini tutabilmek.',
    skills: ['Dürtü kontrolü', 'Tepki hızı', 'Hata izleme'],
    baseXp: 15,
    Component: GoNoGoGame,
  },
];

export function findGame(id: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.id === id);
}

export function isGamePlayable(id: string): boolean {
  return findGame(id) !== undefined;
}
