import { CardMatchGame } from './card-match';
import { DigitSpanGame } from './digit-span';
import { LightSequenceGame } from './light-sequence';
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
];

export function findGame(id: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.id === id);
}

export function isGamePlayable(id: string): boolean {
  return findGame(id) !== undefined;
}
