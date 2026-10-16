import type { ContentQuestion, ContentTest } from '../types';

/**
 * Hızlı IQ Testi — beş dakikalık kısa değerlendirme.
 *
 * Havuz bilerek kolay-orta bandında: amaç tavanı ölçmek değil, kısa
 * sürede dört alandan da bir okuma almak. Zorluk ağırlıkları bu yüzden
 * 0.6–1.3 arasında kalıyor; uzun testlerdeki 2.0'lık sorular burada
 * yok.
 */

const QUESTIONS: readonly ContentQuestion[] = [
  {
    id: 'qi-1',
    kind: 'number_series',
    prompt: { tr: '4, 8, 12, 16, ?', en: '4, 8, 12, 16, ?' },
    options: [
      { tr: '18', en: '18' },
      { tr: '20', en: '20' },
      { tr: '22', en: '22' },
      { tr: '24', en: '24' },
    ],
    correctIndex: 1,
    difficultyWeight: 0.6,
  },
  {
    id: 'qi-2',
    kind: 'verbal_analogy',
    prompt: { tr: 'Balık : Su :: Kuş : ?', en: 'Fish : Water :: Bird : ?' },
    options: [
      { tr: 'Yuva', en: 'Nest' },
      { tr: 'Gökyüzü', en: 'Sky' },
      { tr: 'Tüy', en: 'Feather' },
      { tr: 'Ağaç', en: 'Tree' },
    ],
    correctIndex: 1,
    difficultyWeight: 0.7,
  },
  {
    id: 'qi-3',
    kind: 'arithmetic',
    prompt: { tr: '9 × 7 − 13', en: '9 × 7 − 13' },
    options: [
      { tr: '40', en: '40' },
      { tr: '46', en: '46' },
      { tr: '50', en: '50' },
      { tr: '56', en: '56' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.8,
  },
  {
    id: 'qi-4',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one does not belong?' },
    options: [
      { tr: 'Kare', en: 'Square' },
      { tr: 'Üçgen', en: 'Triangle' },
      { tr: 'Daire', en: 'Circle' },
      { tr: 'Beşgen', en: 'Pentagon' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.9,
    explanation: { tr: 'Diğerlerinin köşesi var.', en: 'The others have corners.' },
  },
  {
    id: 'qi-5',
    kind: 'logic',
    prompt: {
      tr: 'Bütün kalemler yazar. Bu nesne yazmıyor. Buna göre kesin olan nedir?',
      en: 'All pens write. This object does not write. What follows?',
    },
    options: [
      { tr: 'Nesne bir kalemdir', en: 'It is a pen' },
      { tr: 'Nesne kalem değildir', en: 'It is not a pen' },
      { tr: 'Nesne bozuktur', en: 'It is broken' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 1,
    difficultyWeight: 0.9,
  },
  {
    id: 'qi-6',
    kind: 'number_series',
    prompt: { tr: '2, 4, 8, 16, ?', en: '2, 4, 8, 16, ?' },
    options: [
      { tr: '20', en: '20' },
      { tr: '24', en: '24' },
      { tr: '30', en: '30' },
      { tr: '32', en: '32' },
    ],
    correctIndex: 3,
    difficultyWeight: 0.6,
  },
  {
    id: 'qi-7',
    kind: 'verbal_analogy',
    prompt: { tr: 'Gece : Karanlık :: Gündüz : ?', en: 'Night : Dark :: Day : ?' },
    options: [
      { tr: 'Aydınlık', en: 'Light' },
      { tr: 'Sıcak', en: 'Warm' },
      { tr: 'Uzun', en: 'Long' },
      { tr: 'Sessiz', en: 'Quiet' },
    ],
    correctIndex: 0,
    difficultyWeight: 0.6,
  },
  {
    id: 'qi-8',
    kind: 'arithmetic',
    prompt: { tr: '84 ÷ 7 + 15', en: '84 ÷ 7 + 15' },
    options: [
      { tr: '25', en: '25' },
      { tr: '27', en: '27' },
      { tr: '29', en: '29' },
      { tr: '31', en: '31' },
    ],
    correctIndex: 1,
    difficultyWeight: 0.8,
  },
  {
    id: 'qi-9',
    kind: 'coding',
    prompt: {
      tr: 'Bir makine girilen sayıya 5 ekleyip ikiye katlıyor. 3 girilirse ne çıkar?',
      en: 'A machine adds 5 then doubles. Input 3 gives?',
    },
    options: [
      { tr: '11', en: '11' },
      { tr: '13', en: '13' },
      { tr: '16', en: '16' },
      { tr: '18', en: '18' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.9,
  },
  {
    id: 'qi-10',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one does not belong?' },
    options: [
      { tr: '9', en: '9' },
      { tr: '16', en: '16' },
      { tr: '20', en: '20' },
      { tr: '25', en: '25' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.1,
    explanation: { tr: 'Diğerleri tam kare.', en: 'The others are perfect squares.' },
  },
  {
    id: 'qi-11',
    kind: 'number_series',
    prompt: { tr: '20, 17, 14, 11, ?', en: '20, 17, 14, 11, ?' },
    options: [
      { tr: '6', en: '6' },
      { tr: '7', en: '7' },
      { tr: '8', en: '8' },
      { tr: '9', en: '9' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
  },
  {
    id: 'qi-12',
    kind: 'arithmetic',
    prompt: { tr: '6 × 6 + 4 × 4', en: '6 × 6 + 4 × 4' },
    options: [
      { tr: '40', en: '40' },
      { tr: '48', en: '48' },
      { tr: '52', en: '52' },
      { tr: '56', en: '56' },
    ],
    correctIndex: 2,
    difficultyWeight: 1,
  },
  {
    id: 'qi-13',
    kind: 'verbal_analogy',
    prompt: { tr: 'Anahtar : Kilit :: Şifre : ?', en: 'Key : Lock :: Password : ?' },
    options: [
      { tr: 'Kapı', en: 'Door' },
      { tr: 'Hesap', en: 'Account' },
      { tr: 'Kutu', en: 'Box' },
      { tr: 'Defter', en: 'Notebook' },
    ],
    correctIndex: 1,
    difficultyWeight: 1,
  },
  {
    id: 'qi-14',
    kind: 'logic',
    prompt: {
      tr: 'Ece, Can’dan hızlı. Can, Mert’ten hızlı. En yavaş kim?',
      en: 'Ece is faster than Can. Can is faster than Mert. Who is slowest?',
    },
    options: [
      { tr: 'Ece', en: 'Ece' },
      { tr: 'Can', en: 'Can' },
      { tr: 'Mert', en: 'Mert' },
      { tr: 'Kesin bir şey söylenemez', en: 'Nothing can be concluded' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.7,
  },
  {
    id: 'qi-15',
    kind: 'number_series',
    prompt: { tr: '1, 2, 4, 7, 11, ?', en: '1, 2, 4, 7, 11, ?' },
    options: [
      { tr: '14', en: '14' },
      { tr: '15', en: '15' },
      { tr: '16', en: '16' },
      { tr: '18', en: '18' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.2,
    explanation: { tr: 'Farklar 1, 2, 3, 4, 5.', en: 'Gaps are 1, 2, 3, 4, 5.' },
  },
  {
    id: 'qi-16',
    kind: 'arithmetic',
    prompt: { tr: '150 − 6 × 12', en: '150 − 6 × 12' },
    options: [
      { tr: '66', en: '66' },
      { tr: '72', en: '72' },
      { tr: '78', en: '78' },
      { tr: '88', en: '88' },
    ],
    correctIndex: 2,
    difficultyWeight: 1.1,
  },
  {
    id: 'qi-17',
    kind: 'odd_one_out',
    prompt: { tr: 'Hangisi diğerlerinden farklı?', en: 'Which one does not belong?' },
    options: [
      { tr: 'Otobüs', en: 'Bus' },
      { tr: 'Tren', en: 'Train' },
      { tr: 'Gemi', en: 'Ship' },
      { tr: 'Bisiklet', en: 'Bicycle' },
    ],
    correctIndex: 2,
    difficultyWeight: 1,
    explanation: { tr: 'Diğerleri karada gider.', en: 'The others travel on land.' },
  },
  {
    id: 'qi-18',
    kind: 'coding',
    prompt: {
      tr: 'Bir kodda her sayı rakamlarının toplamıyla değiştiriliyor. 352 nasıl kodlanır?',
      en: 'Each number is replaced by the sum of its digits. How is 352 coded?',
    },
    options: [
      { tr: '8', en: '8' },
      { tr: '9', en: '9' },
      { tr: '10', en: '10' },
      { tr: '12', en: '12' },
    ],
    correctIndex: 2,
    difficultyWeight: 0.8,
  },
  {
    id: 'qi-19',
    kind: 'verbal_analogy',
    prompt: { tr: 'Terzi : Kumaş :: Fırıncı : ?', en: 'Tailor : Fabric :: Baker : ?' },
    options: [
      { tr: 'Fırın', en: 'Oven' },
      { tr: 'Un', en: 'Flour' },
      { tr: 'Ekmek', en: 'Bread' },
      { tr: 'Tezgah', en: 'Counter' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.3,
    explanation: { tr: 'Usta ve işlediği hammadde.', en: 'Craftsperson and raw material.' },
  },
  {
    id: 'qi-20',
    kind: 'logic',
    prompt: {
      tr: 'Bir sınıftaki 24 öğrencinin yarısı kız. Erkeklerin üçte biri gözlüklü ise kaç erkek gözlüklüdür?',
      en: 'Half of 24 students are girls. A third of the boys wear glasses. How many boys wear glasses?',
    },
    options: [
      { tr: '3', en: '3' },
      { tr: '4', en: '4' },
      { tr: '6', en: '6' },
      { tr: '8', en: '8' },
    ],
    correctIndex: 1,
    difficultyWeight: 1.2,
  },
];

export const quickIqTest: ContentTest = {
  id: 'quick-iq',
  kind: 'iq',
  title: { tr: 'Hızlı IQ Testi', en: 'Quick IQ Test' },
  description: {
    tr: 'Beş dakikada dört alandan kısa bir okuma. Uzun testin yerini tutmaz, fikir verir.',
    en: 'A five-minute read across four areas. Not a substitute for the full test.',
  },
  questionCount: 12,
  estMinutes: [4, 6],
  isPro: true,
  norm: { mean: 0.6, sd: 0.18 },
  questions: QUESTIONS,
};
