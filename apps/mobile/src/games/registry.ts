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
import { OneLineGame } from './one-line';
import { PaperFoldGame } from './paper-fold';
import { QuickDecisionGame } from './quick-decision';
import { QuickMathGame } from './quick-math';
import { ReactionGame } from './reaction';
import { ShadowMatchGame } from './shadow-match';
import { TargetNumberGame } from './target-number';
import { TilingGame } from './tiling';
import { TrackingGame } from './tracking';
import { WordAnalogyGame } from './word-analogy';
import { WordLinkGame } from './word-link';
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
  {
    id: 'matrix',
    category: 'logic',
    mode: 'levels',
    title: 'Matris Bulmaca',
    instruction: 'Kuralı bul, eksik hücreyi tamamla',
    description:
      '3×3 ızgaradaki örüntüyü çöz ve boş hücreye hangi şeklin geleceğini bul. Her doğruda kural zorlaşır.',
    skills: ['Soyut akıl yürütme', 'Örüntü tanıma', 'Tümevarım'],
    baseXp: 18,
    Component: MatrixPuzzleGame,
  },
  {
    id: 'liquid-sort',
    category: 'logic',
    mode: 'levels',
    title: 'Sıvı Sıralama',
    instruction: 'Her şişede tek renk kalana kadar dök',
    description:
      'Renkleri şişeler arasında taşıyarak ayır. Her seviyede renk sayısı artar; tahtalar üretilirken çözülebilirlikleri doğrulanır.',
    skills: ['İleri planlama', 'Problem çözme', 'Sabır'],
    baseXp: 18,
    Component: LiquidSortGame,
  },
  {
    id: 'logic-chain',
    category: 'logic',
    mode: 'levels',
    title: 'Mantık Zinciri',
    instruction: 'Verilenlerden sıralamayı çıkar',
    description:
      'Karşılaştırmalardan tam sıralamayı kurup soruyu cevapla. Zincir her seviyede uzar.',
    skills: ['Tümdengelim', 'Çalışma belleği', 'Sıralama'],
    baseXp: 18,
    Component: LogicChainGame,
  },
  {
    id: 'quick-math',
    category: 'math',
    mode: 'timed',
    title: 'Hızlı İşlem',
    instruction: 'Doğru sonucu seç',
    description:
      'Sürede kaç işlem çözebildiğini ölçer. Doğru seri uzadıkça her işlem daha çok puan getirir.',
    skills: ['Zihinden işlem', 'İşlem hızı', 'Sayı duyusu'],
    baseXp: 15,
    Component: QuickMathGame,
  },
  {
    id: 'number-series',
    category: 'math',
    mode: 'levels',
    title: 'Sayı Dizisi',
    instruction: 'Diziyi sürdüren sayıyı bul',
    description: 'Diziyi üreten kuralı çöz ve devamını seç. Doğru cevaptan sonra kural gösterilir.',
    skills: ['Örüntü tanıma', 'Tümevarım', 'Sayısal akıl yürütme'],
    baseXp: 18,
    Component: NumberSeriesGame,
  },
  {
    id: 'target-number',
    category: 'math',
    mode: 'levels',
    title: 'Hedef Sayı',
    instruction: 'Dört sayı ve dört işlemle hedefe ulaş',
    description:
      'İki sayı seçip bir işlemle birleştir. Elde tek sayı kalıp hedefe eşit olunca seviye biter; her bulmacanın çözümü garanti.',
    skills: ['Esnek düşünme', 'Planlama', 'Aritmetik'],
    baseXp: 20,
    Component: TargetNumberGame,
  },
  {
    id: 'rotation',
    category: 'spatial',
    mode: 'timed',
    title: 'Şekil Döndürme',
    instruction: 'Aynı şekil mi, ayna görüntüsü mü?',
    description:
      'Soldaki şekil döndürülerek sağdakine oturuyor mu, yoksa aynası mı? Zihinde döndürme hızını ölçer.',
    skills: ['Zihinsel döndürme', 'Uzamsal görselleştirme', 'Karar hızı'],
    baseXp: 16,
    Component: MentalRotationGame,
  },
  {
    id: 'paper-fold',
    category: 'spatial',
    mode: 'levels',
    title: 'Katla-Aç',
    instruction: 'Kağıt açılınca delikler nerede olur?',
    description:
      'Katlanmış kağıttaki delikler açıldığında nereye düşer? Her seviyede katlama ve delik sayısı artar.',
    skills: ['Uzamsal muhakeme', 'Simetri', 'Zihinde canlandırma'],
    baseXp: 20,
    Component: PaperFoldGame,
  },
  {
    id: 'shadow-match',
    category: 'spatial',
    mode: 'timed',
    title: 'Gölge Eşleştir',
    instruction: 'Şeklin gölgesini bul',
    description: 'Üstteki şeklin silüetini dört gölgeden bul. Gölgeler döndürülmüş olabilir.',
    skills: ['Şekil tanıma', 'Görsel eşleştirme', 'Dikkat'],
    baseXp: 15,
    Component: ShadowMatchGame,
  },
  {
    id: 'anagram',
    category: 'verbal',
    mode: 'levels',
    title: 'Kelime Avı',
    instruction: 'İpucunu oku, harflerden kelimeyi kur',
    description:
      'Karışık harflerden ipucuna uyan kelimeyi kurarsın. Her üç seviyede bir kelimeler uzar.',
    skills: ['Kelime dağarcığı', 'Harf çözümleme', 'Esnek düşünme'],
    baseXp: 18,
    Component: AnagramGame,
  },
  {
    id: 'word-analogy',
    category: 'verbal',
    mode: 'levels',
    title: 'Sözel Analoji',
    instruction: 'İlişkiyi kur, eksik kelimeyi bul',
    description:
      'İlk iki kelime arasındaki ilişkinin aynısını kuran kelimeyi seçersin. Seviye yükseldikçe ilişkiler soyutlaşır.',
    skills: ['Sözel muhakeme', 'İlişki kurma', 'Soyutlama'],
    baseXp: 20,
    Component: WordAnalogyGame,
  },
  {
    id: 'word-link',
    category: 'verbal',
    mode: 'timed',
    title: 'Kelime Bağı',
    instruction: 'Eş mi, zıt mı? Doğru kelimeyi seç',
    description:
      'Verilen kelimenin eş ya da zıt anlamlısını 60 saniyede olabildiğince çok bul. Soruyu okumadan cevaplayamazsın.',
    skills: ['Kelime dağarcığı', 'Anlam ayırt etme', 'Okuma hızı'],
    baseXp: 15,
    Component: WordLinkGame,
  },
  {
    id: 'one-line',
    category: 'logic',
    mode: 'levels',
    title: 'Tek Çizgi',
    instruction: 'Kalemi kaldırmadan her kenarı bir kez çiz',
    description:
      'Noktalara sırayla dokunarak bütün kenarları tek seferde çizersin. Her tahta çözülebilir üretilir.',
    skills: ['Planlama', 'Uzamsal muhakeme', 'Deneme-yanılma'],
    baseXp: 22,
    Component: OneLineGame,
  },
  {
    id: 'connect',
    category: 'logic',
    mode: 'levels',
    title: 'Bağlantı',
    instruction: 'Aynı renkleri kesişmeden bağla',
    description:
      'Aynı renk iki noktayı, yollar birbirini kesmeden bağlarsın. Seviye yükseldikçe ızgara ve çift sayısı büyür.',
    skills: ['Planlama', 'Uzamsal muhakeme', 'Sabır'],
    baseXp: 24,
    Component: ConnectGame,
  },
  {
    id: 'maze',
    category: 'logic',
    mode: 'levels',
    title: 'Doğru Yolu Seç',
    instruction: 'Labirentten çıkışı bul',
    description: 'Yön tuşlarıyla labirentten çıkarsın. Kısa yoldan çıkmak daha çok puan getirir.',
    skills: ['Yön bulma', 'Planlama', 'Çalışma belleği'],
    baseXp: 20,
    Component: MazeGame,
  },
  {
    id: 'reaction',
    category: 'speed',
    mode: 'timed',
    title: 'Reaksiyon',
    instruction: 'Yeşili görünce hemen bas',
    description:
      'Ekran yeşile dönünce basarsın. Beş ölçümün ortalaması tepki süreni milisaniye hassasiyetiyle verir.',
    skills: ['Tepki süresi', 'Dikkat', 'Dürtü kontrolü'],
    baseXp: 12,
    Component: ReactionGame,
  },
  {
    id: 'quick-decision',
    category: 'speed',
    mode: 'timed',
    title: 'Hızlı Karar',
    instruction: 'İki paneli karşılaştır',
    description:
      'Hangi tarafta daha çok nokta var, ya da sayılar aynı mı? Soru dönüşümlü sorulur, kalıba bağlanamazsın.',
    skills: ['Karar hızı', 'Sayı sezgisi', 'Dikkat'],
    baseXp: 14,
    Component: QuickDecisionGame,
  },
  {
    id: 'n-back',
    category: 'memory',
    mode: 'timed',
    title: 'N-Geri',
    instruction: 'Simge n adım öncekiyle aynı mı?',
    description:
      'Akan simgelerde n adım öncekiyle eşleşeni yakalarsın. Üst üste doğru bildikçe n büyür.',
    skills: ['Çalışma belleği', 'Dikkat', 'Güncelleme'],
    baseXp: 24,
    Component: NBackGame,
  },
  {
    id: 'grid-recall',
    category: 'memory',
    mode: 'levels',
    title: 'Nerede Kaldı?',
    instruction: 'Yanan hücreleri hatırla',
    description:
      'Izgarada yanıp sönen hücreleri aklında tutup aynılarını işaretlersin. Her seviyede hücre sayısı artar.',
    skills: ['Görsel bellek', 'Uzamsal bellek', 'Dikkat'],
    baseXp: 20,
    Component: GridRecallGame,
  },
  {
    id: 'tracking',
    category: 'attention',
    mode: 'levels',
    title: 'Çoklu Takip',
    instruction: 'Hedefleri gözünle takip et',
    description:
      'İşaretli toplar diğerlerine karışır; durduklarında hangilerinin hedef olduğunu bulursun.',
    skills: ['Bölünmüş dikkat', 'Görsel takip', 'Odak sürdürme'],
    baseXp: 26,
    Component: TrackingGame,
  },
  {
    id: 'balance',
    category: 'math',
    mode: 'levels',
    title: 'Terazi',
    instruction: 'Kaç daire dengeler?',
    description: 'İpucu terazilerinden şekillerin ağırlığını çıkarıp soru terazisini dengelersin.',
    skills: ['Denklem kurma', 'Çıkarım', 'Aritmetik'],
    baseXp: 22,
    Component: BalanceGame,
  },
  {
    id: 'tiling',
    category: 'spatial',
    mode: 'levels',
    title: 'Parça Birleştir',
    instruction: 'Parçaları çerçeveye tam oturt',
    description:
      'Parçaları döndürüp çerçeveyi boşluksuz doldurursun. Her tahta parçalara bölünerek üretildiği için çözülebilir.',
    skills: ['Uzamsal planlama', 'Zihinde döndürme', 'Deneme-yanılma'],
    baseXp: 26,
    Component: TilingGame,
  },
];

export function findGame(id: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.id === id);
}

export function isGamePlayable(id: string): boolean {
  return findGame(id) !== undefined;
}
