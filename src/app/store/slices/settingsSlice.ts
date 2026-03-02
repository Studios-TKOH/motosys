import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  volume: number;
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
}

const initialState: SettingsState = {
  soundEnabled: true,
  vibrationEnabled: true,
  volume: 50,
  fontSize: 'large', // Default large for elderly users
  highContrast: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleVibration(state) {
      state.vibrationEnabled = !state.vibrationEnabled;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(10, Math.min(100, action.payload));
    },
    setFontSize(state, action: PayloadAction<'normal' | 'large' | 'xlarge'>) {
      state.fontSize = action.payload;
    },
    toggleHighContrast(state) {
      state.highContrast = !state.highContrast;
    },
  },
});

export const { toggleSound, toggleVibration, setVolume, setFontSize, toggleHighContrast } = settingsSlice.actions;
export default settingsSlice.reducer;
