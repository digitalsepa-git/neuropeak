import { turkishAblativeSuffix, turkishDativeSuffix } from '@neuropeak/core';

import type { StringCatalogue } from './types';

/**
 * Arayüz metinleri.
 *
 * Tek dosyada duruyor: bir metni değiştirirken iki dilin yan yana
 * olması, çevirinin unutulmasını zorlaştırıyor. İçerik metinleri
 * (test soruları, rozetler, oyun katalogu) burada değil, içerik
 * paketinde — onlar panelden yönetilecek.
 */
export const STRINGS = {
  // --------------------------------------------------------------- ortak
  'common.continue': { tr: 'Devam', en: 'Continue' },
  'common.continueAction': { tr: 'Devam et', en: 'Continue' },
  'common.back': { tr: 'Geri', en: 'Back' },
  'common.close': { tr: 'Kapat', en: 'Close' },
  'common.goBack': { tr: 'Geri dön', en: 'Go back' },
  'common.done': { tr: 'Bitti', en: 'Done' },
  'common.exit': { tr: 'Çık', en: 'Exit' },
  'common.notNow': { tr: 'Şimdi değil', en: 'Not now' },
  'common.soon': { tr: 'Yakında', en: 'Soon' },
  'common.free': { tr: 'Ücretsiz', en: 'Free' },
  'common.on': { tr: 'Açık', en: 'On' },
  'common.off': { tr: 'Kapalı', en: 'Off' },
  'common.all': { tr: 'Tümü', en: 'All' },
  'common.xp': { tr: 'XP', en: 'XP' },
  'common.stars': { tr: 'yıldız', en: 'stars' },
  'common.minutesShort': {
    tr: (p: { value: string }) => `${p.value} dk`,
    en: (p: { value: string }) => `${p.value} min`,
  },
  'common.questionCount': {
    tr: (p: { count: number }) => `${p.count} soru`,
    en: (p: { count: number }) => `${p.count} question${p.count === 1 ? '' : 's'}`,
  },
  'common.roundCount': {
    tr: (p: { count: number }) => `${p.count} tur`,
    en: (p: { count: number }) => `${p.count} round${p.count === 1 ? '' : 's'}`,
  },
  'common.levelLabel': {
    tr: (p: { level: number }) => `Seviye ${p.level}`,
    en: (p: { level: number }) => `Level ${p.level}`,
  },
  'common.disclaimer': {
    tr: 'NeuroPeak testleri eğlence ve zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir teşhis aracı değildir.',
    en: 'NeuroPeak tests are for entertainment and mental exercise; they are not a clinical or psychometric diagnostic tool.',
  },
  'common.testDisclaimer': {
    tr: 'Bu test eğlence ve zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir teşhis aracı değildir.',
    en: 'This test is for entertainment and mental exercise; it is not a clinical or psychometric diagnostic tool.',
  },

  // ------------------------------------------------------------ kategori
  'category.memory': { tr: 'Hafıza', en: 'Memory' },
  'category.attention': { tr: 'Odaklanma', en: 'Attention' },
  'category.logic': { tr: 'Mantık', en: 'Logic' },
  'category.math': { tr: 'Matematik', en: 'Math' },
  'category.spatial': { tr: 'Görsel', en: 'Spatial' },
  'category.speed': { tr: 'Hız', en: 'Speed' },
  'category.verbal': { tr: 'Sözel', en: 'Verbal' },

  // ---------------------------------------------------------- beyin ekseni
  'axis.memory': { tr: 'Hafıza', en: 'Memory' },
  'axis.focus': { tr: 'Odaklanma', en: 'Focus' },
  'axis.logic': { tr: 'Mantık', en: 'Logic' },
  'axis.speed': { tr: 'Hız', en: 'Speed' },
  'axis.problemSolving': { tr: 'Problem Çözme', en: 'Problem Solving' },

  // --------------------------------------------------------------- sekme
  'tab.home': { tr: 'Ana Sayfa', en: 'Home' },
  'tab.games': { tr: 'Oyunlar', en: 'Games' },
  'tab.tests': { tr: 'Testler', en: 'Tests' },
  'tab.progress': { tr: 'İlerleme', en: 'Progress' },
  'tab.league': { tr: 'Lig', en: 'League' },

  // ---------------------------------------------------------- onboarding
  'onboarding.welcome.title': {
    tr: 'Zihnini her gün biraz daha ileri taşı',
    en: 'Push your mind a little further every day',
  },
  'onboarding.welcome.body': {
    tr: (p: { games: number; tests: number }) =>
      `${p.games} mini oyun ve ${p.tests} test ile hafızanı, odaklanmanı ve mantığını ölç, geliştir, takip et.`,
    en: (p: { games: number; tests: number }) =>
      `Measure, train and track your memory, focus and logic with ${p.games} mini games and ${p.tests} tests.`,
  },
  'onboarding.start': { tr: 'Başlayalım', en: "Let's start" },
  'onboarding.age.title': { tr: 'Kaç yaşındasın?', en: 'How old are you?' },
  'onboarding.age.description': {
    tr: 'Sonuçlarını aynı yaş grubundakilerle karşılaştırabilmek için gerekli.',
    en: 'We need this to compare your results with your own age group.',
  },
  'onboarding.focus.title': {
    tr: 'Hangi alanları geliştirmek istiyorsun?',
    en: 'Which areas do you want to train?',
  },
  'onboarding.focus.description': {
    tr: 'Birden fazla seçebilirsin. Günlük planın buna göre kurulur.',
    en: 'Pick as many as you like. Your daily plan is built around them.',
  },
  'onboarding.goal.title': {
    tr: 'Günde ne kadar vakit ayırabilirsin?',
    en: 'How much time can you give each day?',
  },
  'onboarding.goal.description': {
    tr: 'Küçük başlamak, hiç başlamamaktan iyidir. Sonradan değiştirebilirsin.',
    en: 'Starting small beats not starting. You can change this later.',
  },
  'onboarding.goal.minutes': {
    tr: (p: { minutes: number }) => `${p.minutes} dakika`,
    en: (p: { minutes: number }) => `${p.minutes} minutes`,
  },
  'onboarding.goal.hint5': { tr: 'Kısa ve sürdürülebilir', en: 'Short and sustainable' },
  'onboarding.goal.hint10': { tr: 'Çoğu kişinin tercihi', en: 'What most people pick' },
  'onboarding.goal.hint20': {
    tr: 'Hızlı ilerlemek isteyenler için',
    en: 'For those who want fast progress',
  },
  'onboarding.concern.title': {
    tr: 'Son zamanlarda seni en çok ne zorluyor?',
    en: "What's been hardest for you lately?",
  },
  'onboarding.concern.description': {
    tr: 'Planını bu alana ağırlık verecek şekilde kurarız.',
    en: 'We will weight your plan towards that area.',
  },
  'onboarding.concern.forgetfulness': { tr: 'Unutkanlık', en: 'Forgetfulness' },
  'onboarding.concern.forgetfulnessHint': {
    tr: 'İsimler, yapılacaklar, nereye koyduğum',
    en: 'Names, to-dos, where I put things',
  },
  'onboarding.concern.distraction': { tr: 'Dikkat dağınıklığı', en: 'Distraction' },
  'onboarding.concern.distractionHint': {
    tr: 'Bir işe uzun süre odaklanamıyorum',
    en: "I can't stay focused on one thing for long",
  },
  'onboarding.concern.slowThinking': { tr: 'Yavaş düşünme', en: 'Slow thinking' },
  'onboarding.concern.slowThinkingHint': {
    tr: 'Karar vermem eskisinden uzun sürüyor',
    en: 'Decisions take me longer than they used to',
  },
  'onboarding.concern.none': { tr: 'Hiçbiri', en: 'None of these' },
  'onboarding.concern.noneHint': {
    tr: 'Sadece zihnimi geliştirmek istiyorum',
    en: 'I just want to train my mind',
  },
  'onboarding.habit.title': {
    tr: 'Ne sıklıkla zihinsel egzersiz yapıyorsun?',
    en: 'How often do you train your mind?',
  },
  'onboarding.habit.description': {
    tr: 'Başlangıç zorluğunu buna göre ayarlarız.',
    en: 'We set your starting difficulty from this.',
  },
  'onboarding.habit.daily': { tr: 'Her gün', en: 'Every day' },
  'onboarding.habit.sometimes': { tr: 'Haftada birkaç kez', en: 'A few times a week' },
  'onboarding.habit.rarely': { tr: 'Nadiren', en: 'Rarely' },
  'onboarding.habit.never': { tr: 'Hiç yapmadım', en: 'Never have' },
  'onboarding.plan.title': { tr: 'Planın hazırlanıyor', en: 'Building your plan' },
  'onboarding.plan.caption1': { tr: 'Cevapların işleniyor…', en: 'Reading your answers…' },
  'onboarding.plan.caption2': {
    tr: 'Yetenek alanların eşleştiriliyor…',
    en: 'Matching your skill areas…',
  },
  'onboarding.plan.caption3': {
    tr: 'Günlük planın hazırlanıyor…',
    en: 'Preparing your daily plan…',
  },
  'onboarding.plan.progressLabel': { tr: 'Plan hazırlanıyor', en: 'Preparing plan' },
  'onboarding.plan.focusAreas': {
    tr: (p: { areas: string }) => `Odak alanların: ${p.areas}`,
    en: (p: { areas: string }) => `Your focus areas: ${p.areas}`,
  },
  'onboarding.notifications.title': { tr: 'Seriyi kaçırma', en: "Don't break your streak" },
  'onboarding.notifications.description': {
    tr: 'Günde en fazla bir hatırlatma göndeririz. İstediğin an kapatabilirsin.',
    en: 'At most one reminder a day. You can turn it off whenever you like.',
  },
  'onboarding.notifications.benefit1': {
    tr: 'Serin bitmek üzereyken haber veririz',
    en: 'We tell you when your streak is about to end',
  },
  'onboarding.notifications.benefit2': {
    tr: 'Günün görevleri hazır olduğunda hatırlatırız',
    en: "We remind you when the day's tasks are ready",
  },
  'onboarding.notifications.benefit3': {
    tr: 'Ligdeki sıralaman değişince bildiririz',
    en: 'We let you know when your league rank changes',
  },
  'onboarding.notifications.enable': { tr: 'Bildirimleri aç', en: 'Turn on notifications' },

  // --------------------------------------------------------------- paywall
  'paywall.brand': { tr: 'NEUROPEAK PRO', en: 'NEUROPEAK PRO' },
  'paywall.onboarding.title': {
    tr: 'Potansiyelini aç',
    en: 'Unlock your potential',
  },
  'paywall.onboarding.subtitle': {
    tr: 'Planın hazır. PRO ile tüm testler, detaylı raporlar ve reklamsız deneyim açılır.',
    en: 'Your plan is ready. PRO unlocks every test, detailed reports and an ad-free experience.',
  },
  'paywall.result.title': { tr: 'Detaylı raporunu aç', en: 'Unlock your detailed report' },
  'paywall.result.subtitle': {
    tr: 'Güçlü ve zayıf alanların, yaş grubuna göre karşılaştırma ve sana özel gelişim planı.',
    en: 'Your strong and weak areas, a comparison with your age group and a plan made for you.',
  },
  'paywall.generic.title': { tr: 'NeuroPeak PRO', en: 'NeuroPeak PRO' },
  'paywall.generic.subtitle': {
    tr: 'Zihnini geliştirmek için ihtiyacın olan her şey tek abonelikte.',
    en: 'Everything you need to train your mind, in one subscription.',
  },
  'paywall.benefit1': { tr: 'Tüm IQ ve kişilik testleri', en: 'Every IQ and personality test' },
  'paywall.benefit2': {
    tr: 'Her testte detaylı rapor ve gelişim planı',
    en: 'A detailed report and plan after every test',
  },
  'paywall.benefit3': { tr: 'Reklamsız deneyim', en: 'No ads' },
  'paywall.benefit4': { tr: 'Sınırsız ipucu ve yıldız', en: 'Unlimited hints and stars' },
  'paywall.benefit5': {
    tr: 'Beyin haritası geçmişi ve haftalık trend',
    en: 'Brain map history and weekly trend',
  },
  'paywall.restore': { tr: 'Geri yükle', en: 'Restore' },
  'paywall.terms': { tr: 'Kullanım Şartları', en: 'Terms of Use' },
  'paywall.privacy': { tr: 'Gizlilik Politikası', en: 'Privacy Policy' },
  'paywall.trialCta': {
    tr: (p: { days: number }) => `${p.days} gün ücretsiz dene`,
    en: (p: { days: number }) => `Try ${p.days} days free`,
  },
  'paywall.disclosureTrial': {
    tr: (p: { days: number; price: string; period: string }) =>
      `${p.days} günlük ücretsiz deneme sonunda ${p.price}/${p.period} olarak otomatik yenilenir.`,
    en: (p: { days: number; price: string; period: string }) =>
      `After the ${p.days}-day free trial it renews automatically at ${p.price}/${p.period}.`,
  },
  'paywall.disclosurePlain': {
    tr: (p: { price: string; period: string }) =>
      `${p.price}/${p.period} olarak otomatik yenilenir.`,
    en: (p: { price: string; period: string }) => `Renews automatically at ${p.price}/${p.period}.`,
  },
  'paywall.cancelNote': {
    tr: 'İstediğin zaman App Store ayarlarından iptal edebilirsin.',
    en: 'You can cancel any time in your App Store settings.',
  },
  'paywall.alertTitle': { tr: 'Abonelik', en: 'Subscription' },
  'paywall.restoreAlertTitle': {
    tr: 'Satın alımları geri yükle',
    en: 'Restore purchases',
  },

  // ------------------------------------------------------------------ plan
  'plan.weekly': { tr: 'Haftalık', en: 'Weekly' },
  'plan.annual': { tr: 'Yıllık', en: 'Annual' },
  'plan.period.week': { tr: 'hafta', en: 'week' },
  'plan.period.year': { tr: 'yıl', en: 'year' },
  'plan.savingBadge': {
    tr: (p: { percent: number }) => `%${p.percent} tasarruf`,
    en: (p: { percent: number }) => `Save ${p.percent}%`,
  },
  'plan.discountBadge': {
    tr: (p: { percent: number }) => `%${p.percent} indirim`,
    en: (p: { percent: number }) => `${p.percent}% off`,
  },
  'plan.perWeek': {
    tr: (p: { price: string }) => `haftada ${p.price}`,
    en: (p: { price: string }) => `${p.price} per week`,
  },
  'plan.trialLine': {
    tr: (p: { days: number; price: string; period: string }) =>
      `${p.days} gün ücretsiz, sonra ${p.price}/${p.period}`,
    en: (p: { days: number; price: string; period: string }) =>
      `${p.days} days free, then ${p.price}/${p.period}`,
  },

  // ------------------------------------------------------------- çıkış teklifi
  'exitOffer.eyebrow': { tr: 'Sana özel', en: 'Just for you' },
  'exitOffer.title': { tr: 'Gitmeden önce', en: 'Before you go' },
  'exitOffer.subtitle': {
    tr: 'Bu teklif yalnızca bu ekranda geçerli.',
    en: 'This offer is only good on this screen.',
  },
  'exitOffer.fallbackBadge': { tr: 'İndirim', en: 'Discount' },
  'exitOffer.close': { tr: 'Teklifi kapat', en: 'Dismiss offer' },
  'exitOffer.countdown': {
    tr: (p: { time: string }) => `Teklifin bitmesine ${p.time}`,
    en: (p: { time: string }) => `Offer ends in ${p.time}`,
  },
  'exitOffer.accept': { tr: 'Teklifi al', en: 'Get the offer' },
  'exitOffer.decline': { tr: 'Teşekkürler, istemiyorum', en: 'No thanks' },
  'exitOffer.renewNote': {
    tr: (p: { price: string; period: string }) =>
      `${p.price}/${p.period} olarak otomatik yenilenir. İstediğin zaman App Store ayarlarından iptal edebilirsin.`,
    en: (p: { price: string; period: string }) =>
      `Renews automatically at ${p.price}/${p.period}. You can cancel any time in your App Store settings.`,
  },

  // --------------------------------------------------------------- faturalama
  'billing.store_not_ready': {
    tr: 'Mağaza bağlantısı henüz kurulmadı. Abonelik yakında açılacak.',
    en: 'The store is not connected yet. Subscriptions are coming soon.',
  },
  'billing.restore_not_ready': {
    tr: 'Mağaza bağlantısı henüz kurulmadı.',
    en: 'The store is not connected yet.',
  },
  'billing.plan_missing': {
    tr: 'Bu plan şu anda mağazada bulunamadı.',
    en: 'That plan is not available in the store right now.',
  },
  'billing.not_verified': {
    tr: 'Abonelik doğrulanamadı.',
    en: 'The subscription could not be verified.',
  },
  'billing.purchase_failed': {
    tr: 'Satın alma tamamlanamadı. Lütfen tekrar deneyin.',
    en: 'The purchase could not be completed. Please try again.',
  },
  'billing.no_subscription': {
    tr: 'Bu hesapta etkin bir abonelik bulunamadı.',
    en: 'No active subscription was found for this account.',
  },
  'billing.restore_failed': {
    tr: 'Satın alımlar geri yüklenemedi.',
    en: 'Purchases could not be restored.',
  },

  // ----------------------------------------------------------------- ana sayfa
  'home.title': { tr: 'Ana Sayfa', en: 'Home' },
  'header.goPro': { tr: "PRO'ya geç", en: 'Get PRO' },
  'home.streakStart': { tr: 'Seriyi başlat', en: 'Start a streak' },
  'home.streakStartBody': {
    tr: 'Bugün bir test veya oyun bitir, seri başlasın.',
    en: 'Finish a game or a test today to start your streak.',
  },
  'home.streakDays': {
    tr: (p: { days: number }) => `${p.days} günlük seri`,
    en: (p: { days: number }) => `${p.days}-day streak`,
  },
  'home.streakKeep': {
    tr: 'Bugün bir oyun oyna, seriyi sürdür.',
    en: 'Play a game today to keep it going.',
  },
  'home.levelMax': { tr: 'En yüksek seviye', en: 'Top level' },
  'home.levelNext': {
    tr: (p: { level: number; xp: number }) =>
      `Seviye ${p.level}${turkishDativeSuffix(p.level)} ${p.xp} XP`,
    en: (p: { level: number; xp: number }) => `${p.xp} XP to level ${p.level}`,
  },
  'home.dailyTasks': { tr: 'Günün görevleri', en: "Today's tasks" },
  'home.dailyTasksMeta': {
    tr: (p: { done: number; total: number }) => `${p.done}/${p.total} tamamlandı`,
    en: (p: { done: number; total: number }) => `${p.done}/${p.total} done`,
  },
  'home.earnStars': { tr: 'Yıldız kazan', en: 'Earn stars' },
  'home.scoreSection': { tr: 'NeuroPeak skorun', en: 'Your NeuroPeak score' },
  'home.scoreBody': {
    tr: 'Beş eksenin ağırlıklı ortalaması. Oynadıkça yükselir.',
    en: 'A weighted average of five axes. It rises as you play.',
  },
  'home.openBrainMap': { tr: 'Beyin haritanı aç', en: 'Open your brain map' },
  'home.seeBrainMap': { tr: 'Beyin haritanı gör', en: 'See your brain map' },
  'home.levelProgress': { tr: 'Seviye ilerlemesi', en: 'Level progress' },
  'home.suggestionSection': { tr: 'Bugünün önerisi', en: "Today's pick" },
  // Rozet olarak duruyor; uzun cümle karta sığmıyordu.
  'home.suggestionNew': { tr: 'Yeni', en: 'New' },
  'home.continueSection': { tr: 'Kaldığın yerden', en: 'Pick up where you left off' },
  'home.taskProgressLabel': {
    tr: (p: { task: string }) => `${p.task} ilerlemesi`,
    en: (p: { task: string }) => `${p.task} progress`,
  },

  // -------------------------------------------------------------------- oyunlar
  'games.title': { tr: 'Oyunlar', en: 'Games' },
  'games.levelOf': {
    tr: (p: { level: number; total: number }) => `Seviye ${p.level}/${p.total}`,
    en: (p: { level: number; total: number }) => `Level ${p.level}/${p.total}`,
  },
  // Süreli oyunlarda seviye yok; kartta en iyi skor duruyor.
  'games.bestScore': {
    tr: (p: { score: number }) => `En iyi skor ${p.score}`,
    en: (p: { score: number }) => `Best score ${p.score}`,
  },
  'games.notPlayed': { tr: 'Henüz oynamadın', en: 'Not played yet' },
  'games.playedCount': {
    tr: (p: { played: number; total: number }) => `${p.total} oyunun ${p.played} tanesi`,
    en: (p: { played: number; total: number }) => `${p.played} of ${p.total} games`,
  },
  'game.notFound': { tr: 'Oyun bulunamadı', en: 'Game not found' },
  'game.chooseDifficulty': { tr: 'Zorluk seç', en: 'Choose difficulty' },
  'game.difficulty.easy': { tr: 'Kolay', en: 'Easy' },
  'game.difficulty.medium': { tr: 'Orta', en: 'Medium' },
  'game.difficulty.hard': { tr: 'Zor', en: 'Hard' },
  'game.difficultyHint.easy': { tr: 'Zihnini ısıt', en: 'Warm up' },
  'game.difficultyHint.medium': { tr: 'Becerini dene', en: 'Test your skill' },
  'game.difficultyHint.hard': { tr: 'Sınırlarını zorla', en: 'Push your limits' },
  'game.difficultyStandard': { tr: 'Standart', en: 'Standard' },
  'game.difficultyBonus': {
    tr: (p: { percent: number }) => `+%${p.percent} XP`,
    en: (p: { percent: number }) => `+${p.percent}% XP`,
  },
  'game.skillsLabel': { tr: 'Artırılacak yetenekler', en: 'Skills you will train' },
  'game.yourRecord': { tr: 'Kaydın', en: 'Your record' },
  'game.resumeAt': {
    tr: (p: { level: number }) => `Seviye ${p.level}${turkishAblativeSuffix(p.level)} devam`,
    en: (p: { level: number }) => `Resume at level ${p.level}`,
  },
  'game.fromStart': { tr: 'Baştan', en: 'From the start' },
  'game.playCount': {
    tr: (p: { count: number }) => `${p.count} kez oynadın`,
    en: (p: { count: number }) => `Played ${p.count} time${p.count === 1 ? '' : 's'}`,
  },
  'game.start': { tr: 'Başla', en: 'Start' },
  'game.playAgain': { tr: 'Tekrar oyna', en: 'Play again' },
  'game.exit': { tr: 'Oyundan çık', en: 'Leave game' },
  'game.score': { tr: 'Skor', en: 'Score' },
  'game.roundLabel': {
    tr: (p: { round: number }) => `Tur ${p.round}`,
    en: (p: { round: number }) => `Round ${p.round}`,
  },
  'game.levelNotFinished': { tr: 'Seviye tamamlanmadı', en: 'Level not finished' },
  'game.roundNotFinished': { tr: 'Tur tamamlanmadı', en: 'Round not finished' },
  'game.levelReached': {
    tr: (p: { level: number }) => `Seviye ${p.level}${turkishDativeSuffix(p.level)} ulaştın`,
    en: (p: { level: number }) => `Reached level ${p.level}`,
  },
  'game.roundsFinished': {
    tr: (p: { count: number }) => `${p.count} tur tamamladın`,
    en: (p: { count: number }) => `Finished ${p.count} round${p.count === 1 ? '' : 's'}`,
  },

  // ------------------------------------------------------------- oyun içi
  'play.clearBoard': { tr: 'Tahtayı temizle', en: 'Clear the board' },
  'play.redraw': { tr: 'Baştan çiz', en: 'Draw again' },
  'play.undoLetter': { tr: 'Son harfi geri al', en: 'Undo last letter' },
  'play.undo': { tr: 'Geri al', en: 'Undo' },
  'play.undoPiece': { tr: 'Son parçayı geri al', en: 'Undo last piece' },
  'play.rotatePiece': { tr: 'Seçili parçayı döndür', en: 'Rotate selected piece' },
  'play.hiddenCard': { tr: 'Kapalı kart', en: 'Face-down card' },
  'play.clear': { tr: 'Temizle', en: 'Clear' },
  'play.confirm': { tr: 'Onayla', en: 'Confirm' },
  'play.rememberCells': { tr: 'Hücreleri aklında tut', en: 'Remember the cells' },
  'play.nextLevelComing': { tr: 'Sıradaki seviye geliyor', en: 'Next level coming up' },
  'play.nextRoundComing': { tr: 'Sıradaki tur geliyor', en: 'Next round coming up' },
  'play.watch': { tr: 'İzle…', en: 'Watch…' },
  'play.wrongSequence': { tr: 'Yanlış dizi', en: 'Wrong sequence' },
  'play.yourTurn': { tr: 'Sıra sende', en: 'Your turn' },
  'play.correct': { tr: 'Doğru', en: 'Correct' },
  'play.goodStop': { tr: 'İyi durdun', en: 'Good hold' },
  'play.missed': { tr: 'Kaçırdın', en: 'Missed it' },
  'play.shouldHaveStopped': { tr: 'Durmalıydın', en: 'Should have held' },
  'play.reactionArea': { tr: 'Tepki alanı', en: 'Tap area' },
  'play.match': { tr: 'Eşleşme', en: 'Match' },
  'play.same': { tr: 'Aynı', en: 'Same' },
  'play.sameShape': { tr: 'Aynı şekil', en: 'Same shape' },
  'play.mirror': { tr: 'Ayna', en: 'Mirror' },
  'play.mirrorImage': { tr: 'Ayna görüntüsü', en: 'Mirror image' },
  'play.tapToStart': { tr: 'Başlamak için dokun', en: 'Tap to start' },
  'play.wait': { tr: 'Bekle…', en: 'Wait…' },
  'play.tapNow': { tr: 'Bas!', en: 'Tap!' },
  'play.tooEarly': { tr: 'Erken bastın', en: 'Too early' },
  'play.tapToRetry': { tr: 'Tekrar denemek için dokun', en: 'Tap to try again' },
  'play.finishRound': { tr: 'Turu bitir', en: 'Finish round' },
  'play.target': { tr: 'Hedef', en: 'Target' },
  'play.correctShort': { tr: 'Doğru', en: 'Correct' },
  'play.wrongShort': { tr: 'Yanlış', en: 'Wrong' },
  'play.getReady': { tr: 'Hazır ol', en: 'Get ready' },
  'play.goNoGoHint': {
    tr: 'Yeşil daireye dokun · kırmızı kareye dokunma',
    en: 'Tap the green circle · never the red square',
  },
  'play.completeMissingCell': { tr: 'Eksik hücreyi tamamla', en: 'Complete the missing cell' },
  'play.rotationQuestion': {
    tr: 'Sağdaki şekil solun döndürülmüş hâli mi?',
    en: 'Is the right shape a rotation of the left one?',
  },
  'play.restart': { tr: 'Baştan', en: 'Restart' },
  'play.unfoldQuestion': { tr: 'Açılınca hangisi olur?', en: 'Which one is it unfolded?' },
  'play.seeResult': { tr: 'Sonucu gör', en: 'See result' },
  'play.findShadow': { tr: 'Gölgesini bul', en: 'Find its shadow' },
  'play.rotate': { tr: 'Döndür', en: 'Rotate' },
  'play.remove': { tr: 'Çıkar', en: 'Remove' },
  'play.analogyLike': { tr: 'ilişkisi gibi', en: 'is to' },
  'play.pickInkColor': { tr: 'Yazının rengini seç', en: 'Pick the ink colour' },
  'play.streakCorrect': {
    tr: (p: { count: number }) => `${p.count} doğru üst üste`,
    en: (p: { count: number }) => `${p.count} correct in a row`,
  },
  'play.deadEnd': { tr: 'Çıkmaza girdin — baştan başla', en: 'Dead end — start over' },
  'play.startOver': { tr: 'Baştan başla', en: 'Start over' },
  'play.followWithEyes': { tr: 'Gözünle takip et', en: 'Follow it with your eyes' },
  'play.up': { tr: 'Yukarı', en: 'Up' },
  'play.down': { tr: 'Aşağı', en: 'Down' },
  'play.left': { tr: 'Sola', en: 'Left' },
  'play.right': { tr: 'Sağa', en: 'Right' },
  'play.askSynonym': {
    tr: 'kelimesinin eş anlamlısı hangisi?',
    en: 'Which of these means the same?',
  },
  'play.askAntonym': {
    tr: 'kelimesinin zıt anlamlısı hangisi?',
    en: 'Which of these means the opposite?',
  },
  'play.colorRed': { tr: 'KIRMIZI', en: 'RED' },
  'play.colorBlue': { tr: 'MAVİ', en: 'BLUE' },
  'play.colorGreen': { tr: 'YEŞİL', en: 'GREEN' },
  'play.colorYellow': { tr: 'SARI', en: 'YELLOW' },

  // ----------------------------------------- oyun tahtasındaki sayaçlar
  'play.moves': {
    tr: (p: { count: number }) => `${p.count} hamle`,
    en: (p: { count: number }) => `${p.count} move${p.count === 1 ? '' : 's'}`,
  },
  'play.movesOneColour': {
    tr: (p: { count: number }) => `${p.count} hamle · her şişede tek renk kalsın`,
    en: (p: { count: number }) =>
      `${p.count} move${p.count === 1 ? '' : 's'} · one colour per tube`,
  },
  'play.connectedOf': {
    tr: (p: { done: number; total: number }) => `${p.done} / ${p.total} bağlandı`,
    en: (p: { done: number; total: number }) => `${p.done} / ${p.total} connected`,
  },
  'play.edgesOf': {
    tr: (p: { done: number; total: number }) => `${p.done} / ${p.total} kenar`,
    en: (p: { done: number; total: number }) => `${p.done} / ${p.total} edges`,
  },
  'play.markedOf': {
    tr: (p: { done: number; total: number }) => `${p.done} / ${p.total} işaretlendi`,
    en: (p: { done: number; total: number }) => `${p.done} / ${p.total} marked`,
  },
  'play.trialsOf': {
    tr: (p: { done: number; total: number }) => `${p.done} / ${p.total} ölçüm`,
    en: (p: { done: number; total: number }) => `${p.done} / ${p.total} trials`,
  },
  'play.digitCount': {
    tr: (p: { count: number }) => `${p.count} haneli`,
    en: (p: { count: number }) => `${p.count} digits`,
  },
  'play.lightCount': {
    tr: (p: { count: number }) => `${p.count} ışık`,
    en: (p: { count: number }) => `${p.count} light${p.count === 1 ? '' : 's'}`,
  },
  'play.solvedCount': {
    tr: (p: { count: number }) => `${p.count} işlem`,
    en: (p: { count: number }) => `${p.count} solved`,
  },
  'play.tablesFinished': {
    tr: (p: { count: number }) => `${p.count} tablo tamamlandı`,
    en: (p: { count: number }) => `${p.count} grid${p.count === 1 ? '' : 's'} finished`,
  },
  'play.roundsAndGrid': {
    tr: (p: { rounds: number; size: number }) => `${p.rounds} tur · ${p.size}×${p.size}`,
    en: (p: { rounds: number; size: number }) =>
      `${p.rounds} round${p.rounds === 1 ? '' : 's'} · ${p.size}×${p.size}`,
  },
  'play.streakLabel': {
    tr: (p: { count: number }) => `Seri ${p.count}`,
    en: (p: { count: number }) => `Streak ${p.count}`,
  },

  // --------------------------------------------- oyun tahtasındaki ipuçları
  'play.nBackHint': {
    tr: (p: { steps: number }) => `${p.steps} adım geriye bak`,
    en: (p: { steps: number }) => `Look ${p.steps} step${p.steps === 1 ? '' : 's'} back`,
  },
  'play.holdTargets': {
    tr: (p: { count: number }) => `${p.count} hedefi aklında tut`,
    en: (p: { count: number }) => `Remember ${p.count} target${p.count === 1 ? '' : 's'}`,
  },
  'play.nextSymbol': {
    tr: (p: { symbol: string }) => `Sıradaki: ${p.symbol}`,
    en: (p: { symbol: string }) => `Next: ${p.symbol}`,
  },
  'play.foldedAndPunched': {
    tr: (p: { folds: string }) => `Kağıt ${p.folds} katlandı ve delindi`,
    en: (p: { folds: string }) => `Folded ${p.folds} and punched`,
  },
  'play.relationLabel': {
    tr: (p: { relation: string }) => `İlişki: ${p.relation}`,
    en: (p: { relation: string }) => `Relation: ${p.relation}`,
  },
  'play.ruleLabel': {
    tr: (p: { rule: string }) => `Kural: ${p.rule}`,
    en: (p: { rule: string }) => `Rule: ${p.rule}`,
  },
  'play.answerWas': {
    tr: (p: { answer: string }) => `Doğrusu ${p.answer}`,
    en: (p: { answer: string }) => `The answer was ${p.answer}`,
  },
  'play.answerWasWithRule': {
    tr: (p: { answer: number; rule: string }) => `Doğrusu ${p.answer} · ${p.rule}`,
    en: (p: { answer: number; rule: string }) => `The answer was ${p.answer} · ${p.rule}`,
  },
  'play.reactionMedian': {
    tr: (p: { ms: number }) => `Tepki süren ${p.ms} ms`,
    en: (p: { ms: number }) => `Your reaction: ${p.ms} ms`,
  },
  'play.bestMs': {
    tr: (p: { ms: number }) => `En iyi ${p.ms} ms`,
    en: (p: { ms: number }) => `Best ${p.ms} ms`,
  },

  // --------------------------------------------------------- Hızlı Karar
  'play.sameOrDifferent': {
    tr: 'Nokta sayıları aynı mı?',
    en: 'Are the dot counts the same?',
  },
  'play.whichSide': { tr: 'Hangi tarafta daha çok nokta var?', en: 'Which side has more dots?' },
  'play.different': { tr: 'Farklı', en: 'Different' },
  // `play.left` / `play.right` yön ("Sola", "Sağa"); burada taraf adı gerekiyor.
  'play.sideLeft': { tr: 'Sol', en: 'Left' },
  'play.sideRight': { tr: 'Sağ', en: 'Right' },

  // ------------------------------------------- Sayı Dizisi kural adları
  'rule.constant-step': { tr: 'sabit ekleme', en: 'constant step' },
  'rule.constant-factor': { tr: 'sabit çarpan', en: 'constant factor' },
  'rule.squares': { tr: 'tam kareler', en: 'perfect squares' },
  'rule.growing-gap': { tr: 'artan fark', en: 'growing gap' },
  'rule.sum-of-previous': { tr: 'önceki ikisinin toplamı', en: 'sum of the previous two' },
  'rule.multiply-and-add': { tr: 'çarp ve ekle', en: 'multiply and add' },

  // ------------------------------------------- erişilebilirlik etiketleri
  'play.rowColumn': {
    tr: (p: { row: number; column: number }) => `${p.row}. satır ${p.column}. sütun`,
    en: (p: { row: number; column: number }) => `Row ${p.row}, column ${p.column}`,
  },
  'play.optionN': {
    tr: (p: { index: number }) => `${p.index}. seçenek`,
    en: (p: { index: number }) => `Option ${p.index}`,
  },
  'play.lightN': {
    tr: (p: { index: number }) => `${p.index}. ışık`,
    en: (p: { index: number }) => `Light ${p.index}`,
  },
  'play.tubeN': {
    tr: (p: { index: number }) => `${p.index}. şişe`,
    en: (p: { index: number }) => `Tube ${p.index}`,
  },
  'play.squareN': {
    tr: (p: { index: number }) => `${p.index}. kare`,
    en: (p: { index: number }) => `Square ${p.index}`,
  },
  'play.dotN': {
    tr: (p: { index: number }) => `${p.index}. nokta`,
    en: (p: { index: number }) => `Dot ${p.index}`,
  },
  'play.shadowN': {
    tr: (p: { index: number }) => `${p.index}. gölge`,
    en: (p: { index: number }) => `Shadow ${p.index}`,
  },
  'play.pieceN': {
    tr: (p: { index: number }) => `${p.index}. parça`,
    en: (p: { index: number }) => `Piece ${p.index}`,
  },
  'play.ballN': {
    tr: (p: { index: number }) => `${p.index}. top`,
    en: (p: { index: number }) => `Ball ${p.index}`,
  },
  'play.circlesCount': {
    tr: (p: { count: number }) => `${p.count} daire`,
    en: (p: { count: number }) => `${p.count} circle${p.count === 1 ? '' : 's'}`,
  },

  // ---------------------------------------------------------------- testler
  'tests.title': { tr: 'Testler', en: 'Tests' },
  'tests.filterIq': { tr: 'IQ Testleri', en: 'IQ Tests' },
  'tests.filterFun': { tr: 'Keşfet', en: 'Discover' },
  'tests.sectionIq': { tr: 'IQ Testleri', en: 'IQ Tests' },
  'tests.sectionFun': { tr: 'Keşfet', en: 'Discover' },
  'test.notFound': { tr: 'Test bulunamadı', en: 'Test not found' },
  'test.skillsLabel': { tr: 'Ölçülecek yetenekler', en: 'What this test measures' },
  'test.start': { tr: 'Teste başla', en: 'Start test' },
  'test.exit': { tr: 'Testten çık', en: 'Leave test' },
  'test.questionCounter': {
    tr: (p: { index: number; total: number }) => `Soru ${p.index}/${p.total}`,
    en: (p: { index: number; total: number }) => `Question ${p.index}/${p.total}`,
  },
  'test.progressLabel': { tr: 'Test ilerlemesi', en: 'Test progress' },

  // --------------------------------------------------- test yetenek kartları
  'skill.number_series': { tr: 'Örüntü tanıma', en: 'Pattern recognition' },
  'skill.number_seriesHint': {
    tr: 'Sayı dizilerindeki kuralı bulma',
    en: 'Finding the rule behind a number sequence',
  },
  'skill.arithmetic': { tr: 'Aritmetik akıl yürütme', en: 'Arithmetic reasoning' },
  'skill.arithmeticHint': {
    tr: 'İşlem sırasını doğru kurma',
    en: 'Getting the order of operations right',
  },
  'skill.verbal_analogy': { tr: 'Sözel akıl yürütme', en: 'Verbal reasoning' },
  'skill.verbal_analogyHint': {
    tr: 'Kavramlar arası bağ kurma',
    en: 'Linking one concept to another',
  },
  'skill.odd_one_out': { tr: 'Sınıflandırma', en: 'Classification' },
  'skill.odd_one_outHint': {
    tr: 'Ortak özelliği ve istisnayı görme',
    en: 'Spotting the shared trait and the exception',
  },
  'skill.logic': { tr: 'Mantıksal çıkarım', en: 'Logical deduction' },
  'skill.logicHint': { tr: 'Öncüllerden sonuca ulaşma', en: 'Getting from premises to conclusion' },
  'skill.coding': { tr: 'Kural uygulama', en: 'Applying a rule' },
  'skill.codingHint': {
    tr: 'Verilen kuralı yeni duruma taşıma',
    en: 'Carrying a given rule to a new case',
  },
  'skill.matrix': { tr: 'Görsel örüntü', en: 'Visual pattern' },
  'skill.matrixHint': { tr: 'Şekil ilişkilerini tamamlama', en: 'Completing shape relationships' },
  'skill.shape_analogy': { tr: 'Şekil analojisi', en: 'Shape analogy' },
  'skill.shape_analogyHint': {
    tr: 'Şekiller arası ilişki kurma',
    en: 'Relating one shape to another',
  },
  'skill.spatial': { tr: 'Uzamsal muhakeme', en: 'Spatial reasoning' },
  'skill.spatialHint': {
    tr: 'Zihinde döndürme ve katlama',
    en: 'Rotating and folding in your head',
  },

  // --------------------------------------------------------------- profil
  'profile.axes': { tr: 'Eksenler', en: 'Axes' },
  'profile.yourMap': { tr: 'Haritan', en: 'Your map' },
  'profile.percent': {
    tr: (p: { value: number }) => `%${p.value}`,
    en: (p: { value: number }) => `${p.value}%`,
  },
  'profile.highest': {
    tr: (p: { trait: string }) => `En yüksek eksenin: ${p.trait}.`,
    en: (p: { trait: string }) => `Your highest axis: ${p.trait}.`,
  },
  'profile.lowest': {
    tr: (p: { trait: string }) => `En düşük eksenin: ${p.trait}.`,
    en: (p: { trait: string }) => `Your lowest axis: ${p.trait}.`,
  },
  'profile.evenSpread': {
    tr: 'Eksenler birbirine çok yakın çıktı; öne çıkan ya da geride kalan bir yan yok.',
    en: 'The axes came out very close; nothing stands out either way.',
  },

  // ------------------------------------------------------------ beyin yaşı
  'brainAge.stepCount': {
    tr: (p: { count: number; minutes: number }) => `${p.count} ölçüm · ${p.minutes} dk`,
    en: (p: { count: number; minutes: number }) => `${p.count} measurements · ${p.minutes} min`,
  },
  'brainAge.stepProgress': {
    tr: (p: { index: number; total: number; title: string }) =>
      `Ölçüm ${p.index}/${p.total} · ${p.title}`,
    en: (p: { index: number; total: number; title: string }) =>
      `Measurement ${p.index}/${p.total} · ${p.title}`,
  },
  'brainAge.trialCounter': {
    tr: (p: { done: number; total: number }) => `${p.done}/${p.total} ölçüm alındı`,
    en: (p: { done: number; total: number }) => `${p.done}/${p.total} measured`,
  },
  'brainAge.livesLeft': {
    tr: (p: { lives: number }) => `${p.lives} hak kaldı`,
    en: (p: { lives: number }) => `${p.lives} ${p.lives === 1 ? 'life' : 'lives'} left`,
  },
  'brainAge.scaleNote': {
    tr: 'Dört ölçümden türetilen ölçek değeri',
    en: 'A scale value derived from four measurements',
  },
  'brainAge.measurements': { tr: 'Ölçümlerin', en: 'Your measurements' },
  'brainAge.measure.reaction': { tr: 'Tepki süresi', en: 'Reaction time' },
  'brainAge.measure.memory': { tr: 'Hane menzili', en: 'Digit span' },
  'brainAge.measure.speed': { tr: 'İşlem hızı', en: 'Processing speed' },
  'brainAge.measure.focus': { tr: 'Dürtü kontrolü', en: 'Impulse control' },
  'brainAge.valueMs': {
    tr: (p: { value: number }) => `${p.value} ms`,
    en: (p: { value: number }) => `${p.value} ms`,
  },
  'brainAge.valueDigits': {
    tr: (p: { value: number }) => `${p.value} hane`,
    en: (p: { value: number }) => `${p.value} digits`,
  },
  'brainAge.valuePerMinute': {
    tr: (p: { value: number }) => `${p.value} doğru/dk`,
    en: (p: { value: number }) => `${p.value} correct/min`,
  },
  'brainAge.valuePercent': {
    tr: (p: { value: number }) => `%${p.value}`,
    en: (p: { value: number }) => `${p.value}%`,
  },
  'brainAge.strongest': {
    tr: (p: { measure: string }) => `En güçlü ölçümün: ${p.measure}.`,
    en: (p: { measure: string }) => `Your strongest measurement: ${p.measure}.`,
  },
  'brainAge.evenSpread': {
    tr: 'Dört ölçüm birbirine çok yakın çıktı; öne çıkan ya da geride kalan bir alan yok.',
    en: 'The four measurements came out very close; no area stands out either way.',
  },
  'brainAge.weakest': {
    tr: (p: { measure: string }) => `En çok gelişime açık olan: ${p.measure}.`,
    en: (p: { measure: string }) => `The one with most room to grow: ${p.measure}.`,
  },

  // ---------------------------------------------------------------- sonuç
  'band.developing': { tr: 'Gelişime açık', en: 'Developing' },
  'band.average': { tr: 'Ortalama', en: 'Average' },
  'band.aboveAverage': { tr: 'Ortalama üstü', en: 'Above average' },
  'band.superior': { tr: 'Üstün', en: 'Superior' },
  'band.exceptional': { tr: 'Olağanüstü', en: 'Exceptional' },
  'dimension.verbal': { tr: 'Sözel', en: 'Verbal' },
  'dimension.numeric': { tr: 'Sayısal', en: 'Numeric' },
  'dimension.visual': { tr: 'Görsel', en: 'Visual' },
  'dimension.logical': { tr: 'Mantıksal', en: 'Logical' },
  'result.percentile': {
    tr: (p: { percent: string }) => `Katılanların %${p.percent}'inden daha iyisin`,
    en: (p: { percent: string }) => `You scored better than ${p.percent}% of participants`,
  },
  'result.correctAndTime': {
    tr: (p: { correct: number; total: number; minutes: number }) =>
      `${p.correct}/${p.total} doğru · ${p.minutes} dk`,
    en: (p: { correct: number; total: number; minutes: number }) =>
      `${p.correct}/${p.total} correct · ${p.minutes} min`,
  },
  'result.subscores': { tr: 'Alt boyutlar', en: 'Sub-dimensions' },
  'result.subscoresEmpty': {
    tr: 'Bu oturumda alt boyut raporu için yeterli soru yoktu.',
    en: 'This session did not have enough questions for a sub-dimension report.',
  },
  'result.dimensionScoreLabel': {
    tr: (p: { dimension: string }) => `${p.dimension} puanı`,
    en: (p: { dimension: string }) => `${p.dimension} score`,
  },
  'result.highlights': { tr: 'Senin için öne çıkanlar', en: 'Highlights for you' },
  'result.strongestPrefix': { tr: 'En güçlü alanın ', en: 'Your strongest area is ' },
  'result.strongestSuffix': {
    tr: (p: { score: number }) =>
      ` (${p.score}). Bu alandaki oyunlarda zorluk seviyeni yükseltebilirsin.`,
    en: (p: { score: number }) =>
      ` (${p.score}). You can raise the difficulty in games from this area.`,
  },
  'result.weakestPrefix': { tr: 'En çok gelişime açık alanın ', en: 'Your weakest area is ' },
  'result.weakestSuffix': {
    tr: (p: { score: number }) => ` (${p.score}). Günlük planına bu kategoriden bir oyun eklendi.`,
    en: (p: { score: number }) =>
      ` (${p.score}). A game from this category joined your daily plan.`,
  },
  'result.lockedTitle': { tr: 'Detaylı rapor', en: 'Detailed report' },
  'result.lockedBody': {
    tr: 'Güçlü ve zayıf alanlarının açıklaması, yaş grubuna göre karşılaştırma ve sana özel gelişim planı PRO ile açılır.',
    en: 'An explanation of your strong and weak areas, a comparison with your age group and a plan made for you — all with PRO.',
  },
  'result.unlockPro': { tr: 'PRO ile aç', en: 'Unlock with PRO' },
  'result.share': { tr: 'Sonucu paylaş', en: 'Share result' },
  'result.shareText': {
    tr: (p: { iq: number; test: string }) => `NeuroPeak "${p.test}" sonucum: ${p.iq}. Sen de dene!`,
    en: (p: { iq: number; test: string }) => `My NeuroPeak "${p.test}" score: ${p.iq}. Try it too!`,
  },

  // --------------------------------------------------------------- ilerleme
  'progress.title': { tr: 'İlerleme', en: 'Progress' },
  'progress.scoreLabel': { tr: 'NeuroPeak skoru', en: 'NeuroPeak score' },
  'progress.scoreBodyPlayed': {
    tr: 'Skor beş eksenin ağırlıklı ortalaması. Oyun oynadıkça eksenler güncel performansına yaklaşır.',
    en: 'The score is a weighted average of five axes. As you play, each axis moves towards your current performance.',
  },
  'progress.scoreBodyEmpty': {
    tr: 'Henüz oyun oynamadın. Skor 50’den başlar ve oynadıkça performansına göre değişir.',
    en: 'You have not played yet. The score starts at 50 and moves with your performance.',
  },
  'progress.brainMap': { tr: 'Beyin haritası', en: 'Brain map' },
  'progress.brainMapNote': {
    tr: (p: { start: number }) =>
      `Harita bir ölçüm değil, oyunlardaki güncel performansının özeti. Her eksen ${p.start} puandan başlar.`,
    en: (p: { start: number }) =>
      `The map is not a measurement — it summarises your current performance in games. Each axis starts at ${p.start}.`,
  },
  'progress.axisScoreLabel': {
    tr: (p: { axis: string }) => `${p.axis} puanı`,
    en: (p: { axis: string }) => `${p.axis} score`,
  },
  'progress.suggestionSection': { tr: 'Bugün neye çalış?', en: 'What to train today' },
  'progress.suggestionBody': {
    tr: (p: { axis: string }) => `En düşük eksenin ${p.axis} — bu oyun oraya çalışıyor`,
    en: (p: { axis: string }) => `${p.axis} is your lowest axis — this game trains it`,
  },
  'progress.playGameLabel': {
    tr: (p: { game: string }) => `${p.game} oyna`,
    en: (p: { game: string }) => `Play ${p.game}`,
  },
  'progress.thisWeek': { tr: 'Bu hafta', en: 'This week' },
  'progress.weekMeta': {
    tr: (p: { xp: number; rounds: number }) => `${p.xp} XP · ${p.rounds} tur`,
    en: (p: { xp: number; rounds: number }) => `${p.xp} XP · ${p.rounds} rounds`,
  },
  'progress.categorySection': { tr: 'Kategori dağılımı', en: 'Category split' },
  'progress.categoryRoundsLabel': {
    tr: (p: { category: string }) => `${p.category} tur sayısı`,
    en: (p: { category: string }) => `${p.category} rounds`,
  },
  'progress.badgesSection': { tr: 'Rozetler', en: 'Badges' },

  // ------------------------------------------------------------------- lig
  'league.title': { tr: 'Lig', en: 'League' },
  'league.tier.bronze': { tr: 'Bronz Lig', en: 'Bronze League' },
  'league.tier.silver': { tr: 'Gümüş Lig', en: 'Silver League' },
  'league.tier.gold': { tr: 'Altın Lig', en: 'Gold League' },
  'league.tier.platinum': { tr: 'Platin Lig', en: 'Platinum League' },
  'league.tier.diamond': { tr: 'Elmas Lig', en: 'Diamond League' },
  'league.tier.legend': { tr: 'Efsane Lig', en: 'Legend League' },
  'league.outcome.promote': { tr: 'yükseldin', en: 'you were promoted' },
  'league.outcome.hold': { tr: 'ligde kaldın', en: 'you stayed up' },
  'league.outcome.relegate': { tr: 'düştün', en: 'you were relegated' },
  'league.remaining': {
    tr: (p: { time: string }) => `Hafta bitimine ${p.time}`,
    en: (p: { time: string }) => `${p.time} left this week`,
  },
  'league.noteJoin': {
    tr: (p: { count: number }) => `İlk ${p.count} bir üst lige yükselir.`,
    en: (p: { count: number }) => `The top ${p.count} move up a league.`,
  },
  'league.notePromotionZone': {
    tr: (p: { rank: number; relegation: number }) =>
      `${p.rank}. sıradasın — terfi bölgesindesin. Son ${p.relegation} bir alt lige düşer.`,
    en: (p: { rank: number; relegation: number }) =>
      `You are #${p.rank} — inside the promotion zone. The bottom ${p.relegation} go down a league.`,
  },
  'league.noteBehind': {
    tr: (p: { rank: number; xp: number }) =>
      `${p.rank}. sıradasın — terfi bölgesine ${p.xp} XP kaldı.`,
    en: (p: { rank: number; xp: number }) =>
      `You are #${p.rank} — ${p.xp} XP from the promotion zone.`,
  },
  'league.lastWeek': {
    tr: (p: { rank: number }) => `Geçen hafta ${p.rank}. oldun`,
    en: (p: { rank: number }) => `You finished #${p.rank} last week`,
  },
  'league.lastWeekBody': {
    tr: (p: { tier: string; outcome: string }) => `${p.tier} sonunda ${p.outcome}.`,
    en: (p: { tier: string; outcome: string }) => `At the end of ${p.tier}, ${p.outcome}.`,
  },
  'league.tableSection': { tr: 'Haftalık sıralama', en: 'Weekly standings' },
  'league.tableMeta': {
    tr: (p: { count: number }) => `${p.count} kişi`,
    en: (p: { count: number }) => `${p.count} players`,
  },
  'league.promotionZone': { tr: 'Terfi bölgesi', en: 'Promotion zone' },
  'league.relegationZone': { tr: 'Düşme bölgesi', en: 'Relegation zone' },
  'league.promoteBadge': { tr: 'Terfi', en: 'Up' },
  'league.relegateBadge': { tr: 'Düşme', en: 'Down' },
  'league.practiceTitle': { tr: 'Deneme ligi', en: 'Practice league' },
  'league.practiceBody': {
    tr: 'Rakipler şimdilik cihazında üretiliyor; gerçek oyuncular sunucu bağlandığında gelecek. Sıralama, terfi ve düşme kuralları aynı çalışıyor.',
    en: 'Opponents are generated on your device for now; real players arrive once the server is connected. Ranking, promotion and relegation work the same way.',
  },
  'league.you': { tr: 'Sen', en: 'You' },
  'league.remainingDays': {
    tr: (p: { days: number; hours: number }) => `${p.days} gün ${p.hours} saat`,
    en: (p: { days: number; hours: number }) => `${p.days}d ${p.hours}h`,
  },
  'league.remainingHours': {
    tr: (p: { hours: number; minutes: number }) => `${p.hours} saat ${p.minutes} dakika`,
    en: (p: { hours: number; minutes: number }) => `${p.hours}h ${p.minutes}m`,
  },
  'league.remainingMinutes': {
    tr: (p: { minutes: number }) => `${p.minutes} dakika`,
    en: (p: { minutes: number }) => `${p.minutes}m`,
  },

  // ---------------------------------------------------------------- kutlama
  'celebration.levelUpBody': {
    tr: 'Yeni seviyeye ulaştın. Bonus yıldızların hesabına eklendi.',
    en: 'You reached a new level. Your bonus stars have been added.',
  },
  'celebration.streakBody': {
    tr: 'Üst üste geldin. Yarın da gel, seriyi büyüt.',
    en: 'You showed up again. Come back tomorrow and grow the streak.',
  },
  'celebration.tasksTitle': { tr: 'Görev tamam', en: 'Tasks done' },
  'celebration.starsEarned': {
    tr: (p: { stars: number }) => `+${p.stars} yıldız kazandın.`,
    en: (p: { stars: number }) => `You earned +${p.stars} stars.`,
  },
  'celebration.badgeCount': {
    tr: (p: { count: number }) => `${p.count} yeni rozet`,
    en: (p: { count: number }) => `${p.count} new badges`,
  },
  'celebration.badgeMultiBody': {
    tr: (p: { title: string; others: number; stars: number }) =>
      `${p.title} ve ${p.others} rozet daha. +${p.stars} yıldız hesabına eklendi.`,
    en: (p: { title: string; others: number; stars: number }) =>
      `${p.title} and ${p.others} more. +${p.stars} stars added to your account.`,
  },
  'celebration.badgeSingleBody': {
    tr: (p: { stars: number }) => `Yeni rozet kazandın. +${p.stars} yıldız hesabına eklendi.`,
    en: (p: { stars: number }) =>
      `You earned a new badge. +${p.stars} stars added to your account.`,
  },

  // ---------------------------------------------------------- hafta günleri
  'day.mon': { tr: 'Pt', en: 'Mo' },
  'day.tue': { tr: 'Sa', en: 'Tu' },
  'day.wed': { tr: 'Ça', en: 'We' },
  'day.thu': { tr: 'Pe', en: 'Th' },
  'day.fri': { tr: 'Cu', en: 'Fr' },
  'day.sat': { tr: 'Ct', en: 'Sa' },
  'day.sun': { tr: 'Pa', en: 'Su' },

  // --------------------------------------------------------------- rozetler
  'badgeTier.1': { tr: 'Bronz', en: 'Bronze' },
  'badgeTier.2': { tr: 'Gümüş', en: 'Silver' },
  'badgeTier.3': { tr: 'Altın', en: 'Gold' },
  'badgeTier.4': { tr: 'Platin', en: 'Platinum' },
  'badge.percentProgress': {
    tr: (p: { percent: number }) => `%${p.percent}`,
    en: (p: { percent: number }) => `${p.percent}%`,
  },
  'badge.lockedProgress': {
    tr: (p: { current: number; target: number }) => `${p.current} / ${p.target}`,
    en: (p: { current: number; target: number }) => `${p.current} / ${p.target}`,
  },

  // ----------------------------------------------------------- ödüllü reklam
  'ads.rewardTitle': {
    tr: (p: { stars: number }) => `+${p.stars} yıldız`,
    en: (p: { stars: number }) => `+${p.stars} stars`,
  },
  'ads.rewardBody': {
    tr: (p: { left: number; limit: number }) =>
      `Kısa bir reklam izle. Bugün ${p.left}/${p.limit} hakkın kaldı.`,
    en: (p: { left: number; limit: number }) =>
      `Watch a short ad. ${p.left} of ${p.limit} left today.`,
  },
  'ads.watch': { tr: 'Reklam izle', en: 'Watch ad' },
  'ads.dismissed': {
    tr: 'Reklam sonuna kadar izlenmedi, yıldız eklenmedi.',
    en: 'The ad was not watched to the end, so no stars were added.',
  },
  'ads.unavailable': {
    tr: 'Şu anda uygun reklam yok, sonra tekrar dene.',
    en: 'No ad is available right now — try again later.',
  },

  // ----------------------------------------------------------------- ayarlar
  'settings.title': { tr: 'Ayarlar', en: 'Settings' },
  'settings.preferences': { tr: 'Tercihler', en: 'Preferences' },
  'settings.sound': { tr: 'Ses', en: 'Sound' },
  'settings.language': { tr: 'Dil', en: 'Language' },
  'settings.notifications': { tr: 'Bildirimler', en: 'Notifications' },
  'settings.about': { tr: 'Hakkında', en: 'About' },
  'settings.privacy': { tr: 'Gizlilik Politikası', en: 'Privacy Policy' },
  'settings.terms': { tr: 'Kullanım Şartları', en: 'Terms of Use' },
  'settings.support': { tr: 'E-posta Desteği', en: 'Email support' },
  'settings.supportSubject': { tr: 'NeuroPeak desteği', en: 'NeuroPeak support' },
  'settings.developer': { tr: 'Geliştirici', en: 'Developer' },
  'settings.designSystem': { tr: 'Tasarım sistemi', en: 'Design system' },
  'settings.resetOnboarding': { tr: "Onboarding'i sıfırla", en: 'Reset onboarding' },
  'settings.togglePro': { tr: 'PRO durumunu değiştir', en: 'Toggle PRO state' },
  'settings.languageSheetTitle': { tr: 'Dili seç', en: 'Choose language' },
} as const satisfies StringCatalogue;

export type StringKey = keyof typeof STRINGS;
