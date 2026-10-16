import { AnagramGame } from './anagram';
import { BalanceGame } from './balance';
import { CardMatchGame } from './card-match';
import { ConnectGame } from './connect';
import { DigitSpanGame } from './digit-span';
import { GoNoGoGame } from './go-no-go';
import { GridRecallGame } from './grid-recall';
import { LightSequenceGame } from './light-sequence';
import { LiquidSortGame } from './liquid-sort';
import { LogicChainGame } from './logic-chain';
import { MatrixPuzzleGame } from './matrix-puzzle';
import { MazeGame } from './maze';
import { MentalRotationGame } from './mental-rotation';
import { NBackGame } from './n-back';
import { NumberSeriesGame } from './number-series';
import { OddOneOutGame } from './odd-one-out';
import { OneLineGame } from './one-line';
import { PaperFoldGame } from './paper-fold';
import { QuickDecisionGame } from './quick-decision';
import { QuickMathGame } from './quick-math';
import { ReactionGame } from './reaction';
import { ShadowMatchGame } from './shadow-match';
import { StroopGame } from './stroop';
import { SymbolHuntGame } from './symbol-hunt';
import { TargetNumberGame } from './target-number';
import { TilingGame } from './tiling';
import { TrackingGame } from './tracking';
import { WordAnalogyGame } from './word-analogy';
import { WordLinkGame } from './word-link';
import type { GameProps } from './types';
import type { ComponentType } from 'react';

import { GAME_CATALOGUE, findGameContent, type ContentGame } from '@neuropeak/content';

/**
 * Kimlikten oynanabilir bileşene. Oyunun metinleri ve XP değeri
 * içerik paketindeki katalogda; burada yalnızca hangi kimliğin hangi
 * ekranı açtığı yazıyor. Katalogda olup burada olmayan oyun listede
 * "yakında" görünür.
 */
const COMPONENTS: Readonly<Record<string, ComponentType<GameProps>>> = {
  'card-match': CardMatchGame,
  'light-sequence': LightSequenceGame,
  'digit-span': DigitSpanGame,
  stroop: StroopGame,
  'odd-one-out': OddOneOutGame,
  'symbol-hunt': SymbolHuntGame,
  'go-no-go': GoNoGoGame,
  matrix: MatrixPuzzleGame,
  'liquid-sort': LiquidSortGame,
  'logic-chain': LogicChainGame,
  'quick-math': QuickMathGame,
  'number-series': NumberSeriesGame,
  'target-number': TargetNumberGame,
  rotation: MentalRotationGame,
  'paper-fold': PaperFoldGame,
  'shadow-match': ShadowMatchGame,
  anagram: AnagramGame,
  'word-analogy': WordAnalogyGame,
  'word-link': WordLinkGame,
  'one-line': OneLineGame,
  connect: ConnectGame,
  maze: MazeGame,
  reaction: ReactionGame,
  'quick-decision': QuickDecisionGame,
  'n-back': NBackGame,
  'grid-recall': GridRecallGame,
  tracking: TrackingGame,
  balance: BalanceGame,
  tiling: TilingGame,
};

export type GameDefinition = ContentGame & {
  readonly Component: ComponentType<GameProps>;
};

/** Oynanabilir oyunlar: katalogda tanımlı ve ekranı yazılmış olanlar. */
export const GAME_DEFINITIONS: readonly GameDefinition[] = GAME_CATALOGUE.flatMap((game) => {
  const Component = COMPONENTS[game.id];
  return Component === undefined ? [] : [{ ...game, Component }];
});

export function findGame(id: string): GameDefinition | undefined {
  const game = findGameContent(id);
  const Component = game === undefined ? undefined : COMPONENTS[game.id];
  return game === undefined || Component === undefined ? undefined : { ...game, Component };
}

export function isGamePlayable(id: string): boolean {
  return findGame(id) !== undefined;
}
