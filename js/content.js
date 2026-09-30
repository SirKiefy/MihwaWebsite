// ─────────────────────────────────────────────────────────────────────────────
//  All words on the site live here, in three languages.
//  ✎ Personalise the letter below (LETTER) — it is written to be edited.
// ─────────────────────────────────────────────────────────────────────────────

export const LANGS = ['en', 'fr', 'ko'];

/** ✎ The letter at the end of the page. Each paragraph is one string. */
export const LETTER = {
  en: {
    body: [
      'Dear Mihwa,',
      'You carry two languages, two homes, and a thousand questions about the world. You find poetry in treaties and politics in plum blossoms — and somehow both make you smile.',
      'I hope your studies take you into every room on that globe. And wherever you end up, may there be good ink, soft hanji, and people who adore you.',
      'Like the old painters, the world will keep drawing clouds around you. Let it: that is only so everyone can see you shine.',
    ],
    sign: '— with love, from your friend',
  },
  fr: {
    body: [
      'Chère Mihwa,',
      'Tu portes deux langues, deux maisons et mille questions sur le monde. Tu trouves de la poésie dans les traités et de la politique dans les fleurs de prunier — et, allez savoir pourquoi, les deux te font sourire.',
      'J’espère que tes études t’ouvriront chacune des salles de ce globe. Et où que tu ailles, qu’il y ait de la bonne encre, du hanji bien doux, et des gens qui t’adorent.',
      'Comme les anciens peintres, le monde continuera de dessiner des nuages autour de toi. Laisse-le faire : ce n’est que pour que tout le monde te voie briller.',
    ],
    sign: '— avec toute mon affection',
  },
  ko: {
    body: [
      '미화에게,',
      '너는 두 개의 언어와 두 개의 집, 그리고 세상을 향한 수많은 질문을 품고 있지. 조약 속에서 시를 찾고 매화 속에서 정치를 읽는, 그리고 그 둘 모두에 웃을 줄 아는 사람.',
      '네 공부가 저 지구본 위의 모든 방으로 너를 데려가길 바라. 그리고 어디에 있든 좋은 먹과 부드러운 한지, 너를 아끼는 사람들이 늘 곁에 있기를.',
      '옛 화가들처럼 세상은 네 둘레에 구름을 그리겠지만, 괜찮아. 그건 모두가 빛나는 너를 볼 수 있게 하려는 거니까.',
    ],
    sign: '— 너의 친구가',
  },
};

export const STRINGS = {
  en: {
    loader: 'Grinding the ink…',
    sound: 'Gayageum sound on / off',
    'nav.hero': 'Mountains', 'nav.moon': 'The moon', 'nav.world': 'The world', 'nav.ties': '140 years',
    'nav.gentlemen': 'Four Gentlemen', 'nav.studio': 'Paint', 'nav.letter': 'Letter',

    'hero.eyebrow': 'A small gift, painted in ink',
    'hero.sub': 'Between Seoul and Paris, between ink and the wide world.',
    'hero.hint': 'Click the mountains to scatter blossoms · scroll to begin',
    'hero.hint.touch': 'Tap the mountains to scatter blossoms · scroll to begin',
    'hero.plate': 'Sansuhwa — a landscape after the “true-view” style of Jeong Seon (1676–1759)',

    'moon.kicker': 'I · The moon · 달',
    'moon.title': 'Under the same moon',
    'moon.body': 'Old Korean painters could paint the moon without ever touching it. They washed ink into the clouds around it and let the bare paper glow — <span class="ko-inline">홍운탁월</span>, <em>painting the clouds to reveal the moon</em>. Tonight, the same moon rises over Namsan and over the Seine.',
    'moon.seoul': 'Seoul', 'moon.paris': 'Paris',
    'moon.dist': '{d} km as the crane flies',
    'moon.note.behind': 'Right now Paris is {h} hours behind Seoul — apart, yet under one sky.',

    'world.kicker': 'II · The world · 세계',
    'world.title': 'A world to understand',
    'world.body': 'International relations is the art of reading the lines between places: treaties and trade routes, old wounds and new friendships. Here are some of the rooms where the world talks to itself. Turn the globe, or choose a place.',
    'world.hint': 'drag to turn the world',
    'world.fromSeoul': 'from Seoul', 'world.fromParis': 'from Paris', 'world.coords': 'coordinates',
    'world.home': 'home',

    'lex.kicker': 'Words of diplomacy · 외교의 낱말',
    'lex.sub': 'Hover or tap a word to reveal its hanja — the Chinese characters hiding inside everyday Korean.',

    'ties.kicker': 'III · France & Korea · 한불',
    'ties.title': '140 years of a friendship',
    'ties.body': 'France and Korea signed their first treaty in 1886. Keep scrolling to unroll the story.',

    'gent.kicker': 'IV · Four Gentlemen · 사군자',
    'gent.title': 'The Four Gentlemen',
    'gent.body': 'Plum, orchid, chrysanthemum and bamboo: the first subjects every ink painter learns, each one a season and a virtue. Watch them paint themselves — click a scroll to paint it again.',
    'gent.again': 'paint again',

    'studio.kicker': 'V · Empty space · 여백의 미',
    'studio.title': 'The beauty of empty space',
    'studio.body': 'In Korean painting, what you leave unpainted matters as much as what you paint. Your turn: choose an ink, draw on the hanji, add a blossom — and don’t forget your seal.',
    'studio.dark': 'Dark ink', 'studio.mid': 'Mid ink', 'studio.pale': 'Pale ink',
    'studio.blossom': 'Blossom', 'studio.seal': 'Seal', 'studio.size': 'Brush size',
    'studio.clear': 'Wash away', 'studio.save': 'Save painting', 'studio.hint': 'draw here',
    'studio.saveHint': 'Your painting. Right-click or long-press it to save the image.',
    'studio.download': 'Download PNG', 'studio.close': 'Close',

    'letter.kicker': 'VI · A letter · 편지',
    'letter.title': 'For Mihwa',

    'footer.main': 'Painted with ink and code, for Mihwa · 2026',
    'footer.credits': 'Map: Natural Earth · 3D: three.js · Type: Nanum Brush Script, Gowun Batang, Cormorant Garamond',
    fallback: 'Your browser could not start WebGL, so the 3D landscape is resting. Everything else still works.',
  },

  fr: {
    loader: 'On broie l’encre…',
    sound: 'Son du gayageum : activer / couper',
    'nav.hero': 'Montagnes', 'nav.moon': 'La lune', 'nav.world': 'Le monde', 'nav.ties': '140 ans',
    'nav.gentlemen': 'Quatre Gentilshommes', 'nav.studio': 'Peindre', 'nav.letter': 'Lettre',

    'hero.eyebrow': 'Un petit cadeau, peint à l’encre',
    'hero.sub': 'Entre Séoul et Paris, entre l’encre et le vaste monde.',
    'hero.hint': 'Cliquez sur les montagnes pour semer des fleurs · défilez pour commencer',
    'hero.hint.touch': 'Touchez les montagnes pour semer des fleurs · défilez pour commencer',
    'hero.plate': 'Sansuhwa — paysage à la manière « vue véritable » de Jeong Seon (1676–1759)',

    'moon.kicker': 'I · La lune · 달',
    'moon.title': 'Sous la même lune',
    'moon.body': 'Les anciens peintres coréens savaient peindre la lune sans jamais la toucher : ils lavaient d’encre les nuages autour d’elle et laissaient briller le papier nu — <span class="ko-inline">홍운탁월</span>, <em>peindre les nuages pour révéler la lune</em>. Ce soir, la même lune se lève sur Namsan et sur la Seine.',
    'moon.seoul': 'Séoul', 'moon.paris': 'Paris',
    'moon.dist': '{d} km à vol de grue',
    'moon.note.behind': 'En ce moment, Paris a {h} heures de retard sur Séoul — loin, et pourtant sous le même ciel.',

    'world.kicker': 'II · Le monde · 세계',
    'world.title': 'Un monde à comprendre',
    'world.body': 'Les relations internationales sont l’art de lire les lignes entre les lieux : traités et routes commerciales, vieilles blessures et amitiés nouvelles. Voici quelques-unes des salles où le monde se parle à lui-même. Faites tourner le globe, ou choisissez un lieu.',
    'world.hint': 'glissez pour faire tourner le monde',
    'world.fromSeoul': 'depuis Séoul', 'world.fromParis': 'depuis Paris', 'world.coords': 'coordonnées',
    'world.home': 'maison',

    'lex.kicker': 'Les mots de la diplomatie · 외교의 낱말',
    'lex.sub': 'Survolez ou touchez un mot pour révéler ses hanja — les caractères chinois cachés dans le coréen de tous les jours.',

    'ties.kicker': 'III · France et Corée · 한불',
    'ties.title': '140 ans d’une amitié',
    'ties.body': 'La France et la Corée ont signé leur premier traité en 1886. Continuez à défiler pour dérouler l’histoire.',

    'gent.kicker': 'IV · Quatre Gentilshommes · 사군자',
    'gent.title': 'Les Quatre Gentilshommes',
    'gent.body': 'Prunier, orchidée, chrysanthème et bambou : les premiers sujets de tout peintre à l’encre, chacun une saison et une vertu. Regardez-les se peindre — cliquez sur un rouleau pour le repeindre.',
    'gent.again': 'repeindre',

    'studio.kicker': 'V · Le vide · 여백의 미',
    'studio.title': 'La beauté du vide',
    'studio.body': 'Dans la peinture coréenne, ce que l’on ne peint pas compte autant que ce que l’on peint. À vous : choisissez une encre, dessinez sur le hanji, ajoutez une fleur — et n’oubliez pas votre sceau.',
    'studio.dark': 'Encre dense', 'studio.mid': 'Encre moyenne', 'studio.pale': 'Encre claire',
    'studio.blossom': 'Fleur', 'studio.seal': 'Sceau', 'studio.size': 'Taille du pinceau',
    'studio.clear': 'Laver', 'studio.save': 'Enregistrer', 'studio.hint': 'dessinez ici',
    'studio.saveHint': 'Votre peinture. Faites un clic droit ou un appui long dessus pour enregistrer l’image.',
    'studio.download': 'Télécharger en PNG', 'studio.close': 'Fermer',

    'letter.kicker': 'VI · Une lettre · 편지',
    'letter.title': 'Pour Mihwa',

    'footer.main': 'Peint à l’encre et en code, pour Mihwa · 2026',
    'footer.credits': 'Carte : Natural Earth · 3D : three.js · Polices : Nanum Brush Script, Gowun Batang, Cormorant Garamond',
    fallback: 'Votre navigateur n’a pas pu lancer WebGL : le paysage 3D se repose. Tout le reste fonctionne.',
  },

  ko: {
    loader: '먹을 가는 중…',
    sound: '가야금 소리 켜기 / 끄기',
    'nav.hero': '산수', 'nav.moon': '달', 'nav.world': '세계', 'nav.ties': '140년',
    'nav.gentlemen': '사군자', 'nav.studio': '그리기', 'nav.letter': '편지',

    'hero.eyebrow': '먹으로 그린 작은 선물',
    'hero.sub': '서울과 파리 사이, 먹과 넓은 세상 사이.',
    'hero.hint': '산을 눌러 꽃잎을 날려 보세요 · 스크롤하여 시작',
    'hero.hint.touch': '산을 눌러 꽃잎을 날려 보세요 · 스크롤하여 시작',
    'hero.plate': '산수화 — 겸재 정선(1676–1759)의 진경산수를 따라',

    'moon.kicker': 'I · 달',
    'moon.title': '같은 달 아래',
    'moon.body': '옛 화가들은 달에 붓을 대지 않고도 달을 그렸습니다. 달 둘레의 구름에 먹을 번지게 하고, 비워 둔 종이가 스스로 빛나게 했지요. 이를 <span class="ko-inline">홍운탁월(烘雲托月)</span>이라 합니다. 오늘 밤에도 같은 달이 남산 위에, 그리고 센강 위에 떠오릅니다.',
    'moon.seoul': '서울', 'moon.paris': '파리',
    'moon.dist': '직선거리 {d} km',
    'moon.note.behind': '지금 파리는 서울보다 {h}시간 늦어요. 멀리 있어도, 같은 하늘 아래.',

    'world.kicker': 'II · 세계',
    'world.title': '이해하고 싶은 세계',
    'world.body': '국제관계학은 장소와 장소 사이의 선을 읽는 일입니다. 조약과 교역로, 오래된 상처와 새로운 우정까지. 세계가 스스로와 대화하는 방들을 모아 보았습니다. 지구본을 돌리거나 장소를 골라 보세요.',
    'world.hint': '드래그하여 지구를 돌려 보세요',
    'world.fromSeoul': '서울에서', 'world.fromParis': '파리에서', 'world.coords': '좌표',
    'world.home': '집',

    'lex.kicker': '외교의 낱말',
    'lex.sub': '낱말에 마우스를 올리거나 눌러 보세요. 우리말 속에 숨은 한자가 드러납니다.',

    'ties.kicker': 'III · 한불 140년',
    'ties.title': '140년의 우정',
    'ties.body': '1886년, 한국과 프랑스는 첫 조약을 맺었습니다. 계속 스크롤하여 두루마리를 펼쳐 보세요.',

    'gent.kicker': 'IV · 사군자',
    'gent.title': '사군자',
    'gent.body': '매화, 난초, 국화, 대나무. 먹그림을 배우는 이가 가장 먼저 익히는 네 가지 소재로, 저마다 한 계절과 하나의 덕을 품고 있습니다. 스스로 그려지는 모습을 지켜보세요. 족자를 누르면 다시 그립니다.',
    'gent.again': '다시 그리기',

    'studio.kicker': 'V · 여백의 미',
    'studio.title': '여백의 미',
    'studio.body': '한국화에서는 그리지 않은 자리도 그린 자리만큼 중요합니다. 이제 당신 차례예요. 먹의 농담을 고르고, 한지 위에 그리고, 매화 한 송이를 더한 뒤 낙관을 찍어 보세요.',
    'studio.dark': '짙은 먹', 'studio.mid': '중간 먹', 'studio.pale': '옅은 먹',
    'studio.blossom': '꽃 찍기', 'studio.seal': '도장 찍기', 'studio.size': '붓 크기',
    'studio.clear': '물로 씻기', 'studio.save': '그림 저장', 'studio.hint': '여기에 그려 보세요',
    'studio.saveHint': '당신의 그림이에요. 그림을 길게 누르거나 오른쪽 클릭해 저장하세요.',
    'studio.download': 'PNG로 내려받기', 'studio.close': '닫기',

    'letter.kicker': 'VI · 편지',
    'letter.title': '미화에게',

    'footer.main': '미화를 위해 먹과 코드로 그림 · 2026',
    'footer.credits': '지도: Natural Earth · 3D: three.js · 글꼴: 나눔손글씨 붓, 고운바탕, Cormorant Garamond',
    fallback: '브라우저에서 WebGL을 시작할 수 없어 3D 풍경이 잠시 쉬고 있어요. 나머지는 모두 그대로 즐길 수 있습니다.',
  },
};

// ─────────────────────────── Globe: places ───────────────────────────

export const PLACES = [
  {
    id: 'seoul', lat: 37.5665, lon: 126.978, home: true,
    name: { en: 'Seoul', fr: 'Séoul', ko: '서울' },
    inst: { en: 'Capital of the Republic of Korea', fr: 'Capitale de la République de Corée', ko: '대한민국의 수도' },
    desc: {
      en: 'Half of the story. A capital for more than six centuries, and today a hub of soft power — from K-culture to development cooperation.',
      fr: 'La moitié de l’histoire. Capitale depuis plus de six siècles, aujourd’hui foyer de soft power — de la K-culture à la coopération au développement.',
      ko: '이야기의 절반. 600년 넘게 수도였던 도시이자, 오늘날 한류에서 개발협력까지 소프트 파워의 중심지.',
    },
  },
  {
    id: 'paris', lat: 48.8566, lon: 2.3522, home: true,
    name: { en: 'Paris', fr: 'Paris', ko: '파리' },
    inst: { en: 'UNESCO · OECD headquarters', fr: 'Sièges de l’UNESCO et de l’OCDE', ko: '유네스코 · OECD 본부' },
    desc: {
      en: 'The other half. Home of UNESCO, which protects heritage from Jongmyo Shrine to the banks of the Seine, and of the OECD, which Korea joined in 1996.',
      fr: 'L’autre moitié. Siège de l’UNESCO, qui protège le patrimoine du sanctuaire de Jongmyo aux rives de la Seine, et de l’OCDE, que la Corée a rejointe en 1996.',
      ko: '나머지 절반. 종묘에서 센강 변까지 인류의 유산을 지키는 유네스코, 그리고 한국이 1996년에 가입한 OECD의 본부가 있는 곳.',
    },
  },
  {
    id: 'newyork', lat: 40.7489, lon: -73.968,
    name: { en: 'New York', fr: 'New York', ko: '뉴욕' },
    inst: { en: 'United Nations Headquarters', fr: 'Siège des Nations unies', ko: '유엔 본부' },
    desc: {
      en: 'Where the General Assembly gives every member state one voice, and the Security Council meets. Both Koreas joined the UN on the same day in 1991.',
      fr: 'Là où l’Assemblée générale donne une voix à chaque État membre, et où siège le Conseil de sécurité. Les deux Corées y sont entrées le même jour, en 1991.',
      ko: '모든 회원국이 한 표를 갖는 총회와 안전보장이사회가 열리는 곳. 남북한은 1991년 같은 날 유엔에 가입했습니다.',
    },
  },
  {
    id: 'geneva', lat: 46.2266, lon: 6.1404,
    name: { en: 'Geneva', fr: 'Genève', ko: '제네바' },
    inst: { en: 'Palais des Nations · Human Rights Council', fr: 'Palais des Nations · Conseil des droits de l’homme', ko: '팔레 데 나시옹 · 유엔 인권이사회' },
    desc: {
      en: 'The capital of multilateral diplomacy: the UN’s European office, the WHO, the WTO and the Red Cross, all within a walk of the lake.',
      fr: 'Capitale de la diplomatie multilatérale : l’Office des Nations unies, l’OMS, l’OMC et la Croix-Rouge, à quelques pas du lac.',
      ko: '다자외교의 수도. 유엔 제네바 사무소, 세계보건기구, 세계무역기구, 국제적십자위원회가 호숫가에 모여 있습니다.',
    },
  },
  {
    id: 'brussels', lat: 50.8503, lon: 4.3517,
    name: { en: 'Brussels', fr: 'Bruxelles', ko: '브뤼셀' },
    inst: { en: 'European Union · NATO', fr: 'Union européenne · OTAN', ko: '유럽연합 · 나토' },
    desc: {
      en: 'Where twenty-seven countries practise pooled sovereignty every day — and where NATO’s allies meet.',
      fr: 'Là où vingt-sept pays pratiquent chaque jour la souveraineté partagée — et où se réunissent les alliés de l’OTAN.',
      ko: '스물일곱 나라가 날마다 주권을 함께 나누어 쓰는 곳이자, 나토 동맹국들이 모이는 곳.',
    },
  },
  {
    id: 'hague', lat: 52.0866, lon: 4.2956,
    name: { en: 'The Hague', fr: 'La Haye', ko: '헤이그' },
    inst: { en: 'Peace Palace · International Court of Justice', fr: 'Palais de la Paix · Cour internationale de justice', ko: '평화궁 · 국제사법재판소' },
    desc: {
      en: 'The world’s court settles disputes between states. In 1907, three Korean envoys came here to plead for their country’s sovereignty.',
      fr: 'La Cour mondiale y règle les différends entre États. En 1907, trois émissaires coréens y vinrent plaider pour la souveraineté de leur pays.',
      ko: '국가 간 분쟁을 다루는 국제사법재판소가 있는 곳. 1907년, 헤이그 특사 세 사람이 나라의 주권을 호소하러 이곳을 찾았습니다.',
    },
  },
  {
    id: 'strasbourg', lat: 48.5734, lon: 7.7521,
    name: { en: 'Strasbourg', fr: 'Strasbourg', ko: '스트라스부르' },
    inst: { en: 'European Parliament · Council of Europe', fr: 'Parlement européen · Conseil de l’Europe', ko: '유럽의회 · 유럽평의회' },
    desc: {
      en: 'A city passed back and forth between France and Germany, now home to the European Parliament and the European Court of Human Rights — reconciliation as an address.',
      fr: 'Ville longtemps disputée entre la France et l’Allemagne, aujourd’hui siège du Parlement européen et de la Cour européenne des droits de l’homme — la réconciliation comme adresse.',
      ko: '프랑스와 독일 사이를 오갔던 도시가 이제 유럽의회와 유럽인권재판소의 자리가 되었습니다. 화해가 주소가 된 곳.',
    },
  },
  {
    id: 'vienna', lat: 48.2346, lon: 16.4169,
    name: { en: 'Vienna', fr: 'Vienne', ko: '빈' },
    inst: { en: 'IAEA · OSCE', fr: 'AIEA · OSCE', ko: '국제원자력기구 · 유럽안보협력기구' },
    desc: {
      en: 'Home of the world’s nuclear watchdog — and of the 1961 convention that still sets the rules of diplomacy itself.',
      fr: 'Siège du gendarme mondial du nucléaire — et berceau de la convention de 1961 qui fixe encore les règles de la diplomatie.',
      ko: '세계의 원자력 감시 기구가 있는 곳이자, 지금도 외교의 규칙을 정하는 1961년 비엔나 협약이 태어난 곳.',
    },
  },
  {
    id: 'washington', lat: 38.899, lon: -77.0425,
    name: { en: 'Washington, D.C.', fr: 'Washington', ko: '워싱턴 D.C.' },
    inst: { en: 'IMF · World Bank', fr: 'FMI · Banque mondiale', ko: '국제통화기금 · 세계은행' },
    desc: {
      en: 'The Bretton Woods twins. Within a single lifetime, Korea went from receiving aid to giving it.',
      fr: 'Les jumeaux de Bretton Woods. En une seule vie, la Corée est passée de pays aidé à pays donateur.',
      ko: '브레턴우즈 체제의 쌍둥이 기관. 한국은 한 세대 만에 원조를 받던 나라에서 주는 나라가 되었습니다.',
    },
  },
  {
    id: 'songdo', lat: 37.3894, lon: 126.642,
    name: { en: 'Incheon · Songdo', fr: 'Incheon · Songdo', ko: '인천 송도' },
    inst: { en: 'Green Climate Fund', fr: 'Fonds vert pour le climat', ko: '녹색기후기금' },
    desc: {
      en: 'In 2012 the Green Climate Fund chose Korea as its home — climate diplomacy on land reclaimed from the Yellow Sea.',
      fr: 'En 2012, le Fonds vert pour le climat a choisi la Corée comme siège — la diplomatie climatique, sur des terres gagnées sur la mer Jaune.',
      ko: '2012년, 녹색기후기금이 본부를 한국에 두기로 했습니다. 서해를 메운 땅 위에서 펼쳐지는 기후 외교.',
    },
  },
  {
    id: 'busan', lat: 35.1277, lon: 129.0967,
    name: { en: 'Busan', fr: 'Busan', ko: '부산' },
    inst: { en: 'UN Memorial Cemetery in Korea', fr: 'Cimetière commémoratif des Nations unies', ko: '재한유엔기념공원' },
    desc: {
      en: 'The only UN cemetery in the world, where soldiers from many nations — France among them — rest side by side.',
      fr: 'Le seul cimetière des Nations unies au monde, où reposent côte à côte des soldats de nombreux pays — dont la France.',
      ko: '세계에서 유일한 유엔군 묘지. 프랑스를 비롯한 여러 나라의 장병들이 나란히 잠들어 있습니다.',
    },
  },
  {
    id: 'panmunjom', lat: 37.9559, lon: 126.6772,
    name: { en: 'Panmunjom', fr: 'Panmunjeom', ko: '판문점' },
    inst: { en: 'Joint Security Area', fr: 'Zone de sécurité commune', ko: '공동경비구역' },
    desc: {
      en: 'The 1953 Armistice was signed here, and the blue huts still straddle the line. Diplomacy at its most fragile — and most necessary.',
      fr: 'L’armistice de 1953 y a été signé, et les baraques bleues chevauchent toujours la ligne. La diplomatie dans ce qu’elle a de plus fragile — et de plus nécessaire.',
      ko: '1953년 정전협정이 조인된 곳. 파란 막사들은 지금도 군사분계선 위에 서 있습니다. 가장 연약하면서도 가장 절실한 외교의 현장.',
    },
  },
  {
    id: 'addis', lat: 9.0045, lon: 38.7436,
    name: { en: 'Addis Ababa', fr: 'Addis-Abeba', ko: '아디스아바바' },
    inst: { en: 'African Union', fr: 'Union africaine', ko: '아프리카연합' },
    desc: {
      en: 'Fifty-five member states under one roof — and, since 2023, a permanent seat at the G20 table.',
      fr: 'Cinquante-cinq États membres sous un même toit — et, depuis 2023, un siège permanent à la table du G20.',
      ko: '쉰다섯 회원국이 한 지붕 아래 모이는 곳. 2023년부터는 G20의 정식 회원이 되었습니다.',
    },
  },
  {
    id: 'nairobi', lat: -1.2344, lon: 36.812,
    name: { en: 'Nairobi', fr: 'Nairobi', ko: '나이로비' },
    inst: { en: 'UN Environment Programme', fr: 'Programme des Nations unies pour l’environnement', ko: '유엔환경계획' },
    desc: {
      en: 'The first UN agency to make its home in the Global South, speaking up for the planet since 1972.',
      fr: 'La première agence de l’ONU installée dans les pays du Sud, qui parle au nom de la planète depuis 1972.',
      ko: '개발도상국에 처음 본부를 둔 유엔 기구. 1972년부터 지구를 대변해 왔습니다.',
    },
  },
  {
    id: 'jakarta', lat: -6.2386, lon: 106.8036,
    name: { en: 'Jakarta', fr: 'Jakarta', ko: '자카르타' },
    inst: { en: 'ASEAN Secretariat', fr: 'Secrétariat de l’ASEAN', ko: '아세안 사무국' },
    desc: {
      en: 'The heart of the “ASEAN way”: consensus and quiet diplomacy. Korea has been a dialogue partner since 1989.',
      fr: 'Le cœur de la « voie de l’ASEAN » : consensus et diplomatie discrète. La Corée en est partenaire de dialogue depuis 1989.',
      ko: '합의와 조용한 외교를 중시하는 ‘아세안 방식’의 중심. 한국은 1989년부터 대화 상대국입니다.',
    },
  },
  {
    id: 'rome', lat: 41.8836, lon: 12.4895,
    name: { en: 'Rome', fr: 'Rome', ko: '로마' },
    inst: { en: 'FAO · World Food Programme', fr: 'FAO · Programme alimentaire mondial', ko: '유엔식량농업기구 · 세계식량계획' },
    desc: {
      en: 'Where the fight against hunger is coordinated. The World Food Programme received the Nobel Peace Prize in 2020.',
      fr: 'Là où se coordonne la lutte contre la faim. Le Programme alimentaire mondial a reçu le prix Nobel de la paix en 2020.',
      ko: '기아와의 싸움을 조율하는 곳. 세계식량계획은 2020년 노벨 평화상을 받았습니다.',
    },
  },
];

// ─────────────────────────── Lexicon ───────────────────────────

export const LEXICON = [
  { ko: '평화', hanja: '平和', fr: 'paix', en: 'peace', gloss: { en: '平 level · 和 harmony', fr: '平 égal · 和 harmonie', ko: '평평할 평 · 화할 화' } },
  { ko: '외교', hanja: '外交', fr: 'diplomatie', en: 'diplomacy', gloss: { en: '外 outside · 交 exchange', fr: '外 dehors · 交 échange', ko: '바깥 외 · 사귈 교' } },
  { ko: '주권', hanja: '主權', fr: 'souveraineté', en: 'sovereignty', gloss: { en: '主 master · 權 authority', fr: '主 maître · 權 pouvoir', ko: '주인 주 · 권세 권' } },
  { ko: '협력', hanja: '協力', fr: 'coopération', en: 'cooperation', gloss: { en: '協 together · 力 strength', fr: '協 ensemble · 力 force', ko: '화합할 협 · 힘 력' } },
  { ko: '인권', hanja: '人權', fr: 'droits humains', en: 'human rights', gloss: { en: '人 person · 權 right', fr: '人 personne · 權 droit', ko: '사람 인 · 권세 권' } },
  { ko: '조약', hanja: '條約', fr: 'traité', en: 'treaty', gloss: { en: '條 clause · 約 promise', fr: '條 article · 約 promesse', ko: '가지 조 · 맺을 약' } },
  { ko: '동맹', hanja: '同盟', fr: 'alliance', en: 'alliance', gloss: { en: '同 same · 盟 oath', fr: '同 même · 盟 serment', ko: '한가지 동 · 맹세 맹' } },
  { ko: '협상', hanja: '協商', fr: 'négociation', en: 'negotiation', gloss: { en: '協 together · 商 deliberate', fr: '協 ensemble · 商 délibérer', ko: '화합할 협 · 헤아릴 상' } },
  { ko: '화해', hanja: '和解', fr: 'réconciliation', en: 'reconciliation', gloss: { en: '和 harmony · 解 untie', fr: '和 harmonie · 解 dénouer', ko: '화할 화 · 풀 해' } },
  { ko: '우정', hanja: '友情', fr: 'amitié', en: 'friendship', gloss: { en: '友 friend · 情 feeling', fr: '友 ami · 情 sentiment', ko: '벗 우 · 뜻 정' } },
];

// ─────────────────────────── France–Korea timeline ───────────────────────────

export const EVENTS = [
  {
    year: '1866', tag: '병인양요', seal: '丙',
    text: {
      en: 'A French naval expedition reaches Ganghwa Island. Royal protocol books — the uigwe — are carried off to Paris.',
      fr: 'Une expédition navale française atteint l’île de Ganghwa. Des livres de protocole royal — les uigwe — sont emportés à Paris.',
      ko: '프랑스 함대가 강화도에 이릅니다. 외규장각의 의궤가 파리로 옮겨집니다.',
    },
  },
  {
    year: '1886', tag: '한불수호통상조약', seal: '約',
    text: {
      en: 'On 4 June, a Treaty of Friendship, Commerce and Navigation is signed. Diplomatic relations begin.',
      fr: 'Le 4 juin, un traité d’amitié, de commerce et de navigation est signé. Les relations diplomatiques commencent.',
      ko: '6월 4일, 한불수호통상조약이 체결되며 두 나라의 외교 관계가 시작됩니다.',
    },
  },
  {
    year: '1900', tag: '파리 만국박람회', seal: '博',
    text: {
      en: 'The Korean Empire raises its own pavilion at the Exposition Universelle in Paris.',
      fr: 'L’Empire coréen élève son propre pavillon à l’Exposition universelle de Paris.',
      ko: '대한제국이 파리 만국박람회에 한국관을 세웁니다.',
    },
  },
  {
    year: '1919', tag: '파리강화회의', seal: '獨',
    text: {
      en: 'Kim Kyu-sik carries the case for Korean independence to the Paris Peace Conference.',
      fr: 'Kim Kyu-sik porte la cause de l’indépendance coréenne à la Conférence de la paix de Paris.',
      ko: '김규식이 파리강화회의에 한국 독립의 뜻을 알리러 갑니다.',
    },
  },
  {
    year: '1951', tag: '지평리 전투', seal: '義',
    text: {
      en: 'During the Korean War, the French Battalion of the UN forces holds its ground at Chipyong-ni.',
      fr: 'Pendant la guerre de Corée, le Bataillon français de l’ONU tient bon à Chipyong-ni.',
      ko: '한국전쟁 중, 유엔군 프랑스 대대가 지평리 전투에서 끝까지 진지를 지켜 냅니다.',
    },
  },
  {
    year: '2011', tag: '외규장각 의궤 귀환', seal: '還',
    text: {
      en: '297 volumes of the Oegyujanggak uigwe come back to Korea, 145 years after they left.',
      fr: '297 volumes des uigwe d’Oegyujanggak reviennent en Corée, 145 ans après leur départ.',
      ko: '외규장각 의궤 297책이 145년 만에 고국으로 돌아옵니다.',
    },
  },
  {
    year: '2016', tag: '한불 상호교류의 해', seal: '交',
    text: {
      en: 'The Année France-Corée celebrates 130 years of relations in both countries.',
      fr: 'L’Année France-Corée célèbre 130 ans de relations dans les deux pays.',
      ko: '한불 상호교류의 해. 수교 130주년을 두 나라가 함께 기념합니다.',
    },
  },
  {
    year: '2026', tag: '수교 140주년', seal: '美',
    text: {
      en: '140 years. And somewhere between the two, Mihwa.',
      fr: '140 ans. Et quelque part entre les deux, Mihwa.',
      ko: '수교 140주년. 그리고 두 나라 사이 어딘가에, 미화.',
    },
  },
];

// ─────────────────────────── The Four Gentlemen ───────────────────────────

export const GENTLEMEN = [
  {
    id: 'plum', hanja: '梅', ko: '매화', silk: '#7e9f8f',
    name: { en: 'Plum blossom', fr: 'Fleur de prunier', ko: '매화' },
    season: { en: 'Spring · Courage', fr: 'Printemps · Courage', ko: '봄 · 인내' },
    text: {
      en: 'The first to bloom, through the last snow.',
      fr: 'Le premier à fleurir, sous la dernière neige.',
      ko: '마지막 눈 속에서 가장 먼저 피어납니다.',
    },
  },
  {
    id: 'orchid', hanja: '蘭', ko: '난초', silk: '#8c6f86',
    name: { en: 'Orchid', fr: 'Orchidée', ko: '난초' },
    season: { en: 'Summer · Grace', fr: 'Été · Grâce', ko: '여름 · 기품' },
    text: {
      en: 'Hidden in a valley, its fragrance still travels far.',
      fr: 'Cachée dans une vallée, son parfum voyage pourtant loin.',
      ko: '깊은 골짜기에 숨어 있어도 향기는 멀리 퍼집니다.',
    },
  },
  {
    id: 'chrysanthemum', hanja: '菊', ko: '국화', silk: '#a8845a',
    name: { en: 'Chrysanthemum', fr: 'Chrysanthème', ko: '국화' },
    season: { en: 'Autumn · Integrity', fr: 'Automne · Intégrité', ko: '가을 · 지조' },
    text: {
      en: 'It blooms alone, after the first frost.',
      fr: 'Il fleurit seul, après les premières gelées.',
      ko: '서리를 이겨 내고 홀로 피어납니다.',
    },
  },
  {
    id: 'bamboo', hanja: '竹', ko: '대나무', silk: '#2f4266',
    name: { en: 'Bamboo', fr: 'Bambou', ko: '대나무' },
    season: { en: 'Winter · Uprightness', fr: 'Hiver · Droiture', ko: '겨울 · 절개' },
    text: {
      en: 'It bends in the storm and does not break.',
      fr: 'Il plie sous l’orage et ne rompt pas.',
      ko: '바람에 휘어도 꺾이지 않습니다.',
    },
  },
];
