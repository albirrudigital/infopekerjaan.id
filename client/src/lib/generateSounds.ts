// Fungsi untuk membuat suara sintetis achievement 
// dan mengekspornya sebagai file mp3/wav menggunakan Web Audio API

/**
 * Membuat file suara achievement dan mendownloadnya
 * (hanya digunakan di development untuk membuat file suara)
 */
export async function generateAchievementSounds() {
  // Fungsi untuk membuat achievement sound
  function createAchievementSound(
    type: 'unlock' | 'bronze' | 'silver' | 'gold' | 'platinum',
    duration: number = 1
  ) {
    // Buat audio context
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator1 = audioCtx.createOscillator();
    const oscillator2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Konfigurasikan oscillator berdasarkan jenis achievement
    switch (type) {
      case 'unlock':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator1.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1100, audioCtx.currentTime); // Sekitar C#6
        oscillator2.frequency.exponentialRampToValueAtTime(2200, audioCtx.currentTime + 0.15); // Sekitar C#7
        break;
        
      case 'bronze':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        oscillator1.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(523.25 / 2, audioCtx.currentTime); // C4
        break;
        
      case 'silver':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        oscillator1.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.1); // G5
        oscillator1.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.2); // C6
        
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(659.25 / 2, audioCtx.currentTime); // E4
        break;
        
      case 'gold':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
        oscillator1.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.1); // B5
        oscillator1.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.2); // E6
        
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(783.99 / 2, audioCtx.currentTime); // G4
        break;
        
      case 'platinum':
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
        oscillator1.frequency.setValueAtTime(1396.91, audioCtx.currentTime + 0.1); // F6
        oscillator1.frequency.setValueAtTime(1760.00, audioCtx.currentTime + 0.2); // A6
        oscillator1.frequency.setValueAtTime(2093.00, audioCtx.currentTime + 0.3); // C7
        
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.setValueAtTime(987.77 / 2, audioCtx.currentTime); // B4
        break;
    }
    
    // Atur envelope gain
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    // Hubungkan nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Mulai dan akhiri oscillator
    oscillator1.start(audioCtx.currentTime);
    oscillator2.start(audioCtx.currentTime);
    oscillator1.stop(audioCtx.currentTime + duration);
    oscillator2.stop(audioCtx.currentTime + duration);
    
    // Unduh file audio
    return new Promise<void>((resolve) => {
      // Buat offline audio context untuk rendering
      const offlineCtx = new OfflineAudioContext(
        2, // jumlah channel (stereo)
        44100 * duration, // sample rate * durasi
        44100 // sample rate
      );
      
      // Buat oscillator1 di offline context
      const offlineOsc1 = offlineCtx.createOscillator();
      offlineOsc1.type = oscillator1.type as OscillatorType;
      
      // Salin parameter frequency
      if (type === 'unlock') {
        offlineOsc1.frequency.setValueAtTime(880, offlineCtx.currentTime);
        offlineOsc1.frequency.exponentialRampToValueAtTime(1760, offlineCtx.currentTime + 0.1);
      } else if (type === 'bronze') {
        offlineOsc1.frequency.setValueAtTime(523.25, offlineCtx.currentTime);
        offlineOsc1.frequency.setValueAtTime(659.25, offlineCtx.currentTime + 0.1);
        offlineOsc1.frequency.setValueAtTime(783.99, offlineCtx.currentTime + 0.2);
      } else if (type === 'silver') {
        offlineOsc1.frequency.setValueAtTime(659.25, offlineCtx.currentTime);
        offlineOsc1.frequency.setValueAtTime(783.99, offlineCtx.currentTime + 0.1);
        offlineOsc1.frequency.setValueAtTime(1046.50, offlineCtx.currentTime + 0.2);
      } else if (type === 'gold') {
        offlineOsc1.frequency.setValueAtTime(783.99, offlineCtx.currentTime);
        offlineOsc1.frequency.setValueAtTime(987.77, offlineCtx.currentTime + 0.1);
        offlineOsc1.frequency.setValueAtTime(1318.51, offlineCtx.currentTime + 0.2);
      } else if (type === 'platinum') {
        offlineOsc1.frequency.setValueAtTime(987.77, offlineCtx.currentTime);
        offlineOsc1.frequency.setValueAtTime(1396.91, offlineCtx.currentTime + 0.1);
        offlineOsc1.frequency.setValueAtTime(1760.00, offlineCtx.currentTime + 0.2);
        offlineOsc1.frequency.setValueAtTime(2093.00, offlineCtx.currentTime + 0.3);
      }
      
      // Buat oscillator2 di offline context
      const offlineOsc2 = offlineCtx.createOscillator();
      offlineOsc2.type = oscillator2.type as OscillatorType;
      
      // Salin parameter frequency untuk oscillator2
      if (type === 'unlock') {
        offlineOsc2.frequency.setValueAtTime(1100, offlineCtx.currentTime);
        offlineOsc2.frequency.exponentialRampToValueAtTime(2200, offlineCtx.currentTime + 0.15);
      } else if (type === 'bronze') {
        offlineOsc2.frequency.setValueAtTime(523.25 / 2, offlineCtx.currentTime);
      } else if (type === 'silver') {
        offlineOsc2.frequency.setValueAtTime(659.25 / 2, offlineCtx.currentTime);
      } else if (type === 'gold') {
        offlineOsc2.frequency.setValueAtTime(783.99 / 2, offlineCtx.currentTime);
      } else if (type === 'platinum') {
        offlineOsc2.frequency.setValueAtTime(987.77 / 2, offlineCtx.currentTime);
      }
      
      // Buat gain node di offline context
      const offlineGain = offlineCtx.createGain();
      offlineGain.gain.setValueAtTime(0, offlineCtx.currentTime);
      offlineGain.gain.linearRampToValueAtTime(0.7, offlineCtx.currentTime + 0.02);
      offlineGain.gain.exponentialRampToValueAtTime(0.01, offlineCtx.currentTime + duration);
      
      // Hubungkan nodes
      offlineOsc1.connect(offlineGain);
      offlineOsc2.connect(offlineGain);
      offlineGain.connect(offlineCtx.destination);
      
      // Mulai dan akhiri oscillator
      offlineOsc1.start(0);
      offlineOsc2.start(0);
      offlineOsc1.stop(duration);
      offlineOsc2.stop(duration);
      
      // Render audio dan buat file
      offlineCtx.startRendering().then((renderedBuffer) => {
        // Konversi buffer ke wav
        const wav = bufferToWav(renderedBuffer);
        
        // Buat blob dan download
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `achievement-${type}.wav`;
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        resolve();
      });
    });
  }
  
  // Fungsi untuk mengkonversi AudioBuffer ke WAV (format file audio)
  function bufferToWav(abuffer: AudioBuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + length, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 is PCM)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, numOfChan, true);
    // sample rate
    view.setUint32(24, abuffer.sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, abuffer.sampleRate * 4, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numOfChan * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, length, true);
    
    // Write the PCM samples
    const channelData = [];
    let offset = 44;
    
    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channelData.push(abuffer.getChannelData(i));
    }
    
    while (offset < buffer.byteLength) {
      for (let i = 0; i < channelData.length; i++) {
        // Interleave channelData
        const index = (offset - 44) / (2 * channelData.length);
        
        if (index >= channelData[i].length) {
          break;
        }
        
        // Sample to 16-bit
        let sample = Math.max(-1, Math.min(1, channelData[i][index]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }
    
    return buffer;
  }
  
  // Fungsi helper untuk menulis string ke DataView
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  // Buat semua file suara achievement
  await createAchievementSound('unlock', 1.0);
  await createAchievementSound('bronze', 1.0);
  await createAchievementSound('silver', 1.2);
  await createAchievementSound('gold', 1.5);
  await createAchievementSound('platinum', 2.0);
}