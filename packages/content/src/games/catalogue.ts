import type { GameCategory, GameMode, Localized } from '@neuropeak/core';

/**
 * Oyun kataloğu.
 *
 * Oyunun kimliği, kategorisi, metinleri ve XP değeri içerik; hangi
 * React bileşeninin çalıştığı uygulama meselesi. Katalog bu yüzden
 * mobil kayıt defterinden buraya taşındı: veritabanında zaten bir
 * `games` tablosu var ve yönetim paneli bu listeyi oradan okuyacak.
 * Mobil kayıt defteri artık katalogla bileşenleri eşleştiriyor.
 *
 * Metinler iki dilli: arayüz hangi dili seçtiyse onu gösterir.
 */

export type ContentGame = {
  readonly id: string;
  readonly category: GameCategory;
  readonly mode: GameMode;
  readonly title: Localized;
  /** Oyun ekranının üstündeki tek cümlelik yönerge. */
  readonly instruction: Localized;
  /** Brifing ekranındaki kısa açıklama. */
  readonly description: Localized;
  /** Bu oyunun geliştirdiği yetenekler; brifingde listelenir. */
  readonly skills: readonly Localized[];
  readonly baseXp: number;
  /** Seviyeli oyunlarda toplam seviye; süreli oyunlarda 0. */
  readonly totalLevels: number;
};

export const GAME_CATALOGUE: readonly ContentGame[] = [
  {
    id: 'card-match',
    category: 'memory',
    mode: 'levels',
    title: { tr: 'Kart Eşleme', en: 'Card Match' },
    instruction: {
      tr: 'Aynı simgeye sahip iki kartı bul',
      en: 'Find the two cards with the same symbol',
    },
    description: {
      tr: 'Kartları çevirip eşlerini bul. Her seviyede kart sayısı artar; az hamleyle bitirmek bonus getirir.',
      en: 'Flip the cards and find the pairs. Each level adds cards, and finishing in fewer moves earns a bonus.',
    },
    skills: [
      { tr: 'Görsel hafıza', en: 'Visual memory' },
      { tr: 'Konum hatırlama', en: 'Location recall' },
      { tr: 'Dikkat', en: 'Attention' },
    ],
    baseXp: 14,
    totalLevels: 240,
  },
  {
    id: 'light-sequence',
    category: 'memory',
    mode: 'timed',
    title: { tr: 'Işık Dizisi', en: 'Light Sequence' },
    instruction: {
      tr: 'Diziyi izle, sonra aynı sırayla tekrarla',
      en: 'Watch the sequence, then repeat it in order',
    },
    description: {
      tr: 'Her turda diziye bir ışık eklenir. Diziyi hatırlayabildiğin sürece oyun sürer.',
      en: 'Every round adds one more light. The game lasts as long as you can hold the sequence.',
    },
    skills: [
      { tr: 'Kısa süreli hafıza', en: 'Short-term memory' },
      { tr: 'Sıra hatırlama', en: 'Order recall' },
      { tr: 'Odaklanma', en: 'Focus' },
    ],
    baseXp: 16,
    totalLevels: 0,
  },
  {
    id: 'digit-span',
    category: 'memory',
    mode: 'timed',
    title: { tr: 'Sayı Menzili', en: 'Digit Span' },
    instruction: {
      tr: 'Rakamları aklında tut, sonra sırayla gir',
      en: 'Hold the digits in mind, then type them in order',
    },
    description: {
      tr: 'Doğru bildikçe sayı uzar, yanıldıkça kısalır. İki hakkın var; en uzun diziye ulaşmaya çalış.',
      en: 'The number grows when you are right and shrinks when you are wrong. You have two lives — reach the longest span you can.',
    },
    skills: [
      { tr: 'Çalışma belleği', en: 'Working memory' },
      { tr: 'Sayısal hafıza', en: 'Numeric memory' },
      { tr: 'Konsantrasyon', en: 'Concentration' },
    ],
    baseXp: 16,
    totalLevels: 0,
  },
  {
    id: 'stroop',
    category: 'attention',
    mode: 'timed',
    title: { tr: 'Renk Tuzağı', en: 'Colour Trap' },
    instruction: {
      tr: 'Yazının rengini seç, kelimeyi değil',
      en: 'Pick the ink colour, not the word',
    },
    description: {
      tr: 'Kelime bir renk adı, ama hangi renkte yazıldığı başka. Beynin okumayı bastırıp rengi görmesi gerekiyor.',
      en: 'The word names one colour but is printed in another. Your brain has to suppress reading and see the colour.',
    },
    skills: [
      { tr: 'Dürtü kontrolü', en: 'Impulse control' },
      { tr: 'Seçici dikkat', en: 'Selective attention' },
      { tr: 'Zihinsel esneklik', en: 'Mental flexibility' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'odd-one-out',
    category: 'attention',
    mode: 'timed',
    title: { tr: 'Farklı Olanı Bul', en: 'Odd One Out' },
    instruction: {
      tr: 'Izgaradaki tek farklı tonu bul',
      en: 'Find the one different shade in the grid',
    },
    description: {
      tr: 'Her doğruda ızgara büyür ve renk farkı incelir. Gözün ne kadar ayrıntı yakaladığını ölçer.',
      en: 'Each correct answer grows the grid and narrows the colour gap. It measures how much detail your eye catches.',
    },
    skills: [
      { tr: 'Görsel ayırt etme', en: 'Visual discrimination' },
      { tr: 'Tarama hızı', en: 'Scanning speed' },
      { tr: 'Sürdürülebilir dikkat', en: 'Sustained attention' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'symbol-hunt',
    category: 'attention',
    mode: 'timed',
    title: { tr: 'Simge Avı', en: 'Symbol Hunt' },
    instruction: {
      tr: "Sayıları 1'den başlayarak sırayla bul",
      en: 'Find the numbers in order, starting from 1',
    },
    description: {
      tr: 'Dağınık bir tabloda sayıları sırayla bul. Tablo bitince yenisi gelir; amaç sürede kaç tablo bitirdiğin.',
      en: 'Find the numbers in order in a scattered grid. A new grid follows each finished one — the goal is how many you clear in time.',
    },
    skills: [
      { tr: 'Görsel tarama', en: 'Visual search' },
      { tr: 'Dikkat dağılmasına direnç', en: 'Distraction resistance' },
      { tr: 'İşlem hızı', en: 'Processing speed' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'go-no-go',
    category: 'attention',
    mode: 'timed',
    title: { tr: 'Dur / Geç', en: 'Go / No-Go' },
    instruction: {
      tr: 'Yeşil daireye dokun, kırmızı kareye dokunma',
      en: 'Tap the green circle, never the red square',
    },
    description: {
      tr: 'Hızlı tepki vermek yarısı; asıl zor olan yanlış uyaranda elini tutabilmek.',
      en: 'Reacting fast is half of it; the hard part is holding back on the wrong signal.',
    },
    skills: [
      { tr: 'Dürtü kontrolü', en: 'Impulse control' },
      { tr: 'Tepki hızı', en: 'Reaction speed' },
      { tr: 'Hata izleme', en: 'Error monitoring' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'matrix',
    category: 'logic',
    mode: 'levels',
    title: { tr: 'Matris Bulmaca', en: 'Matrix Puzzle' },
    instruction: {
      tr: 'Kuralı bul, eksik hücreyi tamamla',
      en: 'Find the rule, complete the missing cell',
    },
    description: {
      tr: '3×3 ızgaradaki örüntüyü çöz ve boş hücreye hangi şeklin geleceğini bul. Her doğruda kural zorlaşır.',
      en: 'Work out the pattern in the 3×3 grid and pick the shape that belongs in the empty cell. Each correct answer makes the rule harder.',
    },
    skills: [
      { tr: 'Soyut akıl yürütme', en: 'Abstract reasoning' },
      { tr: 'Örüntü tanıma', en: 'Pattern recognition' },
      { tr: 'Tümevarım', en: 'Induction' },
    ],
    baseXp: 18,
    totalLevels: 320,
  },
  {
    id: 'liquid-sort',
    category: 'logic',
    mode: 'levels',
    title: { tr: 'Sıvı Sıralama', en: 'Liquid Sort' },
    instruction: {
      tr: 'Her şişede tek renk kalana kadar dök',
      en: 'Pour until each bottle holds a single colour',
    },
    description: {
      tr: 'Renkleri şişeler arasında taşıyarak ayır. Her seviyede renk sayısı artar; tahtalar üretilirken çözülebilirlikleri doğrulanır.',
      en: 'Separate the colours by pouring between bottles. Each level adds a colour, and every board is verified solvable as it is generated.',
    },
    skills: [
      { tr: 'İleri planlama', en: 'Forward planning' },
      { tr: 'Problem çözme', en: 'Problem solving' },
      { tr: 'Sabır', en: 'Patience' },
    ],
    baseXp: 18,
    totalLevels: 400,
  },
  {
    id: 'logic-chain',
    category: 'logic',
    mode: 'levels',
    title: { tr: 'Mantık Zinciri', en: 'Logic Chain' },
    instruction: {
      tr: 'Verilenlerden sıralamayı çıkar',
      en: 'Work out the order from the clues',
    },
    description: {
      tr: 'Karşılaştırmalardan tam sıralamayı kurup soruyu cevapla. Zincir her seviyede uzar.',
      en: 'Build the full ordering from the comparisons, then answer the question. The chain grows with every level.',
    },
    skills: [
      { tr: 'Tümdengelim', en: 'Deduction' },
      { tr: 'Çalışma belleği', en: 'Working memory' },
      { tr: 'Sıralama', en: 'Ordering' },
    ],
    baseXp: 18,
    totalLevels: 240,
  },
  {
    id: 'quick-math',
    category: 'math',
    mode: 'timed',
    title: { tr: 'Hızlı İşlem', en: 'Quick Math' },
    instruction: { tr: 'Doğru sonucu seç', en: 'Pick the right answer' },
    description: {
      tr: 'Sürede kaç işlem çözebildiğini ölçer. Doğru seri uzadıkça her işlem daha çok puan getirir.',
      en: 'Measures how many sums you can solve in the time. A longer correct streak makes each sum worth more.',
    },
    skills: [
      { tr: 'Zihinden işlem', en: 'Mental arithmetic' },
      { tr: 'İşlem hızı', en: 'Processing speed' },
      { tr: 'Sayı duyusu', en: 'Number sense' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'number-series',
    category: 'math',
    mode: 'levels',
    title: { tr: 'Sayı Dizisi', en: 'Number Series' },
    instruction: { tr: 'Diziyi sürdüren sayıyı bul', en: 'Find the number that continues it' },
    description: {
      tr: 'Diziyi üreten kuralı çöz ve devamını seç. Doğru cevaptan sonra kural gösterilir.',
      en: 'Work out the rule behind the sequence and pick what comes next. The rule is revealed after each answer.',
    },
    skills: [
      { tr: 'Örüntü tanıma', en: 'Pattern recognition' },
      { tr: 'Tümevarım', en: 'Induction' },
      { tr: 'Sayısal akıl yürütme', en: 'Numeric reasoning' },
    ],
    baseXp: 18,
    totalLevels: 280,
  },
  {
    id: 'target-number',
    category: 'math',
    mode: 'levels',
    title: { tr: 'Hedef Sayı', en: 'Target Number' },
    instruction: {
      tr: 'Dört sayı ve dört işlemle hedefe ulaş',
      en: 'Reach the target with four numbers and four operations',
    },
    description: {
      tr: 'İki sayı seçip bir işlemle birleştir. Elde tek sayı kalıp hedefe eşit olunca seviye biter; her bulmacanın çözümü garanti.',
      en: 'Combine two numbers with one operation at a time. The level ends when a single number is left and it matches the target — every puzzle is guaranteed solvable.',
    },
    skills: [
      { tr: 'Esnek düşünme', en: 'Flexible thinking' },
      { tr: 'Planlama', en: 'Planning' },
      { tr: 'Aritmetik', en: 'Arithmetic' },
    ],
    baseXp: 20,
    totalLevels: 300,
  },
  {
    id: 'rotation',
    category: 'spatial',
    mode: 'timed',
    title: { tr: 'Şekil Döndürme', en: 'Mental Rotation' },
    instruction: {
      tr: 'Aynı şekil mi, ayna görüntüsü mü?',
      en: 'Same shape, or a mirror image?',
    },
    description: {
      tr: 'Soldaki şekil döndürülerek sağdakine oturuyor mu, yoksa aynası mı? Zihinde döndürme hızını ölçer.',
      en: 'Does the left shape rotate onto the right one, or is it mirrored? Measures how fast you rotate shapes in your head.',
    },
    skills: [
      { tr: 'Zihinsel döndürme', en: 'Mental rotation' },
      { tr: 'Uzamsal görselleştirme', en: 'Spatial visualisation' },
      { tr: 'Karar hızı', en: 'Decision speed' },
    ],
    baseXp: 16,
    totalLevels: 0,
  },
  {
    id: 'paper-fold',
    category: 'spatial',
    mode: 'levels',
    title: { tr: 'Katla-Aç', en: 'Paper Fold' },
    instruction: {
      tr: 'Kağıt açılınca delikler nerede olur?',
      en: 'Where are the holes once the paper unfolds?',
    },
    description: {
      tr: 'Katlanmış kağıttaki delikler açıldığında nereye düşer? Her seviyede katlama ve delik sayısı artar.',
      en: 'Where do the punched holes land when the folded paper opens? Each level adds folds and holes.',
    },
    skills: [
      { tr: 'Uzamsal muhakeme', en: 'Spatial reasoning' },
      { tr: 'Simetri', en: 'Symmetry' },
      { tr: 'Zihinde canlandırma', en: 'Mental imagery' },
    ],
    baseXp: 20,
    totalLevels: 200,
  },
  {
    id: 'shadow-match',
    category: 'spatial',
    mode: 'timed',
    title: { tr: 'Gölge Eşleştir', en: 'Shadow Match' },
    instruction: { tr: 'Şeklin gölgesini bul', en: "Find the shape's shadow" },
    description: {
      tr: 'Üstteki şeklin silüetini dört gölgeden bul. Gölgeler döndürülmüş olabilir.',
      en: 'Pick the silhouette of the shape above from four shadows. They may be rotated.',
    },
    skills: [
      { tr: 'Şekil tanıma', en: 'Shape recognition' },
      { tr: 'Görsel eşleştirme', en: 'Visual matching' },
      { tr: 'Dikkat', en: 'Attention' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'anagram',
    category: 'verbal',
    mode: 'levels',
    title: { tr: 'Kelime Avı', en: 'Word Hunt' },
    instruction: {
      tr: 'İpucunu oku, harflerden kelimeyi kur',
      en: 'Read the clue, build the word from the letters',
    },
    description: {
      tr: 'Karışık harflerden ipucuna uyan kelimeyi kurarsın. Her üç seviyede bir kelimeler uzar.',
      en: 'Build the word that fits the clue from scrambled letters. The words get longer every three levels.',
    },
    skills: [
      { tr: 'Kelime dağarcığı', en: 'Vocabulary' },
      { tr: 'Harf çözümleme', en: 'Letter analysis' },
      { tr: 'Esnek düşünme', en: 'Flexible thinking' },
    ],
    baseXp: 18,
    totalLevels: 260,
  },
  {
    id: 'word-analogy',
    category: 'verbal',
    mode: 'levels',
    title: { tr: 'Sözel Analoji', en: 'Word Analogy' },
    instruction: {
      tr: 'İlişkiyi kur, eksik kelimeyi bul',
      en: 'Spot the relationship, find the missing word',
    },
    description: {
      tr: 'İlk iki kelime arasındaki ilişkinin aynısını kuran kelimeyi seçersin. Seviye yükseldikçe ilişkiler soyutlaşır.',
      en: 'Pick the word that forms the same relationship as the first pair. The relationships grow more abstract as you climb.',
    },
    skills: [
      { tr: 'Sözel muhakeme', en: 'Verbal reasoning' },
      { tr: 'İlişki kurma', en: 'Relational thinking' },
      { tr: 'Soyutlama', en: 'Abstraction' },
    ],
    baseXp: 20,
    totalLevels: 240,
  },
  {
    id: 'word-link',
    category: 'verbal',
    mode: 'timed',
    title: { tr: 'Kelime Bağı', en: 'Word Link' },
    instruction: {
      tr: 'Eş mi, zıt mı? Doğru kelimeyi seç',
      en: 'Synonym or antonym? Pick the right word',
    },
    description: {
      tr: 'Verilen kelimenin eş ya da zıt anlamlısını 60 saniyede olabildiğince çok bul. Soruyu okumadan cevaplayamazsın.',
      en: 'Find as many synonyms or antonyms as you can in 60 seconds. You cannot answer without reading the question.',
    },
    skills: [
      { tr: 'Kelime dağarcığı', en: 'Vocabulary' },
      { tr: 'Anlam ayırt etme', en: 'Meaning discrimination' },
      { tr: 'Okuma hızı', en: 'Reading speed' },
    ],
    baseXp: 15,
    totalLevels: 0,
  },
  {
    id: 'one-line',
    category: 'logic',
    mode: 'levels',
    title: { tr: 'Tek Çizgi', en: 'One Line' },
    instruction: {
      tr: 'Kalemi kaldırmadan her kenarı bir kez çiz',
      en: 'Draw every edge once without lifting your finger',
    },
    description: {
      tr: 'Noktalara sırayla dokunarak bütün kenarları tek seferde çizersin. Her tahta çözülebilir üretilir.',
      en: 'Tap the dots in order to draw every edge in a single stroke. Every board is generated solvable.',
    },
    skills: [
      { tr: 'Planlama', en: 'Planning' },
      { tr: 'Uzamsal muhakeme', en: 'Spatial reasoning' },
      { tr: 'Deneme-yanılma', en: 'Trial and error' },
    ],
    baseXp: 22,
    totalLevels: 315,
  },
  {
    id: 'connect',
    category: 'logic',
    mode: 'levels',
    title: { tr: 'Bağlantı', en: 'Connect' },
    instruction: {
      tr: 'Aynı renkleri kesişmeden bağla',
      en: 'Join matching colours without crossing',
    },
    description: {
      tr: 'Aynı renk iki noktayı, yollar birbirini kesmeden bağlarsın. Seviye yükseldikçe ızgara ve çift sayısı büyür.',
      en: 'Connect each pair of same-coloured dots so the paths never cross. The grid and the number of pairs grow with each level.',
    },
    skills: [
      { tr: 'Planlama', en: 'Planning' },
      { tr: 'Uzamsal muhakeme', en: 'Spatial reasoning' },
      { tr: 'Sabır', en: 'Patience' },
    ],
    baseXp: 24,
    totalLevels: 280,
  },
  {
    id: 'maze',
    category: 'logic',
    mode: 'levels',
    title: { tr: 'Doğru Yolu Seç', en: 'Find the Way' },
    instruction: { tr: 'Labirentten çıkışı bul', en: 'Find the way out of the maze' },
    description: {
      tr: 'Yön tuşlarıyla labirentten çıkarsın. Kısa yoldan çıkmak daha çok puan getirir.',
      en: 'Use the arrows to escape the maze. The shorter your route, the more points you score.',
    },
    skills: [
      { tr: 'Yön bulma', en: 'Wayfinding' },
      { tr: 'Planlama', en: 'Planning' },
      { tr: 'Çalışma belleği', en: 'Working memory' },
    ],
    baseXp: 20,
    totalLevels: 300,
  },
  {
    id: 'reaction',
    category: 'speed',
    mode: 'timed',
    title: { tr: 'Reaksiyon', en: 'Reaction' },
    instruction: { tr: 'Yeşili görünce hemen bas', en: 'Tap the moment it turns green' },
    description: {
      tr: 'Ekran yeşile dönünce basarsın. Beş ölçümün ortalaması tepki süreni milisaniye hassasiyetiyle verir.',
      en: 'Tap when the screen turns green. Five measurements give your reaction time to the millisecond.',
    },
    skills: [
      { tr: 'Tepki süresi', en: 'Reaction time' },
      { tr: 'Dikkat', en: 'Attention' },
      { tr: 'Dürtü kontrolü', en: 'Impulse control' },
    ],
    baseXp: 12,
    totalLevels: 0,
  },
  {
    id: 'quick-decision',
    category: 'speed',
    mode: 'timed',
    title: { tr: 'Hızlı Karar', en: 'Quick Decision' },
    instruction: { tr: 'İki paneli karşılaştır', en: 'Compare the two panels' },
    description: {
      tr: 'Hangi tarafta daha çok nokta var, ya da sayılar aynı mı? Soru dönüşümlü sorulur, kalıba bağlanamazsın.',
      en: 'Which side has more dots, or are the numbers equal? The question alternates, so you cannot settle into a pattern.',
    },
    skills: [
      { tr: 'Karar hızı', en: 'Decision speed' },
      { tr: 'Sayı sezgisi', en: 'Number intuition' },
      { tr: 'Dikkat', en: 'Attention' },
    ],
    baseXp: 14,
    totalLevels: 0,
  },
  {
    id: 'n-back',
    category: 'memory',
    mode: 'timed',
    title: { tr: 'N-Geri', en: 'N-Back' },
    instruction: {
      tr: 'Simge n adım öncekiyle aynı mı?',
      en: 'Does this symbol match the one n steps back?',
    },
    description: {
      tr: 'Akan simgelerde n adım öncekiyle eşleşeni yakalarsın. Üst üste doğru bildikçe n büyür.',
      en: 'Catch the symbol that matches the one n steps earlier. A run of correct calls raises n.',
    },
    skills: [
      { tr: 'Çalışma belleği', en: 'Working memory' },
      { tr: 'Dikkat', en: 'Attention' },
      { tr: 'Güncelleme', en: 'Updating' },
    ],
    baseXp: 24,
    totalLevels: 0,
  },
  {
    id: 'grid-recall',
    category: 'memory',
    mode: 'levels',
    title: { tr: 'Nerede Kaldı?', en: 'Grid Recall' },
    instruction: { tr: 'Yanan hücreleri hatırla', en: 'Remember the cells that lit up' },
    description: {
      tr: 'Izgarada yanıp sönen hücreleri aklında tutup aynılarını işaretlersin. Her seviyede hücre sayısı artar.',
      en: 'Hold the flashing cells in mind and mark the same ones. Each level adds another cell.',
    },
    skills: [
      { tr: 'Görsel bellek', en: 'Visual memory' },
      { tr: 'Uzamsal bellek', en: 'Spatial memory' },
      { tr: 'Dikkat', en: 'Attention' },
    ],
    baseXp: 20,
    totalLevels: 260,
  },
  {
    id: 'tracking',
    category: 'attention',
    mode: 'levels',
    title: { tr: 'Çoklu Takip', en: 'Multi Tracking' },
    instruction: { tr: 'Hedefleri gözünle takip et', en: 'Track the targets with your eyes' },
    description: {
      tr: 'İşaretli toplar diğerlerine karışır; durduklarında hangilerinin hedef olduğunu bulursun.',
      en: 'The marked balls blend into the rest; when they stop, pick out which ones were the targets.',
    },
    skills: [
      { tr: 'Bölünmüş dikkat', en: 'Divided attention' },
      { tr: 'Görsel takip', en: 'Visual tracking' },
      { tr: 'Odak sürdürme', en: 'Sustained focus' },
    ],
    baseXp: 26,
    totalLevels: 220,
  },
  {
    id: 'balance',
    category: 'math',
    mode: 'levels',
    title: { tr: 'Terazi', en: 'Balance' },
    instruction: { tr: 'Kaç daire dengeler?', en: 'How many circles balance it?' },
    description: {
      tr: 'İpucu terazilerinden şekillerin ağırlığını çıkarıp soru terazisini dengelersin.',
      en: 'Work out each shape’s weight from the clue scales, then balance the final one.',
    },
    skills: [
      { tr: 'Denklem kurma', en: 'Setting up equations' },
      { tr: 'Çıkarım', en: 'Inference' },
      { tr: 'Aritmetik', en: 'Arithmetic' },
    ],
    baseXp: 22,
    totalLevels: 260,
  },
  {
    id: 'tiling',
    category: 'spatial',
    mode: 'levels',
    title: { tr: 'Parça Birleştir', en: 'Tiling' },
    instruction: { tr: 'Parçaları çerçeveye tam oturt', en: 'Fit the pieces into the frame' },
    description: {
      tr: 'Parçaları döndürüp çerçeveyi boşluksuz doldurursun. Her tahta parçalara bölünerek üretildiği için çözülebilir.',
      en: 'Rotate the pieces and fill the frame with no gaps. Every board is built by cutting a solution apart, so it always fits.',
    },
    skills: [
      { tr: 'Uzamsal planlama', en: 'Spatial planning' },
      { tr: 'Zihinde döndürme', en: 'Mental rotation' },
      { tr: 'Deneme-yanılma', en: 'Trial and error' },
    ],
    baseXp: 26,
    totalLevels: 240,
  },
];

export function findGameContent(id: string): ContentGame | undefined {
  return GAME_CATALOGUE.find((game) => game.id === id);
}
