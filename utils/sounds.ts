import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound URLs - free sounds from Pixabay/Freesound
const celebrationSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1718ab41b.mp3';
const stappaSoundUrl = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3'; // Beer bottle open/cork pop
const cheerSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1718ab41b.mp3'; // Crowd cheer
const overflowSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_e50b63ba05.mp3'; // Liquid pouring

let celebrationSound: Audio.Sound | null = null;
let stappaSound: Audio.Sound | null = null;
let cheerSound: Audio.Sound | null = null;
let overflowSound: Audio.Sound | null = null;

async function playSound(soundUrl: string, volume: number = 0.5): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      const audio = new window.Audio(soundUrl);
      audio.volume = volume;
      await audio.play();
    } catch (error) {
      console.error('Failed to play sound on web:', error);
    }
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: soundUrl },
      { shouldPlay: true, volume }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
}

export async function playCelebrationSound() {
  await playSound(celebrationSoundUrl, 0.5);
}

export async function playStappaSound() {
  await playSound(stappaSoundUrl, 0.6);
}

export async function playCheerSound() {
  await playSound(cheerSoundUrl, 0.5);
}

export async function playOverflowSound() {
  await playSound(overflowSoundUrl, 0.4);
}

export async function unloadSounds() {
  const sounds = [celebrationSound, stappaSound, cheerSound, overflowSound];
  
  for (const sound of sounds) {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Failed to unload sound:', error);
      }
    }
  }
  
  celebrationSound = null;
  stappaSound = null;
  cheerSound = null;
  overflowSound = null;
}
