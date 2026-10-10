/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect, useCallback } from 'react';
import { CAD3DAudioSystem } from '../../audio';

export function useCAD3DAudioController(soundEnabled: boolean) {
  const audioSystemRef = useRef<CAD3DAudioSystem>(new CAD3DAudioSystem());

  useEffect(() => {
    audioSystemRef.current.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  const playLadderRungSound = useCallback((isUp: boolean) => {
    audioSystemRef.current.playLadderRungSound(isUp);
  }, []);

  const playFootstepSound = useCallback(() => {
    audioSystemRef.current.playFootstepSound();
  }, []);

  const playQuestCompleteSound = useCallback(() => {
    audioSystemRef.current.playQuestCompleteSound();
  }, []);

  const playDoorSound = useCallback((isOpen: boolean) => {
    audioSystemRef.current.playDoorSound(isOpen);
  }, []);

  return {
    playLadderRungSound,
    playFootstepSound,
    playQuestCompleteSound,
    playDoorSound,
  };
}
