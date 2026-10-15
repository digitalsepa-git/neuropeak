import type { ContentTest } from '../types';

/**
 * Temel IQ Testi — uygulamanın giriş testi.
 *
 * 30 soruluk havuzdan her oturumda 20 soru sorulur, böylece test
 * tekrarlandığında aynı sorular gelmez. Soru türleri dört rapor boyutuna
 * dağıtıldı: sözel, sayısal, görsel ve mantıksal. Görsel sorular şekil
 * gerektirdiği için bu havuzda yok; Görsel IQ Testi'yle birlikte gelecek.
 */
export const basicIqTest: ContentTest = {
  id: 'basic-iq',
  kind: 'iq',
  title: { tr: 'Temel IQ Testi', en: 'Basic IQ Test' },
  description: {
    tr: 'Sayı örüntüleri, sözel ilişkiler, mantık ve aritmetikten oluşan genel bir değerlendirme.',
    en: 'A general assessment of number patterns, verbal relations, logic and arithmetic.',
  },
  questionCount: 20,
  estMinutes: [8, 12],
  isPro: false,
  norm: { mean: 0.55, sd: 0.18 },
  questions: [
    // ---------------------------------------------------------- sayı dizileri
    {
      id: 'bi-ns-1',
      kind: 'number_series',
      prompt: { tr: '2, 4, 8, 16, ?', en: '2, 4, 8, 16, ?' },
      options: [
        { tr: '24', en: '24' },
        { tr: '30', en: '30' },
        { tr: '32', en: '32' },
        { tr: '36', en: '36' },
      ],
      correctIndex: 2,
      difficultyWeight: 0.8,
      explanation: {
        tr: 'Her sayı bir öncekinin iki katı.',
        en: 'Each number doubles the previous one.',
      },
    },
    {
      id: 'bi-ns-2',
      kind: 'number_series',
      prompt: { tr: '3, 7, 11, 15, ?', en: '3, 7, 11, 15, ?' },
      options: [
        { tr: '17', en: '17' },
        { tr: '18', en: '18' },
        { tr: '19', en: '19' },
        { tr: '21', en: '21' },
      ],
      correctIndex: 2,
      difficultyWeight: 0.8,
      explanation: { tr: 'Her adımda 4 ekleniyor.', en: 'Each step adds 4.' },
    },
    {
      id: 'bi-ns-3',
      kind: 'number_series',
      prompt: { tr: '1, 4, 9, 16, ?', en: '1, 4, 9, 16, ?' },
      options: [
        { tr: '20', en: '20' },
        { tr: '24', en: '24' },
        { tr: '25', en: '25' },
        { tr: '36', en: '36' },
      ],
      correctIndex: 2,
      difficultyWeight: 1,
      explanation: {
        tr: 'Sayılar sırasıyla tam kareler: 1², 2², 3², 4², 5².',
        en: 'The numbers are successive squares: 1², 2², 3², 4², 5².',
      },
    },
    {
      id: 'bi-ns-4',
      kind: 'number_series',
      prompt: { tr: '2, 3, 5, 8, 13, ?', en: '2, 3, 5, 8, 13, ?' },
      options: [
        { tr: '18', en: '18' },
        { tr: '20', en: '20' },
        { tr: '21', en: '21' },
        { tr: '26', en: '26' },
      ],
      correctIndex: 2,
      difficultyWeight: 1.3,
      explanation: {
        tr: 'Her sayı kendinden önceki iki sayının toplamı: 8 + 13 = 21.',
        en: 'Each number is the sum of the two before it: 8 + 13 = 21.',
      },
    },
    {
      id: 'bi-ns-5',
      kind: 'number_series',
      prompt: { tr: '1, 2, 6, 24, ?', en: '1, 2, 6, 24, ?' },
      options: [
        { tr: '48', en: '48' },
        { tr: '96', en: '96' },
        { tr: '120', en: '120' },
        { tr: '144', en: '144' },
      ],
      correctIndex: 2,
      difficultyWeight: 1.6,
      explanation: {
        tr: 'Çarpanlar sırayla artıyor: ×2, ×3, ×4, ×5.',
        en: 'The multiplier grows each step: ×2, ×3, ×4, ×5.',
      },
    },
    {
      id: 'bi-ns-6',
      kind: 'number_series',
      prompt: { tr: '81, 27, 9, 3, ?', en: '81, 27, 9, 3, ?' },
      options: [
        { tr: '0', en: '0' },
        { tr: '1', en: '1' },
        { tr: '2', en: '2' },
        { tr: '3', en: '3' },
      ],
      correctIndex: 1,
      difficultyWeight: 1,
      explanation: { tr: 'Her sayı üçe bölünüyor.', en: 'Each number is divided by three.' },
    },
    {
      id: 'bi-ns-7',
      kind: 'number_series',
      prompt: { tr: '2, 5, 11, 23, ?', en: '2, 5, 11, 23, ?' },
      options: [
        { tr: '35', en: '35' },
        { tr: '44', en: '44' },
        { tr: '46', en: '46' },
        { tr: '47', en: '47' },
      ],
      correctIndex: 3,
      difficultyWeight: 1.8,
      explanation: {
        tr: 'Her adımda sayı ikiyle çarpılıp bir ekleniyor: 23 × 2 + 1 = 47.',
        en: 'Each step doubles the number and adds one: 23 × 2 + 1 = 47.',
      },
    },

    // ---------------------------------------------------------- sözel ilişki
    {
      id: 'bi-va-1',
      kind: 'verbal_analogy',
      prompt: { tr: 'Çatal : Yemek  ≡  Kalem : ?', en: 'Fork : Eat  ≡  Pen : ?' },
      options: [
        { tr: 'Silmek', en: 'Erase' },
        { tr: 'Yazmak', en: 'Write' },
        { tr: 'Kesmek', en: 'Cut' },
        { tr: 'Katlamak', en: 'Fold' },
      ],
      correctIndex: 1,
      difficultyWeight: 0.8,
      explanation: {
        tr: 'Her ikisi de araç ile o araçla yapılan iş ilişkisi.',
        en: 'Both pair a tool with the action it performs.',
      },
    },
    {
      id: 'bi-va-2',
      kind: 'verbal_analogy',
      prompt: { tr: 'Kuş : Yuva  ≡  Arı : ?', en: 'Bird : Nest  ≡  Bee : ?' },
      options: [
        { tr: 'Çiçek', en: 'Flower' },
        { tr: 'Bal', en: 'Honey' },
        { tr: 'Kovan', en: 'Hive' },
        { tr: 'Kanat', en: 'Wing' },
      ],
      correctIndex: 2,
      difficultyWeight: 0.8,
      explanation: {
        tr: 'İkisi de canlı ile yaşadığı yer ilişkisi.',
        en: 'Both pair an animal with where it lives.',
      },
    },
    {
      id: 'bi-va-3',
      kind: 'verbal_analogy',
      prompt: { tr: 'Sıcak : Soğuk  ≡  Aydınlık : ?', en: 'Hot : Cold  ≡  Light : ?' },
      options: [
        { tr: 'Gölge', en: 'Shadow' },
        { tr: 'Karanlık', en: 'Dark' },
        { tr: 'Lamba', en: 'Lamp' },
        { tr: 'Renk', en: 'Colour' },
      ],
      correctIndex: 1,
      difficultyWeight: 0.7,
      explanation: { tr: 'İkisi de karşıt kavram çifti.', en: 'Both are pairs of opposites.' },
    },
    {
      id: 'bi-va-4',
      kind: 'verbal_analogy',
      prompt: { tr: 'Pilot : Uçak  ≡  Kaptan : ?', en: 'Pilot : Plane  ≡  Captain : ?' },
      options: [
        { tr: 'Liman', en: 'Harbour' },
        { tr: 'Gemi', en: 'Ship' },
        { tr: 'Deniz', en: 'Sea' },
        { tr: 'Çapa', en: 'Anchor' },
      ],
      correctIndex: 1,
      difficultyWeight: 0.9,
      explanation: {
        tr: 'İkisi de kullanan kişi ile kullandığı araç ilişkisi.',
        en: 'Both pair an operator with the vehicle they command.',
      },
    },
    {
      id: 'bi-va-5',
      kind: 'verbal_analogy',
      prompt: { tr: 'Ayak : Ayakkabı  ≡  El : ?', en: 'Foot : Shoe  ≡  Hand : ?' },
      options: [
        { tr: 'Yüzük', en: 'Ring' },
        { tr: 'Eldiven', en: 'Glove' },
        { tr: 'Kol', en: 'Arm' },
        { tr: 'Parmak', en: 'Finger' },
      ],
      correctIndex: 1,
      difficultyWeight: 0.8,
      explanation: {
        tr: 'İkisi de uzuv ile onu saran giysi ilişkisi.',
        en: 'Both pair a body part with the garment that covers it.',
      },
    },
    {
      id: 'bi-va-6',
      kind: 'verbal_analogy',
      prompt: { tr: 'Susuzluk : Su  ≡  Yorgunluk : ?', en: 'Thirst : Water  ≡  Fatigue : ?' },
      options: [
        { tr: 'Yemek', en: 'Food' },
        { tr: 'Uyku', en: 'Sleep' },
        { tr: 'Spor', en: 'Exercise' },
        { tr: 'Hava', en: 'Air' },
      ],
      correctIndex: 1,
      difficultyWeight: 1.2,
      explanation: {
        tr: 'İkisi de ihtiyaç ile onu gideren şey ilişkisi.',
        en: 'Both pair a need with what satisfies it.',
      },
    },

    // ---------------------------------------------------------- mantık
    {
      id: 'bi-lg-1',
      kind: 'logic',
      prompt: {
        tr: 'Bütün güller çiçektir. Bazı çiçekler solar. Buna göre kesin olarak ne söylenebilir?',
        en: 'All roses are flowers. Some flowers wilt. What follows with certainty?',
      },
      options: [
        { tr: 'Bütün güller solar', en: 'All roses wilt' },
        { tr: 'Bazı güller solar', en: 'Some roses wilt' },
        { tr: 'Hiçbir gül solmaz', en: 'No rose wilts' },
        {
          tr: 'Güller hakkında kesin bir şey söylenemez',
          en: 'Nothing certain follows about roses',
        },
      ],
      correctIndex: 3,
      difficultyWeight: 1.5,
      explanation: {
        tr: 'Solan çiçeklerin güller olduğu bilinmiyor; öncüller gülleri bağlamıyor.',
        en: 'The wilting flowers need not be roses, so the premises say nothing certain about roses.',
      },
    },
    {
      id: 'bi-lg-2',
      kind: 'logic',
      prompt: {
        tr: "A, B'den uzun. C, A'dan uzun. En kısa olan kimdir?",
        en: 'A is taller than B. C is taller than A. Who is shortest?',
      },
      options: [
        { tr: 'A', en: 'A' },
        { tr: 'B', en: 'B' },
        { tr: 'C', en: 'C' },
        { tr: 'Belirlenemez', en: 'Cannot be determined' },
      ],
      correctIndex: 1,
      difficultyWeight: 1,
      explanation: {
        tr: 'Sıralama C > A > B olduğundan en kısa B.',
        en: 'The order is C > A > B, so B is shortest.',
      },
    },
    {
      id: 'bi-lg-3',
      kind: 'logic',
      prompt: {
        tr: 'Bugün salı ise 100 gün sonra hangi gündür?',
        en: 'If today is Tuesday, what day is it 100 days later?',
      },
      options: [
        { tr: 'Çarşamba', en: 'Wednesday' },
        { tr: 'Perşembe', en: 'Thursday' },
        { tr: 'Cuma', en: 'Friday' },
        { tr: 'Cumartesi', en: 'Saturday' },
      ],
      correctIndex: 1,
      difficultyWeight: 1.6,
      explanation: {
        tr: '100 = 14 × 7 + 2, yani salıdan iki gün sonrası: perşembe.',
        en: '100 = 14 × 7 + 2, so two days after Tuesday: Thursday.',
      },
    },
    {
      id: 'bi-lg-4',
      kind: 'logic',
      prompt: {
        tr: 'Bir kutuda 3 kırmızı ve 2 mavi top var. Gözü kapalı en az kaç top çekilirse aynı renkten iki top kesin olur?',
        en: 'A box holds 3 red and 2 blue balls. What is the fewest blind draws that guarantee two of the same colour?',
      },
      options: [
        { tr: '2', en: '2' },
        { tr: '3', en: '3' },
        { tr: '4', en: '4' },
        { tr: '5', en: '5' },
      ],
      correctIndex: 1,
      difficultyWeight: 1.3,
      explanation: {
        tr: 'İlk iki top farklı renk olsa bile üçüncü top mutlaka bir çifti tamamlar.',
        en: 'Even if the first two differ, the third must complete a pair.',
      },
    },
    {
      id: 'bi-lg-5',
      kind: 'logic',
      prompt: {
        tr: 'Hiçbir kedi köpek değildir. Bazı evcil hayvanlar kedidir. Buna göre kesin olarak ne söylenebilir?',
        en: 'No cat is a dog. Some pets are cats. What follows with certainty?',
      },
      options: [
        { tr: 'Bütün evcil hayvanlar kedidir', en: 'All pets are cats' },
        { tr: 'Bazı evcil hayvanlar köpek değildir', en: 'Some pets are not dogs' },
        { tr: 'Hiçbir evcil hayvan köpek değildir', en: 'No pet is a dog' },
        { tr: 'Bütün köpekler evcildir', en: 'All dogs are pets' },
      ],
      correctIndex: 1,
      difficultyWeight: 1.7,
      explanation: {
        tr: 'Kedi olan evcil hayvanlar köpek olamaz; bu da "bazı evcil hayvanlar köpek değildir" sonucunu verir.',
        en: 'The pets that are cats cannot be dogs, which yields "some pets are not dogs".',
      },
    },
    {
      id: 'bi-lg-6',
      kind: 'logic',
      prompt: {
        tr: '5 makine 5 dakikada 5 parça üretiyorsa, 100 makine 100 parçayı kaç dakikada üretir?',
        en: 'If 5 machines make 5 parts in 5 minutes, how long do 100 machines take to make 100 parts?',
      },
      options: [
        { tr: '5 dakika', en: '5 minutes' },
        { tr: '20 dakika', en: '20 minutes' },
        { tr: '100 dakika', en: '100 minutes' },
        { tr: '500 dakika', en: '500 minutes' },
      ],
      correctIndex: 0,
      difficultyWeight: 1.8,
      explanation: {
        tr: 'Bir makine bir parçayı 5 dakikada üretir; makine sayısı arttıkça süre değişmez.',
        en: 'One machine makes one part in 5 minutes, so adding machines does not change the time.',
      },
    },

    // ---------------------------------------------------------- farklı olan
    {
      id: 'bi-oo-1',
      kind: 'odd_one_out',
      prompt: { tr: 'Hangisi diğerlerinden farklıdır?', en: 'Which one does not belong?' },
      options: [
        { tr: 'Elma', en: 'Apple' },
        { tr: 'Armut', en: 'Pear' },
        { tr: 'Havuç', en: 'Carrot' },
        { tr: 'Muz', en: 'Banana' },
      ],
      correctIndex: 2,
      difficultyWeight: 0.7,
      explanation: {
        tr: 'Diğerleri meyve, havuç sebzedir.',
        en: 'The others are fruit; the carrot is a vegetable.',
      },
    },
    {
      id: 'bi-oo-2',
      kind: 'odd_one_out',
      prompt: { tr: 'Hangisi diğerlerinden farklıdır?', en: 'Which one does not belong?' },
      options: [
        { tr: 'Kare', en: 'Square' },
        { tr: 'Üçgen', en: 'Triangle' },
        { tr: 'Daire', en: 'Circle' },
        { tr: 'Küp', en: 'Cube' },
      ],
      correctIndex: 3,
      difficultyWeight: 1,
      explanation: {
        tr: 'Diğerleri düzlemsel, küp üç boyutludur.',
        en: 'The others are plane shapes; the cube is three-dimensional.',
      },
    },
    {
      id: 'bi-oo-3',
      kind: 'odd_one_out',
      prompt: { tr: 'Hangisi diğerlerinden farklıdır?', en: 'Which one does not belong?' },
      options: [
        { tr: '3', en: '3' },
        { tr: '5', en: '5' },
        { tr: '9', en: '9' },
        { tr: '11', en: '11' },
      ],
      correctIndex: 2,
      difficultyWeight: 1.2,
      explanation: {
        tr: 'Diğerleri asal sayı, 9 değildir.',
        en: 'The others are prime; 9 is not.',
      },
    },
    {
      id: 'bi-oo-4',
      kind: 'odd_one_out',
      prompt: { tr: 'Hangisi diğerlerinden farklıdır?', en: 'Which one does not belong?' },
      options: [
        { tr: 'Keman', en: 'Violin' },
        { tr: 'Gitar', en: 'Guitar' },
        { tr: 'Flüt', en: 'Flute' },
        { tr: 'Viyolonsel', en: 'Cello' },
      ],
      correctIndex: 2,
      difficultyWeight: 1.1,
      explanation: {
        tr: 'Diğerleri telli çalgı, flüt üflemelidir.',
        en: 'The others are string instruments; the flute is a wind instrument.',
      },
    },
    {
      id: 'bi-oo-5',
      kind: 'odd_one_out',
      prompt: { tr: 'Hangisi diğerlerinden farklıdır?', en: 'Which one does not belong?' },
      options: [
        { tr: 'Mavi', en: 'Blue' },
        { tr: 'Yeşil', en: 'Green' },
        { tr: 'Kırmızı', en: 'Red' },
        { tr: 'Renk', en: 'Colour' },
      ],
      correctIndex: 3,
      difficultyWeight: 0.9,
      explanation: {
        tr: 'Diğerleri birer renk, "renk" ise üst kavramdır.',
        en: 'The others are colours; "colour" is the category itself.',
      },
    },
    {
      id: 'bi-oo-6',
      kind: 'odd_one_out',
      prompt: { tr: 'Hangisi diğerlerinden farklıdır?', en: 'Which one does not belong?' },
      options: [
        { tr: '16', en: '16' },
        { tr: '25', en: '25' },
        { tr: '36', en: '36' },
        { tr: '48', en: '48' },
      ],
      correctIndex: 3,
      difficultyWeight: 1.3,
      explanation: {
        tr: 'Diğerleri tam kare (4², 5², 6²), 48 değildir.',
        en: 'The others are perfect squares (4², 5², 6²); 48 is not.',
      },
    },

    // ---------------------------------------------------------- aritmetik
    {
      id: 'bi-ar-1',
      kind: 'arithmetic',
      prompt: {
        tr: 'Bir gömlek %20 indirimle 240 TL. İndirimsiz fiyatı kaç TL?',
        en: 'A shirt costs 240 after a 20% discount. What was the original price?',
      },
      options: [
        { tr: '260', en: '260' },
        { tr: '288', en: '288' },
        { tr: '300', en: '300' },
        { tr: '320', en: '320' },
      ],
      correctIndex: 2,
      difficultyWeight: 1.2,
      explanation: {
        tr: '240, asıl fiyatın %80’i: 240 ÷ 0,8 = 300.',
        en: '240 is 80% of the original: 240 ÷ 0.8 = 300.',
      },
    },
    {
      id: 'bi-ar-2',
      kind: 'arithmetic',
      prompt: {
        tr: '3 kalem 24 TL ise 7 kalem kaç TL?',
        en: 'If 3 pens cost 24, how much do 7 pens cost?',
      },
      options: [
        { tr: '48', en: '48' },
        { tr: '52', en: '52' },
        { tr: '56', en: '56' },
        { tr: '63', en: '63' },
      ],
      correctIndex: 2,
      difficultyWeight: 0.8,
      explanation: { tr: 'Bir kalem 8 TL; 7 × 8 = 56.', en: 'One pen costs 8; 7 × 8 = 56.' },
    },
    {
      id: 'bi-ar-3',
      kind: 'arithmetic',
      prompt: {
        tr: 'Bir sayının yarısının 3 katı 27 ise sayı kaçtır?',
        en: 'Three times half of a number is 27. What is the number?',
      },
      options: [
        { tr: '9', en: '9' },
        { tr: '12', en: '12' },
        { tr: '18', en: '18' },
        { tr: '27', en: '27' },
      ],
      correctIndex: 2,
      difficultyWeight: 1.1,
      explanation: {
        tr: 'Yarısı 27 ÷ 3 = 9, sayı 18.',
        en: 'Half of it is 27 ÷ 3 = 9, so the number is 18.',
      },
    },
    {
      id: 'bi-ar-4',
      kind: 'arithmetic',
      prompt: { tr: "120'nin %15'i kaçtır?", en: 'What is 15% of 120?' },
      options: [
        { tr: '12', en: '12' },
        { tr: '15', en: '15' },
        { tr: '18', en: '18' },
        { tr: '20', en: '20' },
      ],
      correctIndex: 2,
      difficultyWeight: 0.9,
      explanation: { tr: '120 × 0,15 = 18.', en: '120 × 0.15 = 18.' },
    },
    {
      id: 'bi-ar-5',
      kind: 'arithmetic',
      prompt: {
        tr: "Bir araç 180 km'yi 2,5 saatte alıyor. Ortalama hızı kaç km/sa?",
        en: 'A car covers 180 km in 2.5 hours. What is its average speed in km/h?',
      },
      options: [
        { tr: '60', en: '60' },
        { tr: '70', en: '70' },
        { tr: '72', en: '72' },
        { tr: '75', en: '75' },
      ],
      correctIndex: 2,
      difficultyWeight: 1,
      explanation: { tr: '180 ÷ 2,5 = 72.', en: '180 ÷ 2.5 = 72.' },
    },
  ],
};
