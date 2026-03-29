let audioCtx = null;
function ctx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}
function beep(freq, dur, vol = 0.08, type = "sine") {
  try {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + dur);
    o.stop(c.currentTime + dur + 0.02);
  } catch {
  }
}
function playTick() {
  beep(880, 0.04, 0.06);
}
function playCorrect() {
  beep(523, 0.08, 0.1);
  setTimeout(() => beep(659, 0.1, 0.1), 70);
  setTimeout(() => beep(784, 0.15, 0.12), 150);
}
function playWrong() {
  beep(150, 0.2, 0.12, "sawtooth");
  setTimeout(() => beep(120, 0.25, 0.1, "sawtooth"), 100);
}
function playLeaderboardReveal() {
  beep(392, 0.1, 0.08);
  setTimeout(() => beep(523, 0.12, 0.09), 100);
  setTimeout(() => beep(659, 0.18, 0.1), 220);
}
async function unlockAudio() {
  try {
    await ctx().resume();
  } catch {
  }
}
export {
  playCorrect,
  playLeaderboardReveal,
  playTick,
  playWrong,
  unlockAudio
};
