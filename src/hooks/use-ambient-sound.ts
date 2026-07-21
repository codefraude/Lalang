"use client";

import * as React from "react";

/**
 * Procedural island ambience via the Web Audio API — no audio assets. A soft
 * filtered-noise "ocean" plus a gentle detuned pad. Never autoplays: the
 * AudioContext is created on the first user gesture (toggle), per browser policy.
 */
export function useAmbientSound() {
  const [on, setOn] = React.useState(false);
  const ctxRef = React.useRef<AudioContext | null>(null);
  const masterRef = React.useRef<GainNode | null>(null);

  const build = React.useCallback((ctx: AudioContext) => {
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const size = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 620;
    const swell = ctx.createGain();
    swell.gain.value = 0.4;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain).connect(swell.gain);
    noise.connect(lp).connect(swell).connect(master);

    for (const freq of [220, 277.18, 329.63]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.025;
      osc.connect(g).connect(master);
      osc.start();
    }
    noise.start();
    lfo.start();
    masterRef.current = master;
  }, []);

  const toggle = React.useCallback(async () => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctxRef.current = new Ctor();
      build(ctxRef.current);
    }
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (ctx.state === "suspended") await ctx.resume();
    const next = !on;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(next ? 0.35 : 0, ctx.currentTime + 0.8);
    setOn(next);
  }, [on, build]);

  React.useEffect(() => () => void ctxRef.current?.close(), []);

  return { on, toggle };
}
