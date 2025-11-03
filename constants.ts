export const GENRES = [
  "동요", "신스웨이브", "로파이 힙합", "에픽 오케스트라", "앰비언트", "팝", "K-pop",
  "락", "재즈", "클래식", "일렉트로닉", "포크", "레게", "씨씨엠", "살사", "라틴", "벨리", "트로트", "언플러그드", "아카펠라"
];

export const MOODS = [
  "귀여운", "발랄한", "따뜻한", "재미있는", "교육적인", "자장가",
  "향수를 자극하는", "희망찬", "우울한", "에너제틱한", "편안한",
  "신비로운", "영화 같은", "몽환적인", "사색적인", "웅장한", "언플러그드", "신나는", "감정적인", "청량한", "힐링"
];

export const INSTRUMENT_CATEGORIES = [
  {
    name: "현악기 (Strings)",
    instruments: ["어쿠스틱 기타", "일렉트릭 기타", "바이올린", "첼로", "베이스 기타", "만돌린", "시타르", "우쿨렐레"]
  },
  {
    name: "건반/신디 (Keys/Synth)",
    instruments: ["그랜드 피아노", "로즈 피아노", "신스 패드", "하프시코드", "오르간", "아르페지에이터", "8비트 신스", "글로켄슈필", "토이 피아노"]
  },
  {
    name: "관악기 (Wind)",
    instruments: ["트럼펫", "색소폰", "플루트", "클리넷", "하모니카", "오보에", "바순", "오카리나", "리코더"]
  },
  {
    name: "타악기 (Percussion)",
    instruments: ["락 드럼", "재즈 드럼", "일렉트로닉 킥", "콩가", "타악기", "실로폰", "탬버린", "트라이앵글", "쉐이커"]
  },
  {
    name: "전자음/효과 (Electronic/FX)",
    instruments: ["서브 베이스", "화이트 노이즈", "라이저 FX"]
  },
  {
    name: "한국 전통악기 (Korean Traditional)",
    instruments: ["가야금", "해금", "대금", "태평소", "장구", "꽹과리"]
  },
  {
    name: "중국 전통악기 (Chinese Traditional)",
    instruments: ["고쟁", "비파", "얼후", "디즈"]
  }
];


export const SONG_LENGTHS = ["짧게 (1분 이내)", "보통 (1분 30초 ~ 2분 30초)", "길게 (3분 이상)"];

export const MUSIC_STRUCTURES = [
  "인트로 (Intro)", "벌스 (Verse)", "코러스 (Chorus)", "브릿지 (Bridge)",
  "아웃트로 (Outro)", "프리-코러스 (Pre-Chorus)", "포스트-코러스 (Post-Chorus)", "악기 솔로 (Instrumental Solo)"
];

export const VOCAL_TYPES = [
  "여성 보컬 (Female Vocal)", "남성 보컬 (Male Vocal)", "여성 랩 (Female Rap)", "남성 랩 (Male Rap)",
  "듀엣 (Duet)", "합창 (Choir)", "그룹 (Group)", "보컬 없음 (Instrumental)"
];

export const SINGING_STYLES = [
  "부드러운 (Soft/Smooth)", "파워풀한 (Powerful/Belting)", "속삭이는 (Whispering)",
  "숨소리가 강조된 (Breathy)", "오토튠 (Auto-Tuned)", "거친 (Gritty/Screaming)"
];

export const TEMPOS = [
  "느리게 (Slow, ≈60-80 BPM)", "보통 (Medium, ≈90-120 BPM)",
  "빠르게 (Fast, ≈130-160 BPM)", "매우 빠르게 (Uptempo, ≈170+ BPM)"
];

export const RHYTHM_GROOVES = [
  "몽환적인 (Lush)", "댄스/클럽 (Dance/Club Groove)", "스윙 (Swing)",
  "힙합 비트 (Heavy Hip-Hop Beat)", "트랩 비트 (Trap Beat)"
];

export const MIXING_TEXTURES = [
  "로파이/빈티지 (Lo-Fi/Vinyl)", "깨끗한/모던한 (Clean/Modern)",
  "공간감이 넓은 (Reverb Heavy/Cinematic)", "따뜻한 아날로그 (Warm Analog)"
];

export const SFX_OPTIONS = [
  "비 (Rain)", "천둥 (Thunder)", "새소리 (Birds)", "사이렌 (Siren)", "라이저/스위퍼 (Riser/Sweeper)"
];

export const ALL_INSTRUMENTS = INSTRUMENT_CATEGORIES.flatMap(category => category.instruments);