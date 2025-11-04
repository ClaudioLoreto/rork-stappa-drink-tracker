import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const celebrationSoundUrl = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1718ab41b.mp3';

let celebrationSound: Audio.Sound | null = null;

export async function playCelebrationSound() {
  if (Platform.OS === 'web') {
    console.log('Sound playback on web - using browser audio');
    try {
      const audio = new window.Audio(celebrationSoundUrl);
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.error('Failed to play celebration sound on web:', error);
    }
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    if (celebrationSound) {
      await celebrationSound.unloadAsync();
      celebrationSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: celebrationSoundUrl },
      { shouldPlay: true, volume: 0.5 }
    );
    
    celebrationSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Failed to play celebration sound:', error);
  }
}

export async function unloadSounds() {
  if (celebrationSound) {
    try {
      await celebrationSound.unloadAsync();
      celebrationSound = null;
    } catch (error) {
      console.error('Failed to unload sounds:', error);
    }
  }
}
