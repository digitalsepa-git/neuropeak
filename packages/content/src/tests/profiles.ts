import type { Localized, TraitWeights } from '@neuropeak/core';

/**
 * Profil testleri: Zihin Arketipi, Odaklanma Profili, Kişilik Haritası.
 *
 * Doğru cevabı olmayan testler. Her şık bir ya da birkaç eksene puan
 * yazıyor; puanlama `@neuropeak/core`'daki `scoreProfile` ile
 * yapılıyor.
 *
 * Bunlar bir kişilik envanteri değil. Yayımlanmış bir ölçeğe
 * dayanmıyorlar, bir tanı aracı değiller ve her testin `caveat`
 * alanı bunu kullanıcıya hem girişte hem sonuçta söylüyor.
 */

export type ProfileTrait = {
  readonly id: string;
  readonly label: Localized;
  /** Ekseni bir cümleyle anlatır; sonuç ekranında çubuğun altında. */
  readonly description: Localized;
};

export type ProfileAnswer = {
  readonly label: Localized;
  readonly weights: TraitWeights;
};

export type ProfileQuestion = {
  readonly id: string;
  readonly prompt: Localized;
  readonly options: readonly ProfileAnswer[];
};

export type ProfileOutcome = {
  readonly id: string;
  readonly traits: readonly string[];
  readonly title: Localized;
  readonly description: Localized;
};

export type ProfileTest = {
  readonly id: string;
  readonly title: Localized;
  readonly description: Localized;
  readonly caveat: Localized;
  readonly estMinutes: readonly [number, number];
  readonly isPro: boolean;
  readonly traits: readonly ProfileTrait[];
  readonly questions: readonly ProfileQuestion[];
  /**
   * Tanımlıysa sonuç tek bir arketip olarak gösterilir; tanımsızsa
   * eksen haritası gösterilir.
   */
  readonly outcomes?: readonly ProfileOutcome[];
  /** Hiçbir eksen öne çıkmadığında gösterilen sonuç. */
  readonly balanced?: ProfileOutcome;
};

// ------------------------------------------------------------ arketip

const ARCHETYPE_TRAITS: readonly ProfileTrait[] = [
  {
    id: 'analytic',
    label: { tr: 'Çözümleyici', en: 'Analytic' },
    description: {
      tr: 'Önce parçalara ayırır, sonra karar verirsin.',
      en: 'You break things apart before you decide.',
    },
  },
  {
    id: 'intuitive',
    label: { tr: 'Sezgisel', en: 'Intuitive' },
    description: {
      tr: 'Bütünü hızlıca görür, ayrıntıyı sonra doldurursun.',
      en: 'You see the whole quickly and fill in the detail later.',
    },
  },
  {
    id: 'creative',
    label: { tr: 'Üretken', en: 'Creative' },
    description: {
      tr: 'Alışılmış yolun dışında seçenek aramayı seversin.',
      en: 'You like looking for options off the beaten path.',
    },
  },
  {
    id: 'methodical',
    label: { tr: 'Sistemli', en: 'Methodical' },
    description: {
      tr: 'Bir sıraya oturtmadan başlamak sana zor gelir.',
      en: 'Starting without an order in place feels hard to you.',
    },
  },
];

function q(id: string, prompt: Localized, options: readonly ProfileAnswer[]): ProfileQuestion {
  return { id, prompt, options };
}

const ARCHETYPE_QUESTIONS: readonly ProfileQuestion[] = [
  q(
    'ar-1',
    {
      tr: 'Yeni bir bulmacaya oturduğunda ilk ne yaparsın?',
      en: 'When you sit down to a new puzzle, what do you do first?',
    },
    [
      {
        label: { tr: 'Kuralları baştan sona okurum', en: 'Read the rules end to end' },
        weights: { methodical: 2, analytic: 1 },
      },
      {
        label: { tr: 'Birkaç hamle deneyip görürüm', en: 'Try a few moves and see' },
        weights: { intuitive: 2, creative: 1 },
      },
      {
        label: { tr: 'Parçalara ayırıp sınıflarım', en: 'Break it into parts and sort them' },
        weights: { analytic: 2, methodical: 1 },
      },
      {
        label: {
          tr: 'Bambaşka bir yol var mı diye bakarım',
          en: 'Look for a completely different route',
        },
        weights: { creative: 2, intuitive: 1 },
      },
    ],
  ),
  q(
    'ar-2',
    {
      tr: 'Bir işte tıkandın. Ne yaparsın?',
      en: 'You are stuck on something. What do you do?',
    },
    [
      {
        label: { tr: 'Baştan sistemli şekilde tekrar ederim', en: 'Start over, methodically' },
        weights: { methodical: 2 },
      },
      {
        label: {
          tr: 'Nerede yanıldığımı tek tek ararım',
          en: 'Hunt down exactly where I went wrong',
        },
        weights: { analytic: 2 },
      },
      {
        label: {
          tr: 'Bir süre bırakır, aklıma gelmesini beklerim',
          en: 'Leave it a while and wait for it to come',
        },
        weights: { intuitive: 2 },
      },
      {
        label: {
          tr: 'Kuralı esnetip başka bir şey denerim',
          en: 'Bend the rule and try something else',
        },
        weights: { creative: 2 },
      },
    ],
  ),
  q(
    'ar-3',
    {
      tr: 'Bir karar verirken sana en çok hangisi yardımcı olur?',
      en: 'What helps you most when making a decision?',
    },
    [
      {
        label: { tr: 'Sayılar ve karşılaştırma', en: 'Numbers and comparison' },
        weights: { analytic: 2 },
      },
      { label: { tr: 'İlk hissim', en: 'My first instinct' }, weights: { intuitive: 2 } },
      {
        label: { tr: 'Daha önce denenmemiş bir seçenek', en: 'An option nobody has tried' },
        weights: { creative: 2 },
      },
      {
        label: { tr: 'Adım adım bir kontrol listesi', en: 'A step-by-step checklist' },
        weights: { methodical: 2 },
      },
    ],
  ),
  q(
    'ar-4',
    {
      tr: 'Masanın hâli seni ne kadar ilgilendirir?',
      en: 'How much does the state of your desk matter to you?',
    },
    [
      {
        label: { tr: 'Her şey yerli yerinde olmalı', en: 'Everything has its place' },
        weights: { methodical: 2 },
      },
      {
        label: { tr: 'Dağınıklık bazen işime yarıyor', en: 'A bit of mess sometimes helps' },
        weights: { creative: 2 },
      },
      {
        label: { tr: 'Çalıştığım işe göre değişir', en: 'Depends on what I am working on' },
        weights: { analytic: 1, intuitive: 1 },
      },
      {
        label: { tr: 'Hiç dikkatimi çekmiyor', en: 'I never notice it' },
        weights: { intuitive: 2 },
      },
    ],
  ),
  q(
    'ar-5',
    {
      tr: 'Bir açıklamayı en iyi nasıl anlarsın?',
      en: 'How do you best take in an explanation?',
    },
    [
      { label: { tr: 'Bir örnek üzerinden', en: 'Through an example' }, weights: { intuitive: 2 } },
      {
        label: { tr: 'Şema ve sıralama ile', en: 'With a diagram and an order' },
        weights: { methodical: 2 },
      },
      {
        label: { tr: 'Neden öyle olduğunu sorarak', en: 'By asking why it is so' },
        weights: { analytic: 2 },
      },
      {
        label: { tr: 'Kendim kurcalayarak', en: 'By taking it apart myself' },
        weights: { creative: 2 },
      },
    ],
  ),
  q(
    'ar-6',
    {
      tr: 'Bir planın bozulduğunda ilk tepkin ne olur?',
      en: 'When a plan falls apart, what is your first reaction?',
    },
    [
      { label: { tr: 'Yeni bir plan yaparım', en: 'Make a new plan' }, weights: { methodical: 2 } },
      {
        label: { tr: 'Neyin bozduğunu bulurum', en: 'Work out what broke it' },
        weights: { analytic: 2 },
      },
      {
        label: { tr: 'Bunu fırsata çeviririm', en: 'Turn it into an opening' },
        weights: { creative: 2 },
      },
      { label: { tr: 'Akışına bırakırım', en: 'Go with it' }, weights: { intuitive: 2 } },
    ],
  ),
  q(
    'ar-7',
    {
      tr: 'Hangi övgü sana daha çok benziyor?',
      en: 'Which compliment sounds more like you?',
    },
    [
      {
        label: {
          tr: '"Hiç kimsenin aklına gelmezdi."',
          en: '"Nobody else would have thought of that."',
        },
        weights: { creative: 2 },
      },
      {
        label: { tr: '"Hiçbir ayrıntıyı kaçırmıyorsun."', en: '"You never miss a detail."' },
        weights: { analytic: 2 },
      },
      {
        label: {
          tr: '"Seninle her şey yolunda gidiyor."',
          en: '"Everything runs smoothly with you."',
        },
        weights: { methodical: 2 },
      },
      {
        label: { tr: '"Nasıl bu kadar çabuk anladın?"', en: '"How did you get it so fast?"' },
        weights: { intuitive: 2 },
      },
    ],
  ),
  q(
    'ar-8',
    {
      tr: 'Uzun bir işe başlarken neye ihtiyaç duyarsın?',
      en: 'What do you need before starting something long?',
    },
    [
      { label: { tr: 'Net bir sıra', en: 'A clear order' }, weights: { methodical: 2 } },
      {
        label: { tr: 'İşin neye yaradığını anlamaya', en: 'To understand what it is for' },
        weights: { analytic: 2 },
      },
      {
        label: { tr: 'Merak uyandıran bir yanına', en: 'Something about it that sparks curiosity' },
        weights: { creative: 2 },
      },
      { label: { tr: 'Sadece başlamaya', en: 'Just to begin' }, weights: { intuitive: 2 } },
    ],
  ),
];

export const archetypeTest: ProfileTest = {
  id: 'archetype',
  title: { tr: 'Zihin Arketipin', en: 'Your Mind Archetype' },
  description: {
    tr: 'Sekiz soruda düşünme biçimine en yakın duran arketip.',
    en: 'Eight questions, and the archetype that sits closest to how you think.',
  },
  caveat: {
    tr: 'Bu bir kişilik envanteri değil; yayımlanmış bir ölçeğe dayanmıyor. Eğlenmek ve kendi tercihlerine bakmak için.',
    en: 'This is not a personality inventory and is not based on a published scale. It is for fun and for looking at your own preferences.',
  },
  estMinutes: [2, 3],
  isPro: true,
  traits: ARCHETYPE_TRAITS,
  questions: ARCHETYPE_QUESTIONS,
  outcomes: [
    {
      id: 'architect',
      traits: ['analytic', 'methodical'],
      title: { tr: 'Mimar', en: 'The Architect' },
      description: {
        tr: 'Önce yapıyı kurar, sonra içini doldurursun. Karmaşık bir işi parçalara ayırmak ve sıraya koymak sana doğal geliyor.',
        en: 'You build the structure first and fill it in after. Breaking a complex job into ordered parts comes naturally.',
      },
    },
    {
      id: 'explorer',
      traits: ['intuitive', 'creative'],
      title: { tr: 'Kâşif', en: 'The Explorer' },
      description: {
        tr: 'Önce dener, yolda öğrenirsin. Alışılmış yolun dışına çıkmak seni yormuyor, aksine hızlandırıyor.',
        en: 'You try first and learn on the way. Stepping off the usual path does not tire you — it speeds you up.',
      },
    },
    {
      id: 'strategist',
      traits: ['analytic', 'intuitive'],
      title: { tr: 'Stratejist', en: 'The Strategist' },
      description: {
        tr: 'Bütünü hızlı görüyor, sonra sayılarla doğruluyorsun. Hem sezgine hem hesabına güveniyorsun.',
        en: 'You see the whole fast, then check it against the numbers. You trust both your instinct and your arithmetic.',
      },
    },
    {
      id: 'craftsman',
      traits: ['methodical', 'creative'],
      title: { tr: 'Zanaatkâr', en: 'The Craftsman' },
      description: {
        tr: 'Kendi düzenini kurup içinde özgürce çalışıyorsun. Sıra senin için kısıt değil, zemin.',
        en: 'You set up your own order and then work freely inside it. Structure is not a constraint for you, it is a floor.',
      },
    },
  ],
  balanced: {
    id: 'balanced',
    traits: [],
    title: { tr: 'Dengeli', en: 'The Balanced' },
    description: {
      tr: 'Dört eksen birbirine çok yakın çıktı. Bir arketipe yerleştirmek yerine şunu söyleyelim: işe göre yöntem değiştiriyorsun.',
      en: 'The four axes came out very close. Rather than put you in one archetype: you change method to suit the job.',
    },
  },
};

// -------------------------------------------------------- odaklanma

const FOCUS_TRAITS: readonly ProfileTrait[] = [
  {
    id: 'sustained',
    label: { tr: 'Sürdürme', en: 'Sustaining' },
    description: {
      tr: 'Aynı işte uzun süre kalabilme.',
      en: 'Staying with one task for a long stretch.',
    },
  },
  {
    id: 'switching',
    label: { tr: 'Geçiş', en: 'Switching' },
    description: {
      tr: 'İşler arasında hızlı ve kayıpsız geçebilme.',
      en: 'Moving between tasks quickly and without loss.',
    },
  },
  {
    id: 'resistance',
    label: { tr: 'Dirençlilik', en: 'Resistance' },
    description: {
      tr: 'Dikkat dağıtıcıya rağmen işte kalabilme.',
      en: 'Staying on task despite distraction.',
    },
  },
  {
    id: 'recovery',
    label: { tr: 'Toparlanma', en: 'Recovery' },
    description: {
      tr: 'Bölündükten sonra geri dönebilme.',
      en: 'Getting back in after an interruption.',
    },
  },
];

const FOCUS_QUESTIONS: readonly ProfileQuestion[] = [
  q(
    'fo-1',
    { tr: 'Bir işe daldığında ne kadar kalırsın?', en: 'Once you are in, how long do you stay?' },
    [
      {
        label: { tr: 'Saatlerce, farkına varmadan', en: 'Hours, without noticing' },
        weights: { sustained: 3 },
      },
      { label: { tr: 'Bir saat kadar', en: 'About an hour' }, weights: { sustained: 2 } },
      {
        label: { tr: 'Yarım saati zor bulurum', en: 'Half an hour is a stretch' },
        weights: { sustained: 1 },
      },
      {
        label: { tr: 'Birkaç dakikada bir kopuyorum', en: 'I drift off every few minutes' },
        weights: { sustained: 0 },
      },
    ],
  ),
  q(
    'fo-2',
    {
      tr: 'İki iş arasında geçiş yapmak sana nasıl geliyor?',
      en: 'How does switching between two tasks feel?',
    },
    [
      {
        label: { tr: 'Kolay, hemen adapte olurum', en: 'Easy, I adapt right away' },
        weights: { switching: 3 },
      },
      {
        label: { tr: 'Biraz zaman alıyor ama oluyor', en: 'Takes a moment, but fine' },
        weights: { switching: 2 },
      },
      { label: { tr: 'Zorlanıyorum', en: 'I struggle' }, weights: { switching: 1 } },
      {
        label: { tr: 'Tek işte kalmayı tercih ederim', en: 'I would rather stay on one' },
        weights: { switching: 0, sustained: 1 },
      },
    ],
  ),
  q(
    'fo-3',
    {
      tr: 'Açık ofiste ya da gürültüde çalışabilir misin?',
      en: 'Can you work in an open office or noise?',
    },
    [
      {
        label: { tr: 'Gürültüyü fark etmem', en: 'I do not notice the noise' },
        weights: { resistance: 3 },
      },
      { label: { tr: 'Kulaklıkla olur', en: 'With headphones, yes' }, weights: { resistance: 2 } },
      {
        label: { tr: 'Zor, sık bölünürüm', en: 'Hard, I get interrupted often' },
        weights: { resistance: 1 },
      },
      { label: { tr: 'Sessizlik şart', en: 'I need silence' }, weights: { resistance: 0 } },
    ],
  ),
  q(
    'fo-4',
    {
      tr: 'Bölündükten sonra işe dönmen ne kadar sürer?',
      en: 'After an interruption, how long to get back in?',
    },
    [
      { label: { tr: 'Saniyeler', en: 'Seconds' }, weights: { recovery: 3 } },
      { label: { tr: 'Birkaç dakika', en: 'A few minutes' }, weights: { recovery: 2 } },
      { label: { tr: 'Çeyrek saat kadar', en: 'About fifteen minutes' }, weights: { recovery: 1 } },
      {
        label: { tr: 'O iş o gün bitti', en: 'That task is done for the day' },
        weights: { recovery: 0 },
      },
    ],
  ),
  q(
    'fo-5',
    {
      tr: 'Telefonun yanında dururken ne sıklıkla bakarsın?',
      en: 'With your phone nearby, how often do you check it?',
    },
    [
      { label: { tr: 'Neredeyse hiç', en: 'Almost never' }, weights: { resistance: 3 } },
      { label: { tr: 'Arada bir', en: 'Now and then' }, weights: { resistance: 2 } },
      { label: { tr: 'Sık sık', en: 'Often' }, weights: { resistance: 1 } },
      {
        label: { tr: 'Elimden bırakamıyorum', en: 'I cannot put it down' },
        weights: { resistance: 0 },
      },
    ],
  ),
  q(
    'fo-6',
    { tr: 'Aynı anda birden fazla iş yürütmek?', en: 'Running more than one task at once?' },
    [
      { label: { tr: 'İyi giderim', en: 'I do well with it' }, weights: { switching: 3 } },
      { label: { tr: 'İkiye kadar tamam', en: 'Up to two is fine' }, weights: { switching: 2 } },
      {
        label: { tr: 'Hata yapmaya başlarım', en: 'I start making mistakes' },
        weights: { switching: 1, sustained: 1 },
      },
      {
        label: { tr: 'Hiç yapamam', en: 'I cannot do it' },
        weights: { switching: 0, sustained: 2 },
      },
    ],
  ),
  q(
    'fo-7',
    {
      tr: 'Uzun bir işin ortasında enerjin ne oluyor?',
      en: 'Midway through a long task, what happens to your energy?',
    },
    [
      {
        label: { tr: 'Isındıkça artıyor', en: 'It rises as I warm up' },
        weights: { sustained: 3 },
      },
      {
        label: { tr: 'Sabit kalıyor', en: 'It stays level' },
        weights: { sustained: 2, recovery: 1 },
      },
      {
        label: { tr: 'Yavaş yavaş düşüyor', en: 'It slowly drops' },
        weights: { sustained: 1, recovery: 1 },
      },
      {
        label: { tr: 'Çabuk tükeniyor', en: 'It runs out fast' },
        weights: { sustained: 0, recovery: 2 },
      },
    ],
  ),
  q('fo-8', { tr: 'Bir bildirim geldiğinde?', en: 'When a notification arrives?' }, [
    { label: { tr: 'Sonra bakarım', en: 'I look later' }, weights: { resistance: 3, recovery: 1 } },
    {
      label: { tr: 'Bakar, hemen dönerim', en: 'I look and come straight back' },
      weights: { recovery: 3 },
    },
    {
      label: { tr: 'Bakarım, bir süre dağılırım', en: 'I look and drift for a while' },
      weights: { recovery: 1 },
    },
    {
      label: { tr: 'Bildirimleri kapatırım', en: 'I turn notifications off' },
      weights: { resistance: 3 },
    },
  ]),
];

export const focusProfileTest: ProfileTest = {
  id: 'focus-profile',
  title: { tr: 'Odaklanma Profili', en: 'Focus Profile' },
  description: {
    tr: 'Dikkatini nasıl kullandığını dört eksende gösteren kısa bir profil.',
    en: 'A short profile of how you use your attention, across four axes.',
  },
  caveat: {
    tr: 'Bu bir dikkat testi değil, kendi alışkanlıklarını nasıl anlattığının özeti. Bir tanı aracı değildir.',
    en: 'This is not an attention test — it is a summary of how you describe your own habits. It is not a diagnostic tool.',
  },
  estMinutes: [2, 3],
  isPro: true,
  traits: FOCUS_TRAITS,
  questions: FOCUS_QUESTIONS,
};

// ------------------------------------------------------- kişilik haritası

const PERSONA_TRAITS: readonly ProfileTrait[] = [
  {
    id: 'curiosity',
    label: { tr: 'Merak', en: 'Curiosity' },
    description: { tr: 'Yeni olana yaklaşma isteği.', en: 'The pull towards what is new.' },
  },
  {
    id: 'order',
    label: { tr: 'Düzen', en: 'Order' },
    description: {
      tr: 'Planlı ve derli toplu olma eğilimi.',
      en: 'A leaning towards plans and tidiness.',
    },
  },
  {
    id: 'energy',
    label: { tr: 'Enerji', en: 'Energy' },
    description: {
      tr: 'Kalabalıkta ve hareketlilikte canlanma.',
      en: 'Coming alive in company and motion.',
    },
  },
  {
    id: 'empathy',
    label: { tr: 'Empati', en: 'Empathy' },
    description: {
      tr: 'Başkasının yerine geçebilme kolaylığı.',
      en: 'How easily you step into someone else’s place.',
    },
  },
  {
    id: 'calm',
    label: { tr: 'Sakinlik', en: 'Calm' },
    description: { tr: 'Baskı altında dengeyi koruma.', en: 'Holding steady under pressure.' },
  },
];

const PERSONA_QUESTIONS: readonly ProfileQuestion[] = [
  q(
    'pe-1',
    {
      tr: 'Tanımadığın bir konu önüne geldiğinde?',
      en: 'A subject you know nothing about turns up?',
    },
    [
      {
        label: { tr: 'Hemen araştırırım', en: 'I look it up right away' },
        weights: { curiosity: 3 },
      },
      {
        label: { tr: 'İşime yarayacaksa bakarım', en: 'I look if it is useful to me' },
        weights: { curiosity: 1, order: 1 },
      },
      { label: { tr: 'Birine sorarım', en: 'I ask someone' }, weights: { energy: 2, empathy: 1 } },
      { label: { tr: 'Geçip giderim', en: 'I move on' }, weights: { calm: 1 } },
    ],
  ),
  q('pe-2', { tr: 'Haftanı nasıl planlarsın?', en: 'How do you plan your week?' }, [
    { label: { tr: 'Gün gün yazarım', en: 'I write it out day by day' }, weights: { order: 3 } },
    {
      label: { tr: 'Ana başlıkları belirlerim', en: 'I set the main headings' },
      weights: { order: 2 },
    },
    {
      label: { tr: 'Aklımda tutarım', en: 'I keep it in my head' },
      weights: { order: 1, curiosity: 1 },
    },
    { label: { tr: 'Planlamam', en: 'I do not plan' }, weights: { order: 0, energy: 1 } },
  ]),
  q('pe-3', { tr: 'Kalabalık bir akşam yemeğinden sonra?', en: 'After a crowded dinner?' }, [
    { label: { tr: 'Enerjim artmış olur', en: 'My energy is up' }, weights: { energy: 3 } },
    {
      label: { tr: 'Keyifli ama yorgunum', en: 'Happy but tired' },
      weights: { energy: 2, empathy: 1 },
    },
    {
      label: { tr: 'Biraz yalnız kalmam gerekir', en: 'I need some time alone' },
      weights: { energy: 1, calm: 1 },
    },
    {
      label: { tr: 'Zaten gitmemeye çalışırım', en: 'I try not to go in the first place' },
      weights: { energy: 0, calm: 2 },
    },
  ]),
  q(
    'pe-4',
    { tr: 'Bir arkadaşın üzgün. İlk ne yaparsın?', en: 'A friend is upset. What do you do first?' },
    [
      { label: { tr: 'Dinlerim', en: 'I listen' }, weights: { empathy: 3 } },
      { label: { tr: 'Çözüm öneririm', en: 'I suggest a fix' }, weights: { order: 2, empathy: 1 } },
      {
        label: {
          tr: 'Dikkatini dağıtacak bir şey yaparım',
          en: 'I do something to take their mind off it',
        },
        weights: { energy: 2, empathy: 1 },
      },
      { label: { tr: 'Alan açarım', en: 'I give them space' }, weights: { calm: 2, empathy: 1 } },
    ],
  ),
  q('pe-5', { tr: 'Beklenmedik bir aksilikte?', en: 'When something unexpected goes wrong?' }, [
    { label: { tr: 'Sakin kalırım', en: 'I stay calm' }, weights: { calm: 3 } },
    {
      label: { tr: 'Önce gerilir, sonra toparlarım', en: 'I tense up, then recover' },
      weights: { calm: 2 },
    },
    {
      label: { tr: 'Bir süre huzursuz olurum', en: 'I stay unsettled for a while' },
      weights: { calm: 1 },
    },
    {
      label: { tr: 'Uzun süre aklımdan çıkmaz', en: 'It stays with me for a long time' },
      weights: { calm: 0, empathy: 1 },
    },
  ]),
  q(
    'pe-6',
    { tr: 'Boş bir hafta sonu seni nasıl çeker?', en: 'What does an empty weekend look like?' },
    [
      {
        label: { tr: 'Yeni bir yer keşfetmek', en: 'Exploring somewhere new' },
        weights: { curiosity: 2, energy: 2 },
      },
      {
        label: { tr: 'Yarım kalan işleri bitirmek', en: 'Finishing what I left half done' },
        weights: { order: 3 },
      },
      { label: { tr: 'Arkadaşlarla buluşmak', en: 'Meeting friends' }, weights: { energy: 3 } },
      { label: { tr: 'Evde dinlenmek', en: 'Resting at home' }, weights: { calm: 3 } },
    ],
  ),
  q('pe-7', { tr: 'Bir fikrin eleştirildiğinde?', en: 'When an idea of yours is criticised?' }, [
    {
      label: { tr: 'Haklı yanını ararım', en: 'I look for the part that is right' },
      weights: { empathy: 2, calm: 2 },
    },
    { label: { tr: 'Savunurum', en: 'I defend it' }, weights: { energy: 2 } },
    {
      label: { tr: 'Üzerine düşünürüm', en: 'I go away and think' },
      weights: { curiosity: 2, calm: 1 },
    },
    { label: { tr: 'Canım sıkılır', en: 'It stings' }, weights: { empathy: 1 } },
  ]),
  q(
    'pe-8',
    { tr: 'Alıştığın bir yöntemi değiştirmek?', en: 'Changing a method you are used to?' },
    [
      { label: { tr: 'Denemeyi severim', en: 'I enjoy trying' }, weights: { curiosity: 3 } },
      {
        label: { tr: 'Gerekiyorsa yaparım', en: 'I do it if I have to' },
        weights: { order: 2, calm: 1 },
      },
      {
        label: { tr: 'Zorlanırım ama uyarım', en: 'I find it hard but adapt' },
        weights: { calm: 2 },
      },
      {
        label: { tr: 'Eskisinde kalmayı yeğlerim', en: 'I would rather keep the old one' },
        weights: { order: 3 },
      },
    ],
  ),
  q(
    'pe-9',
    { tr: 'Bir ekipte en çok hangi rolü üstlenirsin?', en: 'Which role do you take in a team?' },
    [
      { label: { tr: 'Fikir üreten', en: 'The one with ideas' }, weights: { curiosity: 3 } },
      { label: { tr: 'Düzeni kuran', en: 'The one who sets the order' }, weights: { order: 3 } },
      {
        label: { tr: 'Enerjiyi yükselten', en: 'The one who lifts the energy' },
        weights: { energy: 3 },
      },
      {
        label: { tr: 'Araları bulan', en: 'The one who smooths things over' },
        weights: { empathy: 3 },
      },
    ],
  ),
  q('pe-10', { tr: 'Yoğun bir günün sonunda?', en: 'At the end of a heavy day?' }, [
    { label: { tr: 'Hemen uyurum', en: 'I fall asleep at once' }, weights: { calm: 3 } },
    {
      label: { tr: 'Günü zihnimde tekrar ederim', en: 'I replay the day in my head' },
      weights: { empathy: 2, calm: 0 },
    },
    {
      label: { tr: 'Biriyle konuşmak isterim', en: 'I want to talk to someone' },
      weights: { energy: 2, empathy: 2 },
    },
    { label: { tr: 'Yarını planlarım', en: 'I plan tomorrow' }, weights: { order: 3 } },
  ]),
];

export const personaMapTest: ProfileTest = {
  id: 'persona-map',
  title: { tr: 'Kişilik Haritası', en: 'Personality Map' },
  description: {
    tr: 'On soruda beş eksen: merak, düzen, enerji, empati ve sakinlik.',
    en: 'Ten questions, five axes: curiosity, order, energy, empathy and calm.',
  },
  caveat: {
    tr: 'Bu bir kişilik envanteri değil ve bilimsel bir ölçeğe dayanmıyor. Kendi cevaplarının bir özeti; bir tanı ya da değerlendirme aracı olarak kullanılmamalı.',
    en: 'This is not a personality inventory and is not based on a scientific scale. It is a summary of your own answers and should not be used as a diagnostic or assessment tool.',
  },
  estMinutes: [3, 4],
  isPro: true,
  traits: PERSONA_TRAITS,
  questions: PERSONA_QUESTIONS,
};

export const PROFILE_TESTS: readonly ProfileTest[] = [
  archetypeTest,
  focusProfileTest,
  personaMapTest,
];

export function findProfileTest(id: string): ProfileTest | undefined {
  return PROFILE_TESTS.find((test) => test.id === id);
}
