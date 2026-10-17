import type {
  BrainAxis,
  Difficulty,
  GameCategory,
  LeagueOutcome,
  LeagueTier,
  QuestionKind,
  ReportDimension,
  ScoreBand,
} from '@neuropeak/core';

import { useI18n } from './context';
import type { StringKey } from './strings';

/**
 * Çekirdekteki birlik tiplerinden metin anahtarına.
 *
 * Eşleme `Record` olarak yazılıyor: çekirdeğe yeni bir kategori ya da
 * lig kademesi eklendiğinde burası derlenmiyor ve çeviri unutulmuyor.
 */
const CATEGORY_KEYS: Record<GameCategory, StringKey> = {
  memory: 'category.memory',
  attention: 'category.attention',
  logic: 'category.logic',
  math: 'category.math',
  spatial: 'category.spatial',
  speed: 'category.speed',
  verbal: 'category.verbal',
};

const AXIS_KEYS: Record<BrainAxis, StringKey> = {
  memory: 'axis.memory',
  focus: 'axis.focus',
  logic: 'axis.logic',
  speed: 'axis.speed',
  problemSolving: 'axis.problemSolving',
};

const TIER_KEYS: Record<LeagueTier, StringKey> = {
  bronze: 'league.tier.bronze',
  silver: 'league.tier.silver',
  gold: 'league.tier.gold',
  platinum: 'league.tier.platinum',
  diamond: 'league.tier.diamond',
  legend: 'league.tier.legend',
};

const OUTCOME_KEYS: Record<LeagueOutcome, StringKey> = {
  promote: 'league.outcome.promote',
  hold: 'league.outcome.hold',
  relegate: 'league.outcome.relegate',
};

const BAND_KEYS: Record<ScoreBand, StringKey> = {
  developing: 'band.developing',
  average: 'band.average',
  aboveAverage: 'band.aboveAverage',
  superior: 'band.superior',
  exceptional: 'band.exceptional',
};

const DIMENSION_KEYS: Record<ReportDimension, StringKey> = {
  verbal: 'dimension.verbal',
  numeric: 'dimension.numeric',
  visual: 'dimension.visual',
  logical: 'dimension.logical',
};

const DIFFICULTY_KEYS: Record<Difficulty, StringKey> = {
  easy: 'game.difficulty.easy',
  medium: 'game.difficulty.medium',
  hard: 'game.difficulty.hard',
};

const DIFFICULTY_HINT_KEYS: Record<Difficulty, StringKey> = {
  easy: 'game.difficultyHint.easy',
  medium: 'game.difficultyHint.medium',
  hard: 'game.difficultyHint.hard',
};

const SKILL_KEYS: Record<QuestionKind, { title: StringKey; hint: StringKey }> = {
  number_series: { title: 'skill.number_series', hint: 'skill.number_seriesHint' },
  arithmetic: { title: 'skill.arithmetic', hint: 'skill.arithmeticHint' },
  verbal_analogy: { title: 'skill.verbal_analogy', hint: 'skill.verbal_analogyHint' },
  odd_one_out: { title: 'skill.odd_one_out', hint: 'skill.odd_one_outHint' },
  logic: { title: 'skill.logic', hint: 'skill.logicHint' },
  coding: { title: 'skill.coding', hint: 'skill.codingHint' },
  matrix: { title: 'skill.matrix', hint: 'skill.matrixHint' },
  shape_analogy: { title: 'skill.shape_analogy', hint: 'skill.shape_analogyHint' },
  spatial: { title: 'skill.spatial', hint: 'skill.spatialHint' },
};

export function useLabels() {
  const { t } = useI18n();

  return {
    category: (value: GameCategory) => t(CATEGORY_KEYS[value]),
    axis: (value: BrainAxis) => t(AXIS_KEYS[value]),
    tier: (value: LeagueTier) => t(TIER_KEYS[value]),
    outcome: (value: LeagueOutcome) => t(OUTCOME_KEYS[value]),
    band: (value: ScoreBand) => t(BAND_KEYS[value]),
    dimension: (value: ReportDimension) => t(DIMENSION_KEYS[value]),
    difficulty: (value: Difficulty) => t(DIFFICULTY_KEYS[value]),
    difficultyHint: (value: Difficulty) => t(DIFFICULTY_HINT_KEYS[value]),
    skill: (value: QuestionKind) => ({
      title: t(SKILL_KEYS[value].title),
      hint: t(SKILL_KEYS[value].hint),
    }),
  };
}
