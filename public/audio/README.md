# Ambient Audio

Place a file named `ambient.mp3` in this directory.

**Spec:**
- Duration: 3–5 seconds, set to loop seamlessly (no click at loop point)
- Character: low-frequency drone, sub-bass pad, no melody — something like a processed
  room tone or a sine wave cluster in the 40–80 Hz range
- Bit rate: 128 kbps MP3 minimum
- Loudness: normalised to -18 LUFS so the JS `volume: 0.18` cap feels comfortable

**Tools to generate:**
- Audacity: `Generate → Tone` (sine, 60 Hz, 4 s) → fade in/out 50ms → export MP3
- Browser AudioContext: can procedurally generate in-browser if an MP3 is unavailable
- Free source: freesound.org search "drone loop", filter by CC0

**Without the file the AudioToggle button will silently fail** (`Audio.play()` rejects
with a 404); the component catches this error so the rest of the UI is unaffected.
