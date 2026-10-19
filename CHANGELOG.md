# Changelog

## 1.5.0

- Add an optional **Tunnel only** intro (Settings → SAO Link Start, off by
  default). When enabled it plays only the perspective beam fly-through: the
  five-sense dials, language pill, login panel and character registration are
  not rendered, the overlay fades out at ~3.7 s and unmounts at ~4.3 s instead
  of 14.4 s, and audio keeps only the opening and exit whooshes.
- Preference key: `dsh:sao-link-start:tunnel-only`; applies on the next replay
  (Ctrl+Alt+L) or the next Harness start. Compatibility mode and Tunnel only are
  independent toggles.

## 1.4.1

- Rename the 1.4.0 option from "Performance mode" to **Compatibility mode** and
  make it **off by default**: the original 1.3.x rendering (the high-fidelity
  performance path: 2x DPR, exact per-frame layout) is the default. The fallback
  is for low-end GPUs or stutter.
- Settings copy now states explicitly that the default (unchecked) state is the
  original rendering path; check the box only when the overlay stutters.
- Preference key is now `dsh:sao-link-start:compatibility-mode`; the old
  `dsh:sao-link-start:performance-mode` key from 1.4.0 is ignored.
- Measured with the fallback enabled (replay-isolated headless Chromium):
  layout count 37 → 9, layout time 0.087 s → 0.028 s, style-recalculation time
  0.979 s → 0.252 s.

## 1.4.0

- Add an opt-in **Performance mode** (Settings → SAO Link Start, on by default).
  Unchecking it restores the 1.3.x frame-by-frame code path; both paths render
  identical visuals.
  - HUD dials animate with a compositor-only `transform: scale()` on a fixed
    200×200 box instead of rewriting `width`/`height`/`font-size` every frame.
  - Per-dial style writes are cached: `filter`, `z-index`, and chip text only
    update when they change.
  - Beam canvas device pixel ratio is capped at 1.5 and degrades to 1x (skipping
    capsule noses) when frame times stay long.
  - The `AudioContext` is created on the first user gesture, and cues that are
    already in the past are skipped instead of replayed late.
- The preference lives in `localStorage` (`dsh:sao-link-start:performance-mode`)
  and applies on the next replay (`Ctrl+Alt+L`) or the next Harness start.
- Measured on a replay-isolated headless Chromium run of one overlay: layout
  count 48 → 10, layout time 0.104 s → 0.004 s, style-recalculation time
  1.105 s → 0.340 s.

## 1.3.1

- Fix the browser module ID so it exactly matches the public package name.
- Remove infrastructure-only immediate prefetch from this feature plugin.
- Add a package contract regression test for both requirements.

## 1.3.0

- Add a first-class settings page in the Harness settings navigation.
- Add beam speed, length, density, and dial scale controls.
- Add configurable language and character labels.
- Clip beams in camera space to prevent near-plane flashes.
- Match the five HUD dial paths and reduce their default scale.
