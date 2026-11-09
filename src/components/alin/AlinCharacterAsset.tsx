import React from 'react';
import { AlinExpression } from '../../types';

export interface AlinExpressionMeta {
  id: AlinExpression;
  num: number;
  label: string;
  emoji: string;
  category: 'positive' | 'thinking' | 'emotional' | 'reaction' | 'affection' | 'tired';
  description: string;
}

export const ALIN_EXPRESSIONS_LIST: AlinExpressionMeta[] = [
  { id: 'normal', num: 1, label: 'Normal', emoji: '🎵', category: 'positive', description: 'Tenang, ramah, dan santai' },
  { id: 'senyum', num: 2, label: 'Senyum', emoji: '☀️', category: 'positive', description: 'Senyum manis ceria' },
  { id: 'happy', num: 3, label: 'Happy', emoji: '✨', category: 'positive', description: 'Gembira dengan pose peace' },
  { id: 'tertawa', num: 4, label: 'Tertawa', emoji: '😆', category: 'positive', description: 'Tertawa riang gembira' },
  { id: 'thinking', num: 5, label: 'Pikiran / Thinking', emoji: '🤔', category: 'thinking', description: 'Sedang mikir & analisa konsep' },
  { id: 'confused', num: 6, label: 'Bingung / Confused', emoji: '❓', category: 'thinking', description: 'Agak bingung & heran' },
  { id: 'shock', num: 7, label: 'Kaget / Shock', emoji: '⚡', category: 'reaction', description: 'Kaget terperangah' },
  { id: 'sedih', num: 8, label: 'Sedih', emoji: '🥺', category: 'emotional', description: 'Sedih terharu berkaca-kaca' },
  { id: 'menangis', num: 9, label: 'Menangis', emoji: '😭', category: 'emotional', description: 'Nangis tersedu-sedu' },
  { id: 'marah', num: 10, label: 'Marah / Kesal', emoji: '💢', category: 'emotional', description: 'Kesal cemberut ngambek' },
  { id: 'blushing', num: 11, label: 'Malu / Blushing', emoji: '😳', category: 'reaction', description: 'Malu-malu kucing merona' },
  { id: 'excited', num: 12, label: 'Excited', emoji: '🤩', category: 'positive', description: 'Sangat antusias mata bintang' },
  { id: 'semangat', num: 13, label: 'Semangat', emoji: '🔥', category: 'positive', description: 'Mengepalkan tangan penuh tekad' },
  { id: 'encouraging', num: 14, label: 'Encouraging', emoji: '💪', category: 'positive', description: 'Mengedipkan mata & menyemangati' },
  { id: 'lelah', num: 15, label: 'Lelah', emoji: '🥱', category: 'tired', description: 'Kelelahan rebahan di meja' },
  { id: 'kaget_lucu', num: 16, label: 'Kaget Lucu', emoji: '😲', category: 'reaction', description: 'Kaget imut memegang pipi' },
  { id: 'playful', num: 17, label: 'Genit / Playful', emoji: '😜', category: 'positive', description: 'Jail menjulurkan lidah tehe' },
  { id: 'ngelirik', num: 18, label: 'Ngelirik / Ngiler', emoji: '😏', category: 'tired', description: 'Melirik samping mata sayu' },
  { id: 'kangen', num: 19, label: 'Kangen / Miss You', emoji: '🐱', category: 'affection', description: 'Memeluk boneka kucing manis' },
  { id: 'cemas', num: 20, label: 'Cemas / Khawatir', emoji: '💧', category: 'emotional', description: 'Cemas khawatir keringat dingin' },
  { id: 'yakin', num: 21, label: 'Yakin / Percaya Diri', emoji: '😎', category: 'positive', description: 'Percaya diri menunjuk diri' },
  { id: 'penasaran', num: 22, label: 'Penasaran', emoji: '🧐', category: 'thinking', description: 'Menopang dagu penuh rasa ingin tahu' },
  { id: 'tidur', num: 23, label: 'Tidur / Ngantuk', emoji: '😴', category: 'tired', description: 'Tidur pulas memeluk bantal' },
  { id: 'love', num: 24, label: 'Love / Sayang', emoji: '🫶', category: 'affection', description: 'Membentuk gestur hati cinta' },
];

export const ALIN_EXPRESSIONS_MAP = ALIN_EXPRESSIONS_LIST.reduce<Record<string, AlinExpressionMeta>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

interface AlinCharacterAssetProps {
  expression?: AlinExpression;
  className?: string;
  showCardBackground?: boolean;
}

export const AlinCharacterAsset: React.FC<AlinCharacterAssetProps> = ({
  expression = 'normal',
  className = 'w-full h-full',
  showCardBackground = false,
}) => {
  // Normalize expression key
  const exp: AlinExpression = ALIN_EXPRESSIONS_MAP[expression] ? expression : 'normal';

  return (
    <svg
      viewBox="0 0 200 200"
      className={`select-none overflow-visible ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft Pastel Gradients */}
        <radialGradient id="face-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9F5" />
          <stop offset="100%" stopColor="#FFE8DB" />
        </radialGradient>
        <linearGradient id="hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2E2833" />
          <stop offset="40%" stopColor="#211C26" />
          <stop offset="100%" stopColor="#151219" />
        </linearGradient>
        <linearGradient id="hair-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#52475C" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#302737" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hoodie-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2B2E3A" />
          <stop offset="100%" stopColor="#1A1C23" />
        </linearGradient>
        <radialGradient id="eye-pupil" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#573D30" />
          <stop offset="60%" stopColor="#2A1B16" />
          <stop offset="100%" stopColor="#110B09" />
        </radialGradient>
        <radialGradient id="star-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="60%" stopColor="#FBC02D" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
        <linearGradient id="card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EDF4FF" />
          <stop offset="100%" stopColor="#F5F3FF" />
        </linearGradient>
      </defs>

      {/* Optional Card Container matching the expression sheet */}
      {showCardBackground && (
        <rect
          x="4"
          y="4"
          width="192"
          height="192"
          rx="24"
          fill="url(#card-bg)"
          stroke="#DDE6F8"
          strokeWidth="2.5"
        />
      )}

      {/* --- BACKGROUND ACCENTS / DOODLES SPECIFIC TO EMOTIONS --- */}
      {/* 1. Normal: Music notes */}
      {exp === 'normal' && (
        <g opacity="0.85">
          <path d="M 28 44 Q 30 36 38 38 L 38 48 A 4 4 0 1 1 34 45 L 34 40 L 28 41 A 3 3 0 1 1 25 38 Z" fill="#60A5FA" />
          <path d="M 172 45 Q 174 40 180 41 L 180 48 A 3 3 0 1 1 177 46 Z" fill="#93C5FD" />
          <path d="M 170 65 Q 174 62 176 68" stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* 2. Senyum: Sun sparkle */}
      {exp === 'senyum' && (
        <g opacity="0.9">
          <circle cx="174" cy="38" r="6" fill="#FBBF24" />
          <path d="M 174 27 L 174 30 M 174 46 L 174 49 M 163 38 L 166 38 M 182 38 L 185 38" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <path d="M 166 30 L 168 32 M 180 44 L 182 46 M 166 46 L 168 44 M 180 32 L 182 30" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {/* 3. Happy & 12. Excited: Golden Sparkle Stars */}
      {(exp === 'happy' || exp === 'excited') && (
        <g fill="#F59E0B">
          <path d="M 172 32 Q 172 40 178 40 Q 172 40 172 48 Q 172 40 166 40 Q 172 40 172 32 Z" />
          <path d="M 26 46 Q 26 52 30 52 Q 26 52 26 58 Q 26 52 22 52 Q 26 52 26 46 Z" opacity="0.8" />
          <circle cx="182" cy="58" r="2.5" opacity="0.9" fill="#FCD34D" />
          <circle cx="20" cy="36" r="2" opacity="0.9" fill="#FCD34D" />
        </g>
      )}

      {/* 4. Tertawa: Laugh sound lines */}
      {exp === 'tertawa' && (
        <g stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 168 46 Q 174 44 176 52" />
          <path d="M 174 58 Q 178 57 180 64" />
          <path d="M 24 50 Q 20 48 22 56" />
        </g>
      )}

      {/* 5. Thinking & 22. Penasaran: Question Marks */}
      {(exp === 'thinking' || exp === 'penasaran') && (
        <g fill="#3B82F6">
          <path d="M 170 32 Q 178 30 178 38 Q 178 44 172 47 L 172 51 L 168 51 L 168 45 Q 174 43 174 38 Q 174 34 170 35 Q 166 36 166 39 L 162 39 Q 162 33 170 32 Z" />
          <circle cx="170" cy="56" r="2.5" />
        </g>
      )}

      {/* 6. Confused: Double question marks */}
      {exp === 'confused' && (
        <g fill="#60A5FA">
          <path d="M 164 28 Q 170 26 170 33 Q 170 38 165 40 L 165 43 L 162 43 L 162 39 Q 167 37 167 33 Q 167 29 164 30 Q 161 31 161 34 L 158 34 Q 158 29 164 28 Z" />
          <circle cx="163.5" cy="47" r="2" />
          <path d="M 176 34 Q 182 32 182 39 Q 182 44 177 46 L 177 49 L 174 49 L 174 45 Q 179 43 179 39 Q 179 35 176 36 Q 173 37 173 40 L 170 40 Q 170 35 176 34 Z" />
          <circle cx="175.5" cy="53" r="2" />
        </g>
      )}

      {/* 7. Shock: Exclamation points */}
      {exp === 'shock' && (
        <g fill="#2563EB">
          <rect x="168" y="28" width="4" height="15" rx="2" />
          <circle cx="170" cy="48" r="2.5" />
          <rect x="176" y="26" width="4" height="17" rx="2" />
          <circle cx="178" cy="48" r="2.5" />
        </g>
      )}

      {/* 8. Sedih: Raincloud & tear drops */}
      {exp === 'sedih' && (
        <g>
          <g fill="#93C5FD">
            <path d="M 166 38 A 6 6 0 0 1 176 33 A 8 8 0 0 1 190 38 A 5 5 0 0 1 188 47 L 164 47 A 5 5 0 0 1 166 38 Z" fill="#818CF8" opacity="0.8" />
            <path d="M 168 51 L 166 56 M 175 51 L 173 57 M 183 51 L 181 56" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
            <path d="M 26 56 Q 24 50 28 48 Q 32 50 30 56 Q 28 60 26 56 Z" fill="#60A5FA" opacity="0.75" />
          </g>
        </g>
      )}

      {/* 9. Menangis: Big crying fountains */}
      {exp === 'menangis' && (
        <g fill="#60A5FA" opacity="0.85">
          <path d="M 18 52 Q 26 48 24 64 Q 22 72 16 68 Q 14 60 18 52 Z" />
          <circle cx="14" cy="48" r="3" />
          <circle cx="184" cy="50" r="3.5" />
          <path d="M 180 54 Q 172 50 174 66 Q 176 74 182 70 Q 184 62 180 54 Z" />
        </g>
      )}

      {/* 10. Marah: Anime rage mark */}
      {exp === 'marah' && (
        <g stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 168 34 Q 174 38 174 44" />
          <path d="M 180 34 Q 174 38 174 44" />
          <path d="M 168 44 Q 174 40 174 34" />
          <path d="M 180 44 Q 174 40 174 34" />
        </g>
      )}

      {/* 11. Blushing, 14. Encouraging, 17. Playful, 19. Kangen, 24. Love: Pink Hearts */}
      {(exp === 'blushing' || exp === 'encouraging' || exp === 'playful' || exp === 'kangen' || exp === 'love') && (
        <g fill="#F472B6">
          <path
            d="M 174 32 C 174 28, 168 28, 168 34 C 168 40, 174 44, 174 46 C 174 44, 180 40, 180 34 C 180 28, 174 28, 174 32 Z"
            transform={exp === 'love' ? 'scale(1.2) translate(-28, -5)' : ''}
          />
          {exp === 'love' && (
            <path
              d="M 28 42 C 28 38, 22 38, 22 44 C 22 50, 28 54, 28 56 C 28 54, 34 50, 34 44 C 34 38, 28 38, 28 42 Z"
              opacity="0.8"
            />
          )}
        </g>
      )}

      {/* 13. Semangat: Power energy lines */}
      {exp === 'semangat' && (
        <g stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M 24 44 L 32 48" />
          <path d="M 22 56 L 30 57" />
          <path d="M 176 44 L 168 48" />
          <path d="M 178 56 L 170 57" />
        </g>
      )}

      {/* 15. Lelah & 23. Tidur: Sleeping ZZZ */}
      {(exp === 'lelah' || exp === 'tidur') && (
        <g fill="#60A5FA" opacity="0.9">
          <path d="M 166 30 L 178 30 L 168 42 L 180 42 L 180 45 L 164 45 L 174 33 L 164 33 Z" />
          <path d="M 178 20 L 186 20 L 180 28 L 188 28 L 188 30 L 176 30 L 182 22 L 176 22 Z" opacity="0.75" />
        </g>
      )}

      {/* 20. Cemas: Big anxiety sweat drop */}
      {exp === 'cemas' && (
        <path
          d="M 174 36 C 174 36 166 48 166 54 A 8 8 0 0 0 182 54 C 182 48 174 36 174 36 Z"
          fill="#38BDF8"
          stroke="#0284C7"
          strokeWidth="1.5"
        />
      )}

      {/* --- BACK HAIR (Flowing Behind Shoulders) --- */}
      <g id="back-hair">
        <path
          d="M 44 95 C 32 120 30 150 42 180 C 48 168 56 150 62 142 Z"
          fill="url(#hair-grad)"
        />
        <path
          d="M 156 95 C 168 120 170 150 158 180 C 152 168 144 150 138 142 Z"
          fill="url(#hair-grad)"
        />
        <path
          d="M 46 80 C 35 110 32 155 45 190 L 155 190 C 168 155 165 110 154 80 Z"
          fill="#1A1520"
        />
      </g>

      {/* --- CLOTHING: HOODIE & T-SHIRT --- */}
      <g id="clothes">
        {/* Shoulders / Body */}
        <path
          d="M 52 146 C 42 152 28 165 24 196 L 176 196 C 172 165 158 152 148 146 C 136 154 118 158 100 158 C 82 158 64 154 52 146 Z"
          fill="url(#hoodie-grad)"
        />
        {/* White T-Shirt Collar */}
        <path
          d="M 85 136 C 85 152 115 152 115 136 Z"
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
        {/* Dainty Silver Necklace */}
        <path
          d="M 90 141 Q 100 148 110 141"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="146" r="1.5" fill="#E2E8F0" />

        {/* Hoodie Center Zipper Line */}
        <path
          d="M 100 152 L 100 196"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="2 2"
        />
        {/* Left & Right Hoodie Collar Lapels */}
        <path
          d="M 68 136 C 72 155 86 166 94 168 C 88 155 84 142 82 136 Z"
          fill="#252832"
        />
        <path
          d="M 132 136 C 128 155 114 166 106 168 C 112 155 116 142 118 136 Z"
          fill="#252832"
        />
      </g>

      {/* --- NECK --- */}
      <rect x="91" y="122" width="18" height="18" rx="4" fill="#FFE0CE" />

      {/* --- HEAD BASE / FACE SHAPE --- */}
      <g id="face-base">
        {/* Chubby Chibi Face with soft jawline */}
        <path
          d="M 48 88 C 48 56 68 40 100 40 C 132 40 152 56 152 88 C 152 118 134 136 100 136 C 66 136 48 118 48 88 Z"
          fill="url(#face-glow)"
        />

        {/* Soft Ears */}
        <ellipse cx="49" cy="94" rx="6" ry="9" fill="#FFE2D1" />
        <ellipse cx="151" cy="94" rx="6" ry="9" fill="#FFE2D1" />

        {/* Rosy Cheeks / Blush Base */}
        <ellipse
          cx="68"
          cy="106"
          rx={exp === 'blushing' ? '16' : '10'}
          ry={exp === 'blushing' ? '10' : '6'}
          fill="#FB7185"
          opacity={exp === 'blushing' ? '0.65' : '0.35'}
        />
        <ellipse
          cx="132"
          cy="106"
          rx={exp === 'blushing' ? '16' : '10'}
          ry={exp === 'blushing' ? '10' : '6'}
          fill="#FB7185"
          opacity={exp === 'blushing' ? '0.65' : '0.35'}
        />
        {/* Extra intense blush bridge for blushing */}
        {exp === 'blushing' && (
          <ellipse cx="100" cy="104" rx="20" ry="7" fill="#FB7185" opacity="0.45" />
        )}
      </g>

      {/* --- EXPRESSIONS: EYES, EYEBROWS, MOUTH --- */}
      <g id="facial-features">
        {/* === EYEBROWS === */}
        {exp === 'marah' ? (
          // Angry slanted eyebrows
          <g stroke="#2C2331" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M 62 82 L 80 87" />
            <path d="M 138 82 L 120 87" />
          </g>
        ) : exp === 'sedih' || exp === 'menangis' || exp === 'cemas' ? (
          // Troubled sad droopy eyebrows
          <g stroke="#3E3445" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M 64 87 Q 74 81 82 85" />
            <path d="M 136 87 Q 126 81 118 85" />
          </g>
        ) : exp === 'semangat' || exp === 'yakin' ? (
          // Confident resolute eyebrows
          <g stroke="#2C2331" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M 64 84 Q 74 80 82 82" />
            <path d="M 136 84 Q 126 80 118 82" />
          </g>
        ) : (
          // Gentle natural cute arched eyebrows
          <g stroke="#4B3D52" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M 64 83 Q 73 78 82 83" />
            <path d="M 136 83 Q 127 78 118 83" />
          </g>
        )}

        {/* === EYES === */}
        {/* Closed Smiling Eyes: senyum, tertawa, yakin */}
        {exp === 'senyum' || exp === 'tertawa' || exp === 'yakin' ? (
          <g stroke="#231B28" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M 62 98 Q 72 90 82 98" />
            <path d="M 118 98 Q 128 90 138 98" />
          </g>
        ) : exp === 'menangis' ? (
          // Squeezed shut crying eyes (> <)
          <g stroke="#231B28" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 62 94 L 74 100 L 62 106" />
            <path d="M 138 94 L 126 100 L 138 106" />
            {/* Crying tears streams */}
            <path d="M 72 100 Q 72 115 68 135" stroke="#60A5FA" strokeWidth="3.5" />
            <path d="M 128 100 Q 128 115 132 135" stroke="#60A5FA" strokeWidth="3.5" />
          </g>
        ) : exp === 'tidur' || exp === 'lelah' ? (
          // Sleepy / Tired half-closed / sleeping eyes
          <g stroke="#2A212F" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 63 100 Q 72 105 81 100" />
            <path d="M 119 100 Q 128 105 137 100" />
          </g>
        ) : exp === 'excited' ? (
          // Starry eyes 🤩
          <g>
            <circle cx="72" cy="98" r="13" fill="url(#star-eye)" />
            <path d="M 72 88 Q 72 98 78 98 Q 72 98 72 108 Q 72 98 66 98 Q 72 98 72 88 Z" fill="#FFFFFF" />
            <circle cx="76" cy="94" r="2" fill="#FFFFFF" />

            <circle cx="128" cy="98" r="13" fill="url(#star-eye)" />
            <path d="M 128 88 Q 128 98 134 98 Q 128 98 128 108 Q 128 98 122 98 Q 128 98 128 88 Z" fill="#FFFFFF" />
            <circle cx="132" cy="94" r="2" fill="#FFFFFF" />
          </g>
        ) : exp === 'shock' ? (
          // Big startled eyes with tiny pupil
          <g>
            <circle cx="72" cy="98" r="14" fill="#FFFFFF" stroke="#231B28" strokeWidth="2.5" />
            <circle cx="72" cy="98" r="4.5" fill="#231B28" />
            <circle cx="74" cy="96" r="1.5" fill="#FFFFFF" />

            <circle cx="128" cy="98" r="14" fill="#FFFFFF" stroke="#231B28" strokeWidth="2.5" />
            <circle cx="128" cy="98" r="4.5" fill="#231B28" />
            <circle cx="130" cy="96" r="1.5" fill="#FFFFFF" />
          </g>
        ) : exp === 'happy' || exp === 'encouraging' || exp === 'playful' ? (
          // Winking eyes: Left eye open, Right eye cute curved wink
          <g>
            {/* Open Left Eye */}
            <ellipse cx="72" cy="98" rx="11" ry="12" fill="url(#eye-pupil)" />
            <circle cx="69" cy="94" r="4" fill="#FFFFFF" />
            <circle cx="75" cy="102" r="2" fill="#FFFFFF" />
            <path d="M 61 92 Q 72 85 83 91" stroke="#221A26" strokeWidth="2.8" fill="none" strokeLinecap="round" />

            {/* Winking Right Eye */}
            <path d="M 118 99 Q 128 91 138 99" stroke="#231B28" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M 136 96 L 140 93" stroke="#231B28" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : exp === 'ngelirik' ? (
          // Heavy-lidded side-eye glance
          <g>
            <ellipse cx="74" cy="99" rx="11" ry="9" fill="url(#eye-pupil)" />
            <circle cx="77" cy="96" r="3" fill="#FFFFFF" />
            <path d="M 62 95 Q 73 93 83 95" stroke="#221A26" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            <ellipse cx="130" cy="99" rx="11" ry="9" fill="url(#eye-pupil)" />
            <circle cx="133" cy="96" r="3" fill="#FFFFFF" />
            <path d="M 117 95 Q 128 93 138 95" stroke="#221A26" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          // Standard Big Dark Anime Eyes: normal, thinking, confused, sedih, marah, cemas, penasaran, kangen, love
          <g>
            {/* Left Eye */}
            <ellipse cx="72" cy="98" rx="11.5" ry="12.5" fill="url(#eye-pupil)" />
            <circle cx="69" cy="93" r="4.2" fill="#FFFFFF" />
            <circle cx="75" cy="102" r="2.2" fill="#FFFFFF" />
            <path d="M 61 91 Q 72 84 83 90" stroke="#221A26" strokeWidth="2.8" fill="none" strokeLinecap="round" />

            {/* Right Eye */}
            <ellipse cx="128" cy="98" rx="11.5" ry="12.5" fill="url(#eye-pupil)" />
            <circle cx="125" cy="93" r="4.2" fill="#FFFFFF" />
            <circle cx="131" cy="102" r="2.2" fill="#FFFFFF" />
            <path d="M 117 90 Q 128 84 139 91" stroke="#221A26" strokeWidth="2.8" fill="none" strokeLinecap="round" />

            {/* Subtle tear gleam in eyes for sedih/cemas */}
            {(exp === 'sedih' || exp === 'cemas') && (
              <g fill="#93C5FD" opacity="0.6">
                <ellipse cx="72" cy="105" rx="6" ry="2" />
                <ellipse cx="128" cy="105" rx="6" ry="2" />
              </g>
            )}
          </g>
        )}

        {/* Tiny cute nose */}
        <circle cx="100" cy="107" r="1.2" fill="#D97706" opacity="0.6" />

        {/* === MOUTH === */}
        {exp === 'tertawa' || exp === 'excited' ? (
          // Wide open happy laughing mouth
          <path
            d="M 91 113 Q 100 113 109 113 C 109 124 91 124 91 113 Z"
            fill="#E11D48"
            stroke="#9F1239"
            strokeWidth="1.5"
          />
        ) : exp === 'senyum' || exp === 'happy' || exp === 'encouraging' || exp === 'semangat' || exp === 'love' ? (
          // Cute open curve smile
          <path
            d="M 93 114 Q 100 121 107 114"
            fill="none"
            stroke="#9F1239"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : exp === 'shock' || exp === 'kaget_lucu' ? (
          // Small O mouth
          <ellipse
            cx="100"
            cy="116"
            rx="4.5"
            ry="6"
            fill="#9F1239"
            stroke="#4C0519"
            strokeWidth="1.5"
          />
        ) : exp === 'playful' ? (
          // Playful smile with sticking out tongue :P
          <g>
            <path d="M 93 114 Q 100 118 107 114" stroke="#9F1239" strokeWidth="2.2" fill="none" />
            <path d="M 98 116 C 98 121 104 121 104 116 Z" fill="#FB7185" />
          </g>
        ) : exp === 'marah' ? (
          // Angry pout mouth
          <path
            d="M 94 118 Q 100 114 106 118"
            fill="none"
            stroke="#9F1239"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ) : exp === 'sedih' || exp === 'menangis' || exp === 'cemas' ? (
          // Sad downturned trembling mouth
          <path
            d="M 94 117 Q 100 113 106 117"
            fill="none"
            stroke="#9F1239"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : exp === 'confused' ? (
          // Wavy curious mouth
          <path
            d="M 94 115 Q 97 118 100 115 Q 103 112 106 115"
            fill="none"
            stroke="#9F1239"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : (
          // Calm gentle smile (normal, thinking, yakin, penasaran, kangen, etc.)
          <path
            d="M 95 115 Q 100 118 105 115"
            fill="none"
            stroke="#9F1239"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* --- FRONT HAIR (Signature Center Parting & Bangs) --- */}
      <g id="front-hair">
        {/* Hair Base Crown */}
        <path
          d="M 46 80 C 44 48 70 34 100 34 C 130 34 156 48 154 80 C 146 54 130 46 100 46 C 70 46 54 54 46 80 Z"
          fill="url(#hair-grad)"
        />
        {/* Left Side Hair Strand */}
        <path
          d="M 48 75 C 44 95 44 125 54 146 C 58 136 56 100 58 85 Z"
          fill="url(#hair-grad)"
        />
        {/* Right Side Hair Strand */}
        <path
          d="M 152 75 C 156 95 156 125 146 146 C 142 136 144 100 142 85 Z"
          fill="url(#hair-grad)"
        />
        {/* Center-Parted Bangs Left */}
        <path
          d="M 100 46 C 92 60 76 74 62 82 C 72 74 86 64 96 52 Z"
          fill="url(#hair-grad)"
        />
        {/* Center-Parted Bangs Right */}
        <path
          d="M 100 46 C 108 60 124 74 138 82 C 128 74 114 64 104 52 Z"
          fill="url(#hair-grad)"
        />
        {/* Soft Feathered Wisps */}
        <path
          d="M 98 48 Q 92 65 86 72 Q 95 62 100 50 Z"
          fill="#3B3042"
        />
        <path
          d="M 102 48 Q 108 65 114 72 Q 105 62 100 50 Z"
          fill="#3B3042"
        />
        {/* Glossy Hair Highlights Arc */}
        <path
          d="M 64 56 C 76 48 124 48 136 56"
          stroke="url(#hair-highlight)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* --- HAND POSES & SPECIAL EMOTE PROPS --- */}
      {/* 3. Happy: Peace Sign Hand ✌️ */}
      {exp === 'happy' && (
        <g id="hand-peace" transform="translate(138, 92)">
          <path d="M 4 28 C 4 20 8 16 12 16 C 16 16 20 20 20 28 L 20 40 L 4 40 Z" fill="#FFE0CE" />
          {/* Index Finger */}
          <rect x="6" y="2" width="6" height="18" rx="3" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" />
          {/* Middle Finger */}
          <rect x="14" y="0" width="6" height="20" rx="3" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" />
          {/* Folded Thumb & Fingers */}
          <circle cx="10" cy="22" r="5" fill="#FED7AA" />
        </g>
      )}

      {/* 4. Tertawa & 20. Cemas: Clasped Hands under chin */}
      {(exp === 'tertawa' || exp === 'cemas') && (
        <g id="clasped-hands" transform="translate(85, 126)">
          <ellipse cx="10" cy="8" rx="7" ry="6" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" />
          <ellipse cx="20" cy="8" rx="7" ry="6" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" />
          <path d="M 6 12 Q 15 15 24 12" stroke="#FDBA74" strokeWidth="1" fill="none" />
        </g>
      )}

      {/* 5. Thinking: Finger to Chin */}
      {exp === 'thinking' && (
        <g id="hand-thinking" transform="translate(120, 115)">
          <rect x="4" y="-8" width="5.5" height="16" rx="2.8" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" transform="rotate(-15)" />
          <circle cx="8" cy="10" r="6" fill="#FFE0CE" />
        </g>
      )}

      {/* 11. Blushing: Sleeves covering mouth */}
      {exp === 'blushing' && (
        <g id="sleeves-blushing" transform="translate(74, 116)">
          <path d="M 0 16 C 0 8 10 4 18 6 C 24 8 26 14 26 22 L 0 22 Z" fill="#252832" />
          <path d="M 52 16 C 52 8 42 4 34 6 C 28 8 26 14 26 22 L 52 22 Z" fill="#252832" />
          <circle cx="18" cy="6" r="4" fill="#FFE0CE" />
          <circle cx="34" cy="6" r="4" fill="#FFE0CE" />
        </g>
      )}

      {/* 13. Semangat: Raised Clenched Fist */}
      {exp === 'semangat' && (
        <g id="hand-fist" transform="translate(42, 108)">
          <circle cx="12" cy="14" r="9" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1.2" />
          <rect x="4" y="6" width="6" height="10" rx="3" fill="#FED7AA" />
          <rect x="10" y="5" width="6" height="11" rx="3" fill="#FED7AA" />
          <rect x="16" y="6" width="5" height="10" rx="2.5" fill="#FED7AA" />
        </g>
      )}

      {/* 14. Encouraging & 17. Playful: Pointing Finger */}
      {(exp === 'encouraging' || exp === 'playful') && (
        <g id="hand-pointing" transform="translate(136, 112)">
          <rect x="0" y="4" width="18" height="6" rx="3" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" transform="rotate(-15)" />
          <circle cx="2" cy="8" r="6" fill="#FFE0CE" />
        </g>
      )}

      {/* 19. Kangen: Holding Cute White Cat/Bunny Plushie */}
      {exp === 'kangen' && (
        <g id="cat-plushie" transform="translate(78, 125)">
          {/* Plushie Head */}
          <ellipse cx="22" cy="15" rx="20" ry="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Ears */}
          <polygon points="8,5 12,0 16,6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <polygon points="28,6 32,0 36,5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Tiny Face */}
          <circle cx="16" cy="14" r="1.8" fill="#1E293B" />
          <circle cx="28" cy="14" r="1.8" fill="#1E293B" />
          <path d="M 20 18 Q 22 20 24 18" stroke="#1E293B" strokeWidth="1.2" fill="none" />
          {/* Plushie Blush */}
          <ellipse cx="13" cy="16" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.6" />
          <ellipse cx="31" cy="16" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.6" />
          {/* Alin's hands holding plushie */}
          <circle cx="2" cy="15" r="5.5" fill="#FFE0CE" />
          <circle cx="42" cy="15" r="5.5" fill="#FFE0CE" />
        </g>
      )}

      {/* 21. Yakin: Thumb to Self */}
      {exp === 'yakin' && (
        <g id="hand-thumb" transform="translate(132, 114)">
          <rect x="-8" y="2" width="14" height="6" rx="3" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" transform="rotate(-30)" />
          <circle cx="8" cy="10" r="7" fill="#FFE0CE" />
        </g>
      )}

      {/* 22. Penasaran: Propping Chin with Both Hands */}
      {exp === 'penasaran' && (
        <g id="both-hands-chin" transform="translate(72, 122)">
          <ellipse cx="12" cy="8" rx="7" ry="5.5" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" />
          <ellipse cx="44" cy="8" rx="7" ry="5.5" fill="#FFE0CE" stroke="#FDBA74" strokeWidth="1" />
        </g>
      )}

      {/* 23. Tidur: Hugging Soft White Pillow */}
      {exp === 'tidur' && (
        <g id="pillow" transform="translate(56, 138)">
          <rect x="0" y="0" width="88" height="36" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M 12 18 Q 44 26 76 18" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
          {/* Hands hugging pillow */}
          <circle cx="22" cy="10" r="6" fill="#FFE0CE" />
          <circle cx="66" cy="10" r="6" fill="#FFE0CE" />
        </g>
      )}

      {/* 24. Love: Hands making Heart Shape 🫶 */}
      {exp === 'love' && (
        <g id="heart-hands" transform="translate(80, 124)">
          <path
            d="M 10 14 C 6 6 14 0 20 6 C 20 6 20 18 20 18 C 20 18 20 6 26 6 C 32 0 40 6 36 14 C 32 20 20 26 20 26 C 20 26 14 20 10 14 Z"
            fill="#FFE0CE"
            stroke="#FDBA74"
            strokeWidth="1.5"
          />
          <path d="M 18 10 C 18 7 14 7 14 10 C 14 13 18 15 20 17 C 22 15 26 13 26 10 C 26 7 22 7 22 10" stroke="#FB7185" strokeWidth="1.5" fill="none" />
        </g>
      )}
    </svg>
  );
};
