// ─────────────────────────────────────────────────────────────────────────────
//  ✎  EVERYTHING ABOUT HER LIVES HERE.
//
//  To add her photos:
//    1. Put the image files in the  photos/  folder (JPG or PNG, any size;
//       around 1600px on the long side is plenty).
//    2. Write each file name in `src` below, e.g.  src: 'photos/01.jpg'.
//  Any photo left as  src: ''  shows a film placeholder instead.
//  Captions are in English, French and Korean; change them to fit each photo.
// ─────────────────────────────────────────────────────────────────────────────

export const HER = {
  name: { latin: 'Mihwa', ko: '미화', hanja: '美花' },
  instagram: 'mulnaengmyeonn',

  // Which photo opens the site, seen through the ink (index in PHOTOS, from 0).
  heroPhoto: 0,
  // Photos circled in red on the contact sheet (indexes in PHOTOS).
  favourites: [0, 4, 7, 10],

  // Short lines for the Instagram card.
  bio: {
    en: ['International relations', 'Korean ink painting · film', 'Seoul ↔ Paris'],
    fr: ['Relations internationales', 'Peinture à l’encre coréenne · argentique', 'Séoul ↔ Paris'],
    ko: ['국제관계학', '수묵화 · 필름 사진', '서울 ↔ 파리'],
  },

  // Field notes: a few true things about her.
  notes: [
    { k: { en: 'Studies', fr: 'Études', ko: '전공' }, v: { en: 'International relations', fr: 'Relations internationales', ko: '국제관계학' } },
    { k: { en: 'Roots', fr: 'Racines', ko: '뿌리' }, v: { en: 'Korean & French', fr: 'Coréennes & françaises', ko: '한국 & 프랑스' } },
    { k: { en: 'Loves', fr: 'Adore', ko: '좋아하는 것' }, v: { en: 'Korean ink painting (수묵화)', fr: 'La peinture à l’encre coréenne (수묵화)', ko: '수묵화' } },
    { k: { en: 'Aesthetic', fr: 'Esthétique', ko: '감성' }, v: { en: 'Film grain and soft light', fr: 'Grain argentique et lumière douce', ko: '필름 입자와 부드러운 빛' } },
    { k: { en: 'Handle', fr: 'Pseudo', ko: '아이디' }, v: { en: '@mulnaengmyeonn, like the cold noodles', fr: '@mulnaengmyeonn, comme les nouilles froides', ko: '@mulnaengmyeonn, 그 물냉면 맞아요' } },
    { k: { en: 'Cuteness', fr: 'Mignonnerie', ko: '귀여움' }, v: { en: 'Scientifically proven', fr: 'Scientifiquement prouvée', ko: '과학적으로 증명됨' } },
  ],
};

// aspect: width / height, used for placeholders (real photos use their own shape)
export const PHOTOS = [
  { src: '', aspect: 4 / 5, caption: { en: 'the look', fr: 'le regard', ko: '그 눈빛' } },
  { src: '', aspect: 4 / 5, caption: { en: 'golden hour', fr: 'l’heure dorée', ko: '골든 아워' } },
  { src: '', aspect: 3 / 4, caption: { en: 'mid-laugh', fr: 'en plein fou rire', ko: '웃음 터진 순간' } },
  { src: '', aspect: 1, caption: { en: 'the outfit', fr: 'la tenue', ko: '오늘의 착장' } },
  { src: '', aspect: 4 / 5, caption: { en: 'the pose', fr: 'la pose', ko: '그 포즈' } },
  { src: '', aspect: 3 / 4, caption: { en: 'Seoul mood', fr: 'humeur Séoul', ko: '서울 무드' } },
  { src: '', aspect: 4 / 5, caption: { en: 'Paris mood', fr: 'humeur Paris', ko: '파리 무드' } },
  { src: '', aspect: 4 / 5, caption: { en: 'main character', fr: 'personnage principal', ko: '주인공' } },
  { src: '', aspect: 1, caption: { en: 'soft focus', fr: 'flou doux', ko: '소프트 포커스' } },
  { src: '', aspect: 3 / 4, caption: { en: 'caught off guard', fr: 'prise au dépourvu', ko: '방심한 순간' } },
  { src: '', aspect: 4 / 5, caption: { en: 'iconic', fr: 'iconique', ko: '레전드' } },
  { src: '', aspect: 4 / 5, caption: { en: 'last frame', fr: 'dernière image', ko: '마지막 컷' } },
];

// ✎ The letter at the end. One string per paragraph.
export const LETTER = {
  en: {
    body: [
      'Dear Mihwa,',
      'This little site is a roll of film with only you on it. The ink is for the paintings you love, the grain is for your eye, and the poses are all yours.',
      'Keep studying the world. It is lucky to have someone like you paying such close attention to it.',
      'And never change your handle. Mul-naengmyeon is the correct choice.',
    ],
    sign: '— your friend',
  },
  fr: {
    body: [
      'Chère Mihwa,',
      'Ce petit site est une pellicule où il n’y a que toi. L’encre, c’est pour les peintures que tu aimes ; le grain, pour ton œil ; et les poses, elles sont toutes à toi.',
      'Continue d’étudier le monde. Il a de la chance que quelqu’un comme toi le regarde d’aussi près.',
      'Et ne change jamais de pseudo : le mul-naengmyeon, c’est le bon choix.',
    ],
    sign: '— avec toute mon affection',
  },
  ko: {
    body: [
      '미화에게,',
      '이 작은 사이트는 너만 찍힌 필름 한 롤이야. 먹은 네가 좋아하는 수묵화를 위해, 필름 입자는 너의 감각을 위해, 그리고 포즈는 전부 네 거야.',
      '계속 세상을 공부해 줘. 너처럼 세상을 자세히 들여다보는 사람이 있다는 건 세상한테 행운이니까.',
      '그리고 아이디는 절대 바꾸지 마. 물냉면이 정답이야.',
    ],
    sign: '— 너의 친구가',
  },
};
