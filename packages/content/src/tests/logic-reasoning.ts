import type { ContentQuestion, ContentTest } from '../types';

/**
 * Mantıksal Akıl Yürütme testi.
 *
 * İki tür: öncüllerden sonuca varma (çıkarım) ve verilen kuralı
 * uygulama (kodlama). Çıkarım sorularında bir şık bilerek "kesin bir
 * şey söylenemez" — öncüllerin yetmediğini görmek, yanlış sonuca
 * atlamamak kadar önemli bir beceri.
 */

const QUESTIONS: readonly ContentQuestion[] = [
  // ------------------------------------------------------------ çıkarım
  {
    id: 'lg-lo-1',
    kind: 'logic',
    prompt: {
      tr: 'Bütün kediler hayvandır. Pamuk bir kedidir. Buna göre kesin olan nedir?',
      en: 'All cats are animals. Pamuk is a cat. What follows?',
    },
    options: [
      { tr: 'Pamuk hayvandır', en: 'Pamuk is an animal' },
      { tr: 'Pamuk evcildir', en: 'Pamuk is a pet' },
      { tr: 'Bütün hayvanlar kedidir', en: 'All animals are cats' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.7,
  },
  {
    id: 'lg-lo-2',
    kind: 'logic',
    prompt: {
      tr: 'Hiçbir balık uçamaz. Lina uçabiliyor. Buna göre kesin olan nedir?',
      en: 'No fish can fly. Lina can fly. What follows?',
    },
    options: [
      { tr: 'Lina bir kuştur', en: 'Lina is a bird' },
      { tr: 'Lina balık değildir', en: 'Lina is not a fish' },
      { tr: 'Bazı balıklar uçar', en: 'Some fish fly' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 1,
    difficultyWeight: 1,
  },
  {
    id: 'lg-lo-3',
    kind: 'logic',
    prompt: {
      tr: 'Bazı öğrenciler sporcudur. Bütün sporcular sağlıklıdır. Buna göre kesin olan nedir?',
      en: 'Some students are athletes. All athletes are healthy. What follows?',
    },
    options: [
      { tr: 'Bütün öğrenciler sağlıklıdır', en: 'All students are healthy' },
      { tr: 'Bazı öğrenciler sağlıklıdır', en: 'Some students are healthy' },
      { tr: 'Hiçbir öğrenci sağlıklı değildir', en: 'No student is healthy' },
      { tr: 'Bütün sağlıklılar öğrencidir', en: 'All healthy people are students' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.3,
  },
  {
    id: 'lg-lo-4',
    kind: 'logic',
    prompt: {
      tr: 'A, B’den uzundur. B, C’den uzundur. En kısa olan kimdir?',
      en: 'A is taller than B. B is taller than C. Who is shortest?',
    },
    options: [
      { tr: 'A', en: 'A' },
      { tr: 'B', en: 'B' },
      { tr: 'C', en: 'C' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
  },
  {
    id: 'lg-lo-5',
    kind: 'logic',
    prompt: {
      tr: 'Yağmur yağarsa maç iptal olur. Maç iptal olmadı. Buna göre kesin olan nedir?',
      en: 'If it rains the match is cancelled. The match was not cancelled. What follows?',
    },
    options: [
      { tr: 'Yağmur yağdı', en: 'It rained' },
      { tr: 'Yağmur yağmadı', en: 'It did not rain' },
      { tr: 'Maç ertelendi', en: 'The match was postponed' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.4,
  },
  {
    id: 'lg-lo-6',
    kind: 'logic',
    prompt: {
      tr: 'Kapı kilitliyse Ece evde değildir. Ece evde. Buna göre kesin olan nedir?',
      en: 'If the door is locked, Ece is not home. Ece is home. What follows?',
    },
    options: [
      { tr: 'Kapı kilitli', en: 'The door is locked' },
      { tr: 'Kapı kilitli değil', en: 'The door is not locked' },
      { tr: 'Ece kapıyı kilitledi', en: 'Ece locked the door' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.4,
  },
  {
    id: 'lg-lo-7',
    kind: 'logic',
    prompt: {
      tr: 'Bütün güller çiçektir. Bazı çiçekler kokuludur. Buna göre kesin olan nedir?',
      en: 'All roses are flowers. Some flowers are fragrant. What follows?',
    },
    options: [
      { tr: 'Bütün güller kokuludur', en: 'All roses are fragrant' },
      { tr: 'Bazı güller kokuludur', en: 'Some roses are fragrant' },
      { tr: 'Hiçbir gül kokulu değildir', en: 'No rose is fragrant' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 3,
    difficultyWeight: 1.8,
  },
  {
    id: 'lg-lo-8',
    kind: 'logic',
    prompt: {
      tr: 'Ali Ayşe’den büyük, Ayşe Can’dan büyük, Can Deniz’den büyük. En küçük kim?',
      en: 'Ali is older than Ayşe, Ayşe than Can, Can than Deniz. Who is youngest?',
    },
    options: [
      { tr: 'Ali', en: 'Ali' },
      { tr: 'Ayşe', en: 'Ayşe' },
      { tr: 'Can', en: 'Can' },
      { tr: 'Deniz', en: 'Deniz' },
    ],
    correctIndex: 3,
    difficultyWeight: 0.9,
  },
  {
    id: 'lg-lo-9',
    kind: 'logic',
    prompt: {
      tr: 'Dört kişi sırada. Ece en önde, Mert en arkada, Can Deniz’in önünde. Üçüncü kim?',
      en: 'Four in a line. Ece first, Mert last, Can ahead of Deniz. Who is third?',
    },
    options: [
      { tr: 'Ece', en: 'Ece' },
      { tr: 'Can', en: 'Can' },
      { tr: 'Deniz', en: 'Deniz' },
      { tr: 'Mert', en: 'Mert' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.5,
  },
  {
    id: 'lg-lo-10',
    kind: 'logic',
    prompt: {
      tr: 'Her A bir B’dir. Hiçbir B C değildir. Buna göre kesin olan nedir?',
      en: 'Every A is a B. No B is a C. What follows?',
    },
    options: [
      { tr: 'Hiçbir A C değildir', en: 'No A is a C' },
      { tr: 'Bazı A’lar C’dir', en: 'Some A are C' },
      { tr: 'Her C bir B’dir', en: 'Every C is a B' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 0,
    difficultyWeight: 1.6,
  },
  {
    id: 'lg-lo-11',
    kind: 'logic',
    prompt: {
      tr: 'Bir kutuda 3 kırmızı, 2 mavi top var. Gözü kapalı en az kaç top çekilirse iki aynı renk kesin gelir?',
      en: 'A box has 3 red and 2 blue balls. How many must be drawn blind to be sure of two of a colour?',
    },
    options: [
      { tr: '2', en: '2' },
      { tr: '3', en: '3' },
      { tr: '4', en: '4' },
      { tr: '5', en: '5' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.7,
  },
  {
    id: 'lg-lo-12',
    kind: 'logic',
    prompt: {
      tr: 'Bugün salı ise, 100 gün sonra hangi gün olur?',
      en: 'If today is Tuesday, what day is it in 100 days?',
    },
    options: [
      { tr: 'Pazartesi', en: 'Monday' },
      { tr: 'Salı', en: 'Tuesday' },
      { tr: 'Çarşamba', en: 'Wednesday' },
      { tr: 'Perşembe', en: 'Thursday' },
    ],
    correctIndex: 3,
    difficultyWeight: 1.8,
    explanation: { tr: '100 = 14×7 + 2; salıdan iki gün sonra perşembe.', en: '100 = 14×7 + 2.' },
  },
  {
    id: 'lg-lo-13',
    kind: 'logic',
    prompt: {
      tr: 'Üç kutudan yalnızca birinde ödül var. Birinci kutuda "ödül burada değil", ikincide "ödül burada" yazıyor ve yalnızca bir yazı doğru. Ödül nerede?',
      en: 'Only one of three boxes holds a prize. Box 1 says "not here", box 2 says "here", and exactly one label is true. Where is it?',
    },
    options: [
      { tr: 'Birinci kutuda', en: 'Box 1' },
      { tr: 'İkinci kutuda', en: 'Box 2' },
      { tr: 'Üçüncü kutuda', en: 'Box 3' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 2,
    difficultyWeight: 2,
    explanation: {
      tr: 'Birinci kutuda olsa iki yazı da yanlış olur; ikinci kutuda olsa iki yazı da doğru olur. Yalnızca üçüncü kutuda olduğunda ilk yazı doğru, ikinci yanlış — tam olarak bir doğru yazı.',
      en: 'In box 1 both labels would be false; in box 2 both true. Only box 3 leaves exactly one true label.',
    },
  },
  {
    id: 'lg-lo-14',
    kind: 'logic',
    prompt: {
      tr: 'Bir saat her gün 3 dakika geri kalıyor. 5 gün sonra kaç dakika geride olur?',
      en: 'A clock loses 3 minutes a day. How far behind is it after 5 days?',
    },
    options: [
      { tr: '8', en: '8' },
      { tr: '12', en: '12' },
      { tr: '15', en: '15' },
      { tr: '18', en: '18' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.8,
  },
  {
    id: 'lg-lo-15',
    kind: 'logic',
    prompt: {
      tr: 'Bir takımda herkes ya futbol ya basketbol oynuyor, ikisini birden oynayan yok. 12 kişinin 7’si futbol oynuyorsa kaçı basketbol oynar?',
      en: 'Everyone plays either football or basketball, not both. Of 12 people, 7 play football. How many play basketball?',
    },
    options: [
      { tr: '4', en: '4' },
      { tr: '5', en: '5' },
      { tr: '6', en: '6' },
      { tr: '7', en: '7' },
    ],
    correctIndex: 1,
    difficultyWeight: 0.7,
  },
  {
    id: 'lg-lo-16',
    kind: 'logic',
    prompt: {
      tr: 'Bir yarışta Ece, Can’ı geçti ve üçüncü oldu. Can kaçıncı oldu?',
      en: 'In a race Ece overtook Can and finished third. Where did Can finish?',
    },
    options: [
      { tr: 'İkinci', en: 'Second' },
      { tr: 'Üçüncü', en: 'Third' },
      { tr: 'Dördüncü', en: 'Fourth' },
      { tr: 'Beşinci', en: 'Fifth' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.3,
  },
  {
    id: 'lg-lo-17',
    kind: 'logic',
    prompt: {
      tr: 'Bütün kitaplar sayfadan oluşur. Elimdeki nesne sayfadan oluşmuyor. Buna göre kesin olan nedir?',
      en: 'All books are made of pages. This object has no pages. What follows?',
    },
    options: [
      { tr: 'Nesne bir kitaptır', en: 'It is a book' },
      { tr: 'Nesne kitap değildir', en: 'It is not a book' },
      { tr: 'Nesne bir defterdir', en: 'It is a notebook' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 1,
    difficultyWeight: 1,
  },
  {
    id: 'lg-lo-18',
    kind: 'logic',
    prompt: {
      tr: 'Bir sepette 5 elma var ve 5 kişiye birer elma dağıtılıyor. Sepette bir elma kalacak şekilde bu nasıl olur?',
      en: 'Five apples in a basket are given to five people, yet one apple stays in the basket. How?',
    },
    options: [
      { tr: 'Biri elmasını geri verir', en: 'Someone returns their apple' },
      { tr: 'Sonuncuya sepetiyle verilir', en: 'The last one gets it with the basket' },
      { tr: 'Bir elma ikiye bölünür', en: 'An apple is halved' },
      { tr: 'Bu mümkün değildir', en: 'It is impossible' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.6,
  },
  {
    id: 'lg-lo-19',
    kind: 'logic',
    prompt: {
      tr: 'Bazı A’lar B’dir. Bütün B’ler C’dir. Buna göre kesin olan nedir?',
      en: 'Some A are B. All B are C. What follows?',
    },
    options: [
      { tr: 'Bütün A’lar C’dir', en: 'All A are C' },
      { tr: 'Bazı A’lar C’dir', en: 'Some A are C' },
      { tr: 'Hiçbir A C değildir', en: 'No A is C' },
      { tr: 'Bütün C’ler A’dır', en: 'All C are A' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.5,
  },
  {
    id: 'lg-lo-20',
    kind: 'logic',
    prompt: {
      tr: 'Bir iple bir dikdörtgen çevreliyorsun. İpin boyu 20 m ve kısa kenar 4 m ise uzun kenar kaç metredir?',
      en: 'A rope of 20 m encloses a rectangle with a short side of 4 m. How long is the long side?',
    },
    options: [
      { tr: '4', en: '4' },
      { tr: '5', en: '5' },
      { tr: '6', en: '6' },
      { tr: '8', en: '8' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.4,
    explanation: { tr: '2×(4 + x) = 20 → x = 6.', en: '2×(4 + x) = 20 → x = 6.' },
  },

  // ------------------------------------------------------------ kodlama
  {
    id: 'lg-co-1',
    kind: 'coding',
    prompt: {
      tr: 'Bir makine girilen sayıyı 3 ile çarpıp 2 çıkarıyor. 7 girilirse ne çıkar?',
      en: 'A machine multiplies the input by 3 and subtracts 2. Input 7 gives?',
    },
    options: [
      { tr: '15', en: '15' },
      { tr: '18', en: '18' },
      { tr: '19', en: '19' },
      { tr: '23', en: '23' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
  },
  {
    id: 'lg-co-2',
    kind: 'coding',
    prompt: {
      tr: 'Aynı makineye (×3, sonra −2) hangi sayı girilirse 25 çıkar?',
      en: 'For the same machine (×3 then −2), which input gives 25?',
    },
    options: [
      { tr: '7', en: '7' },
      { tr: '8', en: '8' },
      { tr: '9', en: '9' },
      { tr: '10', en: '10' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.1,
  },
  {
    id: 'lg-co-3',
    kind: 'coding',
    prompt: {
      tr: 'Bir kurala göre 2 → 5, 3 → 10, 4 → 17. Buna göre 5 → ?',
      en: 'A rule gives 2 → 5, 3 → 10, 4 → 17. What does 5 give?',
    },
    options: [
      { tr: '24', en: '24' },
      { tr: '25', en: '25' },
      { tr: '26', en: '26' },
      { tr: '30', en: '30' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.5,
    explanation: { tr: 'Kural: n² + 1.', en: 'Rule: n² + 1.' },
  },
  {
    id: 'lg-co-4',
    kind: 'coding',
    prompt: {
      tr: 'Bir kurala göre 1 → 2, 2 → 6, 3 → 12, 4 → 20. Buna göre 5 → ?',
      en: 'A rule gives 1 → 2, 2 → 6, 3 → 12, 4 → 20. What does 5 give?',
    },
    options: [
      { tr: '24', en: '24' },
      { tr: '28', en: '28' },
      { tr: '30', en: '30' },
      { tr: '32', en: '32' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.6,
    explanation: { tr: 'Kural: n² + n.', en: 'Rule: n² + n.' },
  },
  {
    id: 'lg-co-5',
    kind: 'coding',
    prompt: {
      tr: 'Bir şifrede her harfin yerine alfabedeki bir sonraki harf yazılıyor. "ABC" nasıl yazılır?',
      en: 'In a cipher each letter is replaced by the next one in the Turkish alphabet. How is "ABC" written?',
    },
    options: [
      { tr: 'BCD', en: 'BCD' },
      { tr: 'BCÇ', en: 'BCÇ' },
      { tr: 'CÇD', en: 'CÇD' },
      { tr: 'BÇD', en: 'BÇD' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.4,
    explanation: { tr: 'Türk alfabesinde C’den sonra Ç gelir.', en: 'In Turkish, Ç follows C.' },
  },
  {
    id: 'lg-co-6',
    kind: 'coding',
    prompt: {
      tr: 'Bir makine girilen sayıyı ikiye katlayıp 1 ekliyor, sonra sonucu tekrar makineye veriyoruz. 2 ile başlarsak ikinci çıktı nedir?',
      en: 'A machine doubles and adds 1, and its output is fed back in. Starting from 2, what is the second output?',
    },
    options: [
      { tr: '5', en: '5' },
      { tr: '9', en: '9' },
      { tr: '11', en: '11' },
      { tr: '12', en: '12' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.5,
    explanation: { tr: '2 → 5 → 11.', en: '2 → 5 → 11.' },
  },
  {
    id: 'lg-co-7',
    kind: 'coding',
    prompt: {
      tr: 'Bir kodda her sayı kendi rakamlarının toplamıyla değiştiriliyor. 487 nasıl kodlanır?',
      en: 'In a code each number is replaced by the sum of its digits. How is 487 coded?',
    },
    options: [
      { tr: '17', en: '17' },
      { tr: '18', en: '18' },
      { tr: '19', en: '19' },
      { tr: '20', en: '20' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.8,
  },
  {
    id: 'lg-co-8',
    kind: 'coding',
    prompt: {
      tr: 'Bir kurala göre 10 → 3, 20 → 5, 30 → 7. Buna göre 50 → ?',
      en: 'A rule gives 10 → 3, 20 → 5, 30 → 7. What does 50 give?',
    },
    options: [
      { tr: '9', en: '9' },
      { tr: '10', en: '10' },
      { tr: '11', en: '11' },
      { tr: '13', en: '13' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.4,
    explanation: { tr: 'Kural: n/10 × 2 + 1.', en: 'Rule: n/10 × 2 + 1.' },
  },
  {
    id: 'lg-co-9',
    kind: 'coding',
    prompt: {
      tr: 'İki makine var: A sayıyı 2 ile çarpar, B sayıya 3 ekler. 4 sayısına önce A sonra B uygulanırsa ne çıkar?',
      en: 'Machine A doubles, machine B adds 3. Applying A then B to 4 gives?',
    },
    options: [
      { tr: '11', en: '11' },
      { tr: '14', en: '14' },
      { tr: '18', en: '18' },
      { tr: '21', en: '21' },
    ],
    correctIndex: 0,
    difficultyWeight: 1,
  },
  {
    id: 'lg-co-10',
    kind: 'coding',
    prompt: {
      tr: 'Aynı iki makineyle (A: ×2, B: +3) 4 sayısına önce B sonra A uygulanırsa ne çıkar?',
      en: 'With the same machines (A: ×2, B: +3), applying B then A to 4 gives?',
    },
    options: [
      { tr: '11', en: '11' },
      { tr: '14', en: '14' },
      { tr: '18', en: '18' },
      { tr: '20', en: '20' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.1,
  },
  {
    id: 'lg-co-11',
    kind: 'coding',
    prompt: {
      tr: 'Bir kodda her harf alfabedeki sırasıyla yazılıyor (A=1, B=2, C=3, Ç=4, D=5). "DCA" nasıl kodlanır?',
      en: 'Letters are coded by position (A=1, B=2, C=3, Ç=4, D=5). How is "DCA" coded?',
    },
    options: [
      { tr: '5-3-1', en: '5-3-1' },
      { tr: '4-3-1', en: '4-3-1' },
      { tr: '5-4-1', en: '5-4-1' },
      { tr: '1-3-5', en: '1-3-5' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.9,
  },
  {
    id: 'lg-co-12',
    kind: 'coding',
    prompt: {
      tr: 'Bir kurala göre 3 → 11, 5 → 27, 7 → 51. Buna göre 9 → ?',
      en: 'A rule gives 3 → 11, 5 → 27, 7 → 51. What does 9 give?',
    },
    options: [
      { tr: '71', en: '71' },
      { tr: '79', en: '79' },
      { tr: '83', en: '83' },
      { tr: '91', en: '91' },
    ],
    correctIndex: 2,
    difficultyWeight: 2,
    explanation: { tr: 'Kural: n² + 2.', en: 'Rule: n² + 2.' },
  },
];

export const logicReasoningTest: ContentTest = {
  id: 'logic-reasoning',
  kind: 'iq',
  title: { tr: 'Mantıksal Akıl Yürütme', en: 'Logical Reasoning' },
  description: {
    tr: 'Öncüllerden sonuca varma ve verilen kuralı uygulama üzerine bir değerlendirme.',
    en: 'An assessment of deduction and rule application.',
  },
  questionCount: 25,
  estMinutes: [8, 12],
  isPro: true,
  focus: 'logical',
  norm: { mean: 0.55, sd: 0.18 },
  questions: QUESTIONS,
};
