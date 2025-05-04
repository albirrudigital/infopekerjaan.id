// Utilitas untuk memutar efek suara di aplikasi

// Cache untuk instance Audio agar tidak membuat instance baru setiap kali
const audioCache: Record<string, HTMLAudioElement> = {};

// Audio Context untuk membuat suara sintetis
let audioContext: AudioContext | null = null;

// Daftar efek suara yang tersedia
export const SOUNDS = {
  ACHIEVEMENT_UNLOCK: '/sounds/achievement-unlock.mp3',
  ACHIEVEMENT_BRONZE: '/sounds/achievement-bronze.mp3',
  ACHIEVEMENT_SILVER: '/sounds/achievement-silver.mp3',
  ACHIEVEMENT_GOLD: '/sounds/achievement-gold.mp3',
  ACHIEVEMENT_PLATINUM: '/sounds/achievement-platinum.mp3',
};

// Inisialisasi AudioContext jika belum ada
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Membuat efek suara sintetis secara realtime
 * (Digunakan sebagai fallback jika file audio belum tersedia)
 * @param type Jenis efek suara
 * @param duration Durasi efek suara dalam detik
 */
export function createSyntheticSound(type: 'unlock' | 'bronze' | 'silver' | 'gold' | 'platinum'): void {
  try {
    const ctx = getAudioContext();
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const duration = type === 'platinum' ? 2.0 : type === 'gold' ? 1.5 : type === 'silver' ? 1.2 : 1.0;
    
    // Konfigurasikan oscillator berdasarkan jenis achievement
    switch (type) {
      case 'unlock':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        oscillator1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1100, ctx.currentTime); // Sekitar C#6
        oscillator2.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.15); // Sekitar C#7
        break;
        
      case 'bronze':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        oscillator1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        oscillator1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(523.25 / 2, ctx.currentTime); // C4
        break;
        
      case 'silver':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        oscillator1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
        oscillator1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.2); // C6
        
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(659.25 / 2, ctx.currentTime); // E4
        break;
        
      case 'gold':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
        oscillator1.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1); // B5
        oscillator1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2); // E6
        
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(783.99 / 2, ctx.currentTime); // G4
        break;
        
      case 'platinum':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
        oscillator1.frequency.setValueAtTime(1396.91, ctx.currentTime + 0.1); // F6
        oscillator1.frequency.setValueAtTime(1760.00, ctx.currentTime + 0.2); // A6
        oscillator1.frequency.setValueAtTime(2093.00, ctx.currentTime + 0.3); // C7
        
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.setValueAtTime(987.77 / 2, ctx.currentTime); // B4
        break;
    }
    
    // Atur envelope gain
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    // Hubungkan nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Mulai dan akhiri oscillator
    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  } catch (error) {
    console.error('Error generating synthetic sound:', error);
  }
}

/**
 * Memuat efek suara dari URL
 * @param url Path ke file suara
 * @returns Instance HTMLAudioElement
 */
export function loadSound(url: string): HTMLAudioElement {
  if (audioCache[url]) {
    return audioCache[url];
  }
  
  const audio = new Audio(url);
  audioCache[url] = audio;
  return audio;
}

/**
 * Memutar efek suara
 * @param soundUrl Path ke file suara
 * @param options Opsi untuk memutar suara
 */
export function playSound(
  soundUrl: string, 
  options: { volume?: number; loop?: boolean } = {}
): void {
  // Tidak gunakan efek suara pada server-side render
  if (typeof window === 'undefined') return;
  
  try {
    const sound = loadSound(soundUrl);
    
    // Reset ke awal jika sedang diputar
    sound.currentTime = 0;
    
    // Atur volume (0-1)
    if (options.volume !== undefined) {
      sound.volume = Math.max(0, Math.min(1, options.volume));
    }
    
    // Atur loop
    sound.loop = !!options.loop;
    
    // Putar suara
    sound.play().catch(err => {
      console.error('Error playing sound:', err);
    });
  } catch (error) {
    console.error('Error initializing sound:', error);
  }
}

/**
 * Memutar efek suara achievement berdasarkan level
 * @param level Level achievement
 */
export function playAchievementSound(level: string): void {
  let soundUrl = SOUNDS.ACHIEVEMENT_UNLOCK;
  
  // Gunakan sound khusus untuk tiap level jika tersedia
  switch (level) {
    case 'platinum':
      soundUrl = SOUNDS.ACHIEVEMENT_PLATINUM || SOUNDS.ACHIEVEMENT_UNLOCK;
      break;
    case 'gold':
      soundUrl = SOUNDS.ACHIEVEMENT_GOLD || SOUNDS.ACHIEVEMENT_UNLOCK;
      break;
    case 'silver':
      soundUrl = SOUNDS.ACHIEVEMENT_SILVER || SOUNDS.ACHIEVEMENT_UNLOCK;
      break;
    case 'bronze':
      soundUrl = SOUNDS.ACHIEVEMENT_BRONZE || SOUNDS.ACHIEVEMENT_UNLOCK;
      break;
  }
  
  playSound(soundUrl, { volume: 0.6 });
}