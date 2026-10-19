/**
 * SAO Link Start - a reference-guided recreation of the login sequence,
 * rebuilt for the Harness Web UI and played
 * once whenever the app opens.
 *
 * Recreated beats:
 *   0.0s  white field
 *   0.0s  perspective beams with camera-space clipping
 *   4.35s five separately tracked dials, measured against the user recording
 *   7.4s  the five tracked dials turn green in their right-hand slots
 *   8.0s  azure "Language" pill, then the Japanese pill slides out and flips cyan
 *   9.9s  the teal "Log in_::" panel with :account and :password fields
 *  11.0s  the character-registration tab and dialog
 *  13.8s  fade back to the app
 */
// [dsh-compat-mode-patch v3] Optional compatibility mode (Settings → SAO Link Start), off by default.
window.__ModuleLoader__.load({
  id: 'dsh-sao-link-start',
  factory(require) {
    const React = require('react');
    const {
      SettingsForm,
      SettingsFormModel,
      SettingsValueField,
      settingsNumberField,
      settingsTextField,
    } = require('@deepseek-ai/dsh-client-ui-primitives');
    const h = React.createElement;
    const { useEffect, useRef, useState } = React;

    const NS = 'sao-link-start';
    const clamp = (value, min, max, fallback) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
    };
    const bootConfig = window.__SAO_LINK_START_CONFIG__ || {};
    const settingText = (value, fallback, max) => {
      if (typeof value !== 'string') return fallback;
      const text = value.trim();
      return text ? text.slice(0, max) : fallback;
    };
    const SETTINGS = {
      beamSpeed: clamp(bootConfig.beamSpeed, 0.4, 2.5, 1),
      beamLength: clamp(bootConfig.beamLength, 0.4, 2.5, 1),
      beamDensity: clamp(bootConfig.beamDensity, 0.4, 2, 1),
      dialScale: clamp(bootConfig.dialScale, 0.35, 1.2, 0.65),
      languageName: settingText(bootConfig.languageName, 'Japanese', 24),
      characterName: settingText(bootConfig.characterName, 'Kirito(M)', 32),
    };

    /* ----------------------------------------------- compatibility mode (opt-in) */
    // Off (default) = the original 1.3.x rendering: five SVGs rewritten with
    // width/height/font-size every frame, 2x device pixel ratio, AudioContext
    // created during boot. On = a compositor-friendly fallback for low-end GPUs:
    // fixed-box dial transforms, capped DPR with adaptive degradation, and audio
    // deferred to the first gesture. Read on every overlay mount, so Ctrl+Alt+L
    // replays with the current choice.
    const COMPAT_STORAGE_KEY = 'dsh:sao-link-start:compatibility-mode';
    function readCompatibilityMode() {
      try {
        const stored = window.localStorage.getItem(COMPAT_STORAGE_KEY);
        if (stored === 'on') return true;
        if (stored === 'off') return false;
      } catch (err) {
        /* storage can be blocked; the original rendering path stays the default */
      }
      return false;
    }
    function writeCompatibilityMode(enabled) {
      try {
        window.localStorage.setItem(COMPAT_STORAGE_KEY, enabled ? 'on' : 'off');
      } catch (err) {
        /* the checkbox still applies to this page even without storage */
      }
    }

    /* ------------------------------------------------------------------ text */

    const EN = {
      hint: 'CLICK OR PRESS ESC TO SKIP',
      settingsTitle: 'SAO Link Start',
      settingsDescription: 'Tune the startup tunnel and five-sense dial sequence.',
      beamSpeed: 'Beam speed', beamSpeedHint: 'Higher values create a faster fly-through.',
      beamLength: 'Beam length', beamLengthHint: 'Controls the capsule trail length.',
      beamDensity: 'Beam density', beamDensityHint: 'Controls how many beams are emitted.',
      dialScale: 'Dial size', dialScaleHint: 'Scales all five circular HUD dials.',
      languageName: 'Language name', languageNameHint: 'Text shown beside the Language pill.',
      characterName: 'Character name', characterNameHint: 'Name shown in the final registration dialog.',
      compatMode: 'Compatibility mode (low-end fallback)',
      compatModeHint: 'Off (default) = original rendering, i.e. the high-fidelity performance path (2x DPR, per-frame layout). On = compositor-friendly fallback for low-end GPUs or stutter: DPR capped at 1.5, transform-only dials, deferred audio. Applies on the next replay (Ctrl+Alt+L) or app start.',
      overridden: 'Overridden', reset: 'Reset to default', readOnly: 'Settings are read-only.',
      unavailable: 'The SAO animation plugin is not loaded.', save: 'Save', saving: 'Saving…',
      saveFailed: 'The values could not be saved.', invalidNumber: 'Enter a valid number.',
      restartHint: 'Save, then restart Harness to preview the new values.',
    };
    const ZH = {
      hint: '点击任意处或按 ESC 跳过',
      settingsTitle: 'SAO 连结开始动画',
      settingsDescription: '调整启动光束与五感圆盘动画。',
      beamSpeed: '光束穿梭速度', beamSpeedHint: '数值越高，冲向镜头的速度越快。',
      beamLength: '光束长度', beamLengthHint: '控制彩色胶囊光束的拖尾长度。',
      beamDensity: '光束数量', beamDensityHint: '控制同屏出现的光束密度。',
      dialScale: '圆盘整体大小', dialScaleHint: '统一缩放五个圆形 HUD。',
      languageName: '语言名称', languageNameHint: '显示在 Language 标签右侧，例如 Japanese。',
      characterName: '人物名称', characterNameHint: '显示在最后的角色确认框中，例如 Kirito(M)。',
      compatMode: '兼容模式（低配回退）',
      compatModeHint: '默认关闭 = 使用原版渲染，即性能模式（2x DPR、逐帧精确布局）。开启后改用合成器友好的精简路径（DPR 上限 1.5、圆盘只走 transform、音频延后），适合核显/低配机器或卡顿时。改完按 Ctrl+Alt+L 重播即生效，下次启动也生效。',
      overridden: '已覆盖', reset: '恢复默认', readOnly: '当前设置为只读。',
      unavailable: 'SAO 动画插件当前未加载。', save: '保存', saving: '保存中…',
      saveFailed: '设置保存失败，请检查数值。', invalidNumber: '请输入有效数字。',
      restartHint: '保存后重启 Harness，即可预览新参数。',
    };

    /* --------------------------------------------------------------- timing */

    const T_END = 13.85;
    const T_UNMOUNT = 14.4;
    const T_REDUCED_LEAVE = 700;
    const T_REDUCED_UNMOUNT = 1050;

    /* ------------------------------------------------------------------ art */

    /* Original unixzii/SAOLinkStart ViewController.swift palette (Unlicense). */
    const BEAM_COLORS = [
      '#a9001b', '#cfe125', '#00db22', '#b400b4',
      '#00cfb7', '#5c5c5c', '#101010',
    ];

    /**
     * Link-Start tunnel, ported from unixzii/SAOLinkStart (Unlicense).
     *
     * Capsules live in 3D: each sits at a random angle and radius (20..50),
     * starts ~110 units ahead, and flies along +Z toward a 65-degree camera.
     * Perspective projection turns them into streaks that swell as they pass,
     * with the original speed/birth increments, adapted to this shorter intro.
     */
    function Burst(props) {
      const compatMode = props.compatMode === true;
      const ref = useRef(null);

      useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !canvas.getContext) return undefined;
        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        let dpr = Math.min(window.devicePixelRatio || 1, compatMode ? 1.5 : 2);
        let w = 0;
        let h = 0;
        let focal = 1;

        const resize = () => {
          w = canvas.clientWidth || window.innerWidth;
          h = canvas.clientHeight || window.innerHeight;
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          focal = (h / 2) / Math.tan((65 * Math.PI / 180) / 2);
        };
        resize();
        window.addEventListener('resize', resize);

        const beams = [];
        let travel = 0.03;
        let birth = 1;
        let emitted = 0;
        let lastEmit = performance.now();

        const spawn = () => {
          const pioneer = emitted < 3;
          beams.push({
            a: Math.random() * Math.PI * 2,
            r: (4 + Math.floor(Math.random() * 7)) * 5,
            z: -100 - Math.random() * 20,
            len: (pioneer ? 1.2 + Math.random() * 1.8 : 4 + Math.random() * 18) * SETTINGS.beamLength,
            sp: pioneer ? 0.8 + Math.random() * 0.2 : 0,
            c: BEAM_COLORS[Math.floor(Math.random() * BEAM_COLORS.length)],
            alpha: 0,
          });
          emitted += 1;
        };

        for (let i = 0; i < Math.round(50 * SETTINGS.beamDensity); i += 1) spawn();
        emitted = 0;

        const t0 = performance.now();
        let raf = 0;
        let last = 0;
        // Compatibility mode: adaptive quality — keep an EMA of frame times and
        // degrade once (1x DPR, no capsule noses) when the machine cannot keep up.
        let slowFrames = 0;
        let degraded = false;
        let drawNoses = true;

        const tick = (now) => {
          const t = now - t0;
          const dt = last ? Math.min(48, now - last) : 16;
          last = now;
          const k = dt / 16.67;
          if (compatMode) {
            slowFrames = slowFrames * 0.92 + (dt > 24 ? 1 : 0);
            if (!degraded && t > 160 && slowFrames > 2.2) {
              degraded = true;
              drawNoses = false;
              dpr = 1;
              resize();
            }
          }

          if (now - lastEmit > 100 && emitted <= 500 * SETTINGS.beamDensity) {
            lastEmit = now;
            if (birth < 50 * SETTINGS.beamDensity) birth += 2 * SETTINGS.beamDensity;
            if (travel < 7.2 * SETTINGS.beamSpeed) travel += 0.52 * SETTINGS.beamSpeed;
            const n = Math.floor(birth);
            for (let i = 0; i < n; i += 1) spawn();
          }

          for (let i = beams.length - 1; i >= 0; i -= 1) {
            const b = beams[i];
            b.z += (travel + b.sp) * k;
            if (b.alpha < 1) b.alpha = Math.min(1, b.alpha + 0.12 * k);
            if (b.z - b.len >= 0) beams.splice(i, 1);
          }
          beams.sort((p, q) => p.z - q.z);

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);
          ctx.lineCap = 'round';
          const cx = w / 2;
          const cy = h / 2;

          for (let i = 0; i < beams.length; i += 1) {
            const b = beams[i];
            // Clip in camera space BEFORE projection. A constant-width stroke
            // used the huge near width even at its distant tail, causing flashes.
            const ux = Math.sin(b.a) * b.r;
            const uy = Math.cos(b.a) * b.r;
            const clip = Math.max(1,
              focal * Math.abs(ux) / (w / 2 + 48),
              focal * Math.abs(uy) / (h / 2 + 48));
            const dF = -b.z + b.len;
            if (dF <= clip) continue;
            const dN = Math.max(clip, -b.z);
            const xn = cx + ux / dN * focal;
            const yn = cy + uy / dN * focal;
            const xf = cx + ux / dF * focal;
            const yf = cy + uy / dF * focal;
            const nearWidth = 1.2 * focal / dN;
            const farWidth = 1.2 * focal / dF;
            const nx = -Math.cos(b.a), ny = Math.sin(b.a);
            ctx.globalAlpha = b.alpha * 0.68;
            ctx.fillStyle = b.c;
            ctx.beginPath();
            ctx.moveTo(xn + nx * nearWidth, yn + ny * nearWidth);
            ctx.lineTo(xf + nx * farWidth, yf + ny * farWidth);
            ctx.lineTo(xf - nx * farWidth, yf - ny * farWidth);
            ctx.lineTo(xn - nx * nearWidth, yn - ny * nearWidth);
            ctx.closePath();
            ctx.fill();
            // Restore the rounded capsule nose while keeping its projected
            // radius bounded; the bound prevents the old full-screen flash.
            if ((!compatMode || drawNoses) && dN > clip * 1.02 && nearWidth < 70) {
              ctx.beginPath();
              ctx.arc(xn, yn, nearWidth, 0, Math.PI * 2);
              ctx.fill();
            }
            // Only the far cap is visible; never draw a giant near-plane cap.
            ctx.beginPath();
            ctx.arc(xf, yf, farWidth, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;

          if (t < 4100) {
            raf = requestAnimationFrame(tick);
          } else {
            ctx.clearRect(0, 0, w, h);
          }
        };

        raf = requestAnimationFrame(tick);

        return () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', resize);
        };
      }, [compatMode]);

      return h('canvas', { className: 'sao-burst-canvas', 'aria-hidden': 'true', ref });
    }

    function hexPoints(cx, cy, r) {
      const pts = [];
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 180) * (60 * i - 90);
        pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
      }
      return pts.join(' ');
    }

    /**
     * One dial, matched to the reference close-up: a flat cyan disc, thick
     * lavender wedges ringed in white, a few bevelled white arcs, and a large
     * inner "lens" of concentric thin arcs around the label chip.
     */
    function Dial(props) {
      const seed = props.seed || 0;
      const offset = seed * 11;
      const kids = [];

      kids.push(h('circle', { key: 'disc', cx: 100, cy: 100, r: 99.5, fill: '#3fc8dc' }));
      kids.push(h('circle', {
        key: 'sheen', cx: 100, cy: 100, r: 99.5, fill: 'url(#sao-sheen)',
      }));

      /* outer lavender wedges: white edge drawn wider, then the fill */
      const wedge = '58 30';
      kids.push(h('circle', {
        key: 'wedgeEdge', cx: 100, cy: 100, r: 92.5, fill: 'none', stroke: '#ffffff',
        strokeWidth: 12.4, strokeDasharray: wedge, strokeDashoffset: offset,
      }));
      kids.push(h('circle', {
        key: 'wedgeFill', cx: 100, cy: 100, r: 92.5, fill: 'none', stroke: '#8b7fd6',
        strokeWidth: 10.6, strokeDasharray: wedge, strokeDashoffset: offset,
      }));

      /* bevelled white arcs: a darker cyan shadow underneath, white on top */
      const arcs = [
        { r: 84, dash: '150 16', w: 1.2 },
        { r: 79.5, dash: '96 11', w: 0.9 },
        { r: 74, dash: '190 22', w: 1.0 },
      ];
      arcs.forEach((a, i) => {
        kids.push(h('circle', {
          key: `ash${i}`, cx: 100, cy: 100 + 0.45, r: a.r, fill: 'none',
          stroke: '#2fa9be', strokeWidth: a.w, strokeDasharray: a.dash,
          strokeDashoffset: offset * (i + 1), opacity: 0.55,
        }));
        kids.push(h('circle', {
          key: `arc${i}`, cx: 100, cy: 100, r: a.r, fill: 'none', stroke: '#ffffff',
          strokeWidth: a.w, strokeDasharray: a.dash,
          strokeDashoffset: offset * (i + 1),
        }));
      });

      /* the inner lens: two concentric thin arcs leave the plate spacious */
      [
        { r: 60, w: 1.4, o: 0.85 },
        { r: 50, w: 1.1, o: 0.7 },
      ].forEach((c, i) => {
        kids.push(h('circle', {
          key: `lensS${i}`, cx: 100, cy: 100 + 0.4, r: c.r, fill: 'none',
          stroke: '#2aa7bd', strokeWidth: c.w, opacity: 0.45,
        }));
        kids.push(h('circle', {
          key: `lens${i}`, cx: 100, cy: 100, r: c.r, fill: 'none',
          stroke: '#ffffff', strokeWidth: c.w, opacity: c.o,
        }));
      });

      /* one hexagon stud, as on the reference */
      kids.push(h('polygon', {
        key: 'hex0',
        points: hexPoints(100 + 92 * Math.cos(0.42 + seed), 100 + 92 * Math.sin(0.42 + seed), 2.4),
        fill: '#ffffff', stroke: '#2fb4cb', strokeWidth: 0.6,
      }));

      return h('div', { className: props.cls || 'sao-dial', style: props.style },
        h('svg', { viewBox: '0 0 200 200', className: 'sao-dial-svg', 'aria-hidden': 'true' },
          h('defs', null,
            h('linearGradient', { id: 'sao-sheen', x1: '0.1', y1: '0', x2: '0.9', y2: '1' },
              h('stop', { offset: '0', stopColor: '#ffffff', stopOpacity: '0.22' }),
              h('stop', { offset: '0.42', stopColor: '#ffffff', stopOpacity: '0.02' }),
              h('stop', { offset: '1', stopColor: '#ffffff', stopOpacity: '0.10' }))),
          kids),
        props.chip ? h('span', { className: 'sao-chip' }, props.chip) : null);
    }

    // Keyframes measured from the user's recording (seconds, x/W, y/H, diameter/H).
    // Each physical dial travels into its own right-hand slot; no duplicate stack.
    const DIAL_PATHS = [
      { label: 'Touch', ok: 5.2, frames: [[4.35,.49,.52,.025],[4.65,.48,.52,.12],[4.9,.18,.69,1.15],[5.1,.15,.75,1.25],[5.3,.16,.75,1.26],[5.5,.34,.63,1.18],[5.7,.75,.26,.48],[5.95,.91,.12,.20]] },
      { label: 'sight', ok: 5.4, frames: [[4.4,.52,.50,.025],[4.7,.53,.50,.07],[4.95,.75,.48,.72],[5.1,.81,.49,.96],[5.5,.84,.50,.96],[5.7,.84,.53,.92],[5.9,.87,.36,.56],[6.1,.91,.31,.20]] },
      { label: 'Hearing', ok: 6.45, frames: [[5.8,.47,.53,.025],[5.95,.47,.53,.13],[6.1,.08,.76,1.25],[6.3,.06,.87,1.38],[6.5,.14,.88,1.42],[6.7,.4,.8,1.15],[6.9,.88,.55,.24],[7.08,.91,.50,.20]] },
      { label: 'Taste', ok: 6.75, frames: [[5.9,.5,.51,.025],[6.1,.52,.48,.10],[6.35,.59,.15,1.08],[6.5,.61,.13,1.2],[6.7,.63,.12,1.28],[6.9,.55,.14,1.12],[7.15,.91,.69,.20]] },
      { label: 'Smell', ok: 7.0, frames: [[6.1,.48,.54,.025],[6.4,.44,.57,.10],[6.6,.1,.9,.96],[6.9,.09,.78,1.04],[7.1,.47,.84,.8],[7.35,.91,.88,.20]] },
    ];
    function DialSequence(props) {
      const compatMode = props.compatMode === true;
      const ref = useRef(null);
      useEffect(() => {
        const root = ref.current;
        const nodes = [...root.children];
        // Compatibility mode caches per-dial writes so only real changes touch
        // the style system; the !compatMode branch below is the original path.
        const slots = compatMode ? nodes.map((node) => ({
          chip: node.querySelector('.sao-chip'),
          opacity: null,
          filter: null,
          z: null,
          text: null,
        })) : null;
        let width = root.clientWidth;
        let height = root.clientHeight;
        const measure = () => { width = root.clientWidth; height = root.clientHeight; };
        if (compatMode) window.addEventListener('resize', measure);
        const t0 = performance.now();
        let raf;
        const tick = (now) => {
          const t = (now - t0) / 1000;
          if (!compatMode) { width = root.clientWidth; height = root.clientHeight; }
          DIAL_PATHS.forEach((path, index) => {
            const node = nodes[index], frames = path.frames;
            if (t < frames[0][0] || t >= 7.95) { node.style.opacity = '0'; return; }
            let a = frames[frames.length - 1], b = a;
            for (let j = 1; j < frames.length; j++) {
              if (t < frames[j][0]) { a = frames[j - 1]; b = frames[j]; break; }
            }
            const f = a === b ? 1 : Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
            const u = f * f * (3 - 2 * f);
            const x = a[1] + (b[1] - a[1]) * u;
            const y = a[2] + (b[2] - a[2]) * u;
            const diameter = a[3] + (b[3] - a[3]) * u;
            const exit = Math.max(0, Math.min(1, (t - 7.7) / .25));
            const opacity = String(Math.min(1, (t - frames[0][0]) / .08));
            const size = diameter * height * SETTINGS.dialScale;
            const chipText = t >= path.ok ? 'OK' : path.label;
            const zIndex = t >= frames[frames.length - 1][0] ? '10' : String(5 - index);
            if (!compatMode) {
              /* original path: rewrite layout-affecting styles every frame */
              node.style.opacity = opacity;
              node.style.width = `${size}px`;
              node.style.height = `${size}px`;
              node.style.fontSize = `${size * .075}px`;
              node.style.transform = `translate(${x * width + exit * width * .2}px,${y * height}px) translate(-50%,-50%)`;
              node.style.filter = t >= 7.4 ? 'hue-rotate(-52deg) saturate(1.35)' : 'none';
              node.style.zIndex = zIndex;
              node.querySelector('.sao-chip').textContent = chipText;
              return;
            }
            /* compatibility path: fixed 200x200 box scaled on the compositor */
            const slot = slots[index];
            if (slot.opacity !== opacity) { node.style.opacity = opacity; slot.opacity = opacity; }
            node.style.transform = `translate(${x * width + exit * width * .2}px,${y * height}px) scale(${size / 200}) translate(-50%,-50%)`;
            const filter = t >= 7.4 ? 'hue-rotate(-52deg) saturate(1.35)' : 'none';
            if (slot.filter !== filter) { node.style.filter = filter; slot.filter = filter; }
            if (slot.z !== zIndex) { node.style.zIndex = zIndex; slot.z = zIndex; }
            if (slot.text !== chipText) { slot.chip.textContent = chipText; slot.text = chipText; }
          });
          if (t < 8) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => {
          cancelAnimationFrame(raf);
          if (compatMode) window.removeEventListener('resize', measure);
        };
      }, [compatMode]);
      return h('div', { className: 'sao-field sao-tracked-field', ref },
        DIAL_PATHS.map((path, i) => h(Dial, { key: path.label, cls: 'sao-tracked-dial', chip: path.label, seed: i })));
    }

    /* ---------------------------------------------------------------- audio */

    function createBootAudio(elapsed = 0) {
      let ac = null;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ac = new AC();
      } catch (err) {
        return null;
      }

      const master = ac.createGain();
      master.gain.value = 0.5;
      master.connect(ac.destination);

      const tone = (opts) => {
        const at = ac.currentTime + (opts.t0 || 0);
        const dur = opts.dur || 0.3;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = opts.type || 'sine';
        osc.frequency.setValueAtTime(opts.f, at);
        if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, at + dur);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(opts.gain || 0.05, at + Math.min(0.04, dur * 0.3));
        gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(at);
        osc.stop(at + dur + 0.05);
      };

      const air = (opts) => {
        const at = ac.currentTime + (opts.t0 || 0);
        const dur = opts.dur || 0.4;
        const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
        const buffer = ac.createBuffer(1, frames, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < frames; i += 1) {
          const k = i / frames;
          data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * k);
        }
        const src = ac.createBufferSource();
        src.buffer = buffer;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(opts.from || 900, at);
        if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, at + dur);
        filter.Q.value = 0.7;
        const gain = ac.createGain();
        gain.gain.value = opts.gain || 0.05;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        src.start(at);
      };

      const schedule = () => {
        if (ac.state !== 'running') return;
        // The context may start late (first gesture). Only queue cues that are
        // still ahead; replaying passed cues would desync from the animation.
        const at = (seconds) => Math.max(0, seconds - elapsed);
        const pending = (seconds) => seconds - elapsed > 0.04;
        if (pending(0.95)) air({ t0: at(0.95), dur: 1.7, from: 420, to: 3600, gain: 0.1 });
        [5.2, 5.4, 6.45, 6.75, 7.0].forEach((d, i) => {
          if (pending(d)) tone({ f: 1180 + i * 120, type: 'sine', t0: at(d), dur: 0.14, gain: 0.03 });
        });
        [7.4, 7.5, 7.6].forEach((d) => {
          if (pending(d)) tone({ f: 1760, type: 'triangle', t0: at(d), dur: 0.18, gain: 0.035 });
        });
        [8.0, 8.45, 9.9, 11.0, 11.65].forEach((d) => {
          if (pending(d)) tone({ f: 880, type: 'square', t0: at(d), dur: 0.05, gain: 0.018 });
        });
        if (pending(13.7)) air({ t0: at(13.7), dur: 0.5, from: 2200, to: 300, gain: 0.04 });
      };

      try {
        if (ac.state === 'suspended') {
          const resumed = ac.resume();
          if (resumed && typeof resumed.then === 'function') {
            resumed.then(() => schedule()).catch(() => {});
          } else {
            schedule();
          }
        } else {
          schedule();
        }
      } catch (err) {
        /* Audio is decorative; a blocked context is not a failure. */
      }

      return {
        close() {
          try {
            ac.close();
          } catch (err) {
            /* already closed */
          }
        },
      };
    }

    /* -------------------------------------------------------------- component */

    function BootScreen(props) {
      const t = props.t || (() => undefined);
      const tr = (key) => {
        const value = t(key);
        if (value && value !== key) return value;
        return EN[key] !== undefined ? EN[key] : key;
      };

      const [leaving, setLeaving] = useState(false);
      const [done, setDone] = useState(false);
      const [reduced] = useState(() => {
        try {
          return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        } catch (err) {
          return false;
        }
      });
      const audioRef = useRef(null);
      const [compatMode] = useState(readCompatibilityMode);

      useEffect(() => {
        const finish = () => setLeaving(true);
        const leaveAt = reduced ? T_REDUCED_LEAVE : T_END * 1000;
        const doneAt = reduced ? T_REDUCED_UNMOUNT : T_UNMOUNT * 1000;
        const timers = [
          window.setTimeout(finish, leaveAt),
          window.setTimeout(() => setDone(true), doneAt),
        ];
        const onKey = (event) => {
          if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finish();
        };
        window.addEventListener('keydown', onKey);
        return () => {
          timers.forEach((id) => window.clearTimeout(id));
          window.removeEventListener('keydown', onKey);
        };
      }, [reduced]);

      useEffect(() => {
        if (!leaving) return undefined;
        const id = window.setTimeout(() => setDone(true), 620);
        return () => window.clearTimeout(id);
      }, [leaving]);

      useEffect(() => {
        if (reduced) return undefined;
        if (!compatMode) {
          audioRef.current = createBootAudio();
          return () => {
            if (audioRef.current) audioRef.current.close();
            audioRef.current = null;
          };
        }
        // Compatibility mode: build the AudioContext on the first user gesture.
        // Doing it during boot costs a thread plus main-thread work while DSH is
        // still loading plugin bundles, and Chromium suspends it until then.
        const startedAt = performance.now();
        const events = ['pointerdown', 'keydown', 'touchstart'];
        let disposed = false;
        const start = () => {
          events.forEach((name) => window.removeEventListener(name, start, true));
          if (disposed) return;
          audioRef.current = createBootAudio((performance.now() - startedAt) / 1000);
        };
        events.forEach((name) => window.addEventListener(name, start, true));
        return () => {
          disposed = true;
          events.forEach((name) => window.removeEventListener(name, start, true));
          if (audioRef.current) audioRef.current.close();
          audioRef.current = null;
        };
      }, [reduced, compatMode]);

      if (done) return null;

      return h('div', {
        className: 'sao-root' + (compatMode ? ' is-compat' : '') + (leaving ? ' is-leaving' : ''),
        'aria-hidden': 'true',
        role: 'presentation',
        onClick: () => setLeaving(true),
      },
        h('style', null, CSS),
        h('div', { className: 'sao-bg' }),

        !reduced && h(Burst, { compatMode }),


        !reduced && h(DialSequence, { compatMode }),

        h('div', { className: 'sao-lang' },
          h('span', { className: 'sao-pill sao-pill-lang' }, 'Language'),
          h('span', { className: 'sao-pill sao-pill-jp' },
            h('i', { className: 'sao-tri' }),
            h('span', null, SETTINGS.languageName))),

        h('div', { className: 'sao-login' },
          h('div', { className: 'sao-login-title' }, 'Log in_::'),
          h('div', { className: 'sao-login-form' },
            h('div', { className: 'sao-field-row' },
              h('span', { className: 'sao-field-label' }, ':account'),
              h('span', { className: 'sao-input sao-input-account' }, '*********')),
            h('div', { className: 'sao-field-row' },
              h('span', { className: 'sao-field-label' }, ':password'),
              h('span', { className: 'sao-input sao-input-pass' },
                h('i', { className: 'sao-star s1' }, '***'),
                h('i', { className: 'sao-star s2' }, '****'),
                h('i', { className: 'sao-star s3' }, '**'))))),

        h('div', { className: 'sao-reg' },
          h('div', { className: 'sao-reg-tab' }, 'キャラクター登録'),
          h('div', { className: 'sao-reg-panel' },
            h('p', { className: 'sao-reg-text' },
              'βテスト時に登録したデータが',
              h('br'),
              '残っていますが、使用しますか？'),
            h('div', { className: 'sao-reg-name' }, SETTINGS.characterName),
            h('div', { className: 'sao-reg-actions' },
              h('span', { className: 'sao-reg-btn' }, 'YES'),
              h('span', { className: 'sao-reg-btn' }, 'NO')))),

        h('div', { className: 'sao-hint' }, tr('hint'))
      );
    }

    /* -------------------------------------------------------------------- CSS */

    const CSS = `
@keyframes sao-fade{from{opacity:0}to{opacity:1}}
@keyframes sao-out{from{opacity:1}to{opacity:0;visibility:hidden}}
@keyframes sao-lang-life{
  0%{opacity:0;transform:translateX(-16vmin)}
  7%{opacity:1;transform:none}
  84%{opacity:1;transform:none}
  100%{opacity:0;transform:translateX(9vmin)}
}
@keyframes sao-jp-life{
  0%{opacity:0;transform:translateX(-20vmin);background-color:#1a7fe0}
  26%{opacity:1;transform:none;background-color:#1a7fe0}
  46%{background-color:#37e0e0}
  100%{opacity:1;transform:none;background-color:#37e0e0}
}
@keyframes sao-jp-out{
  0%,86%{opacity:1}
  100%{opacity:0}
}
@keyframes sao-login-life{
  0%{opacity:0;transform:translateX(-18vmin)}
  8%{opacity:1;transform:none}
  74%{opacity:1;transform:none}
  100%{opacity:0;transform:translateX(-10vmin)}
}
@keyframes sao-reg-life{
  0%{opacity:0;transform:translateY(6vmin) scale(.94)}
  10%{opacity:1;transform:none}
  76%{opacity:1;transform:none}
  100%{opacity:0;transform:translateY(-2vmin)}
}
@keyframes sao-star-1{0%,44%{opacity:0}52%{opacity:1}100%{opacity:1}}
@keyframes sao-star-2{0%,66%{opacity:0}74%{opacity:1}100%{opacity:1}}
@keyframes sao-star-3{0%,84%{opacity:0}92%{opacity:1}100%{opacity:1}}
@keyframes sao-name-pop{
  0%,52%{opacity:0;transform:scaleX(.7)}
  64%{opacity:1;transform:none}
  100%{opacity:1;transform:none}
}
@keyframes sao-blink{0%,100%{opacity:.28}50%{opacity:.7}}

.sao-root{
  position:fixed;inset:0;z-index:2147483000;overflow:hidden;isolation:isolate;
  background:#e9ece8;cursor:pointer;pointer-events:auto;
  user-select:none;-webkit-user-select:none;
  font-family:"Segoe UI","Yu Gothic UI","Meiryo","Microsoft YaHei UI",system-ui,sans-serif;
  animation:sao-out .58s ease 13.82s both;
}
.sao-root.is-leaving{animation:sao-out .45s ease both}

.sao-bg{position:absolute;inset:0;
  background:
    radial-gradient(70% 90% at 78% 12%,rgba(255,255,255,.85),transparent 60%),
    linear-gradient(118deg,#eef0ec 0%,#e6e9e5 46%,#dfe4df 62%,#eceeeb 100%)}

/* Canvas tunnel: 3D capsules projected through a 65-degree camera. */
.sao-burst-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;
  pointer-events:none;
  animation:sao-canvas-out .35s ease 3.7s both}
@keyframes sao-canvas-out{from{opacity:1}to{opacity:0}}
.sao-core{position:absolute;left:50%;top:50%;width:10vmin;height:10vmin;
  margin:-5vmin 0 0 -5vmin;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,#fff 0%,rgba(255,255,255,.85) 30%,rgba(255,255,255,.25) 62%,transparent 82%);
  filter:blur(3px);animation:sao-core-life 2.3s ease .2s both}
@keyframes sao-core-life{
  0%{opacity:0;transform:scale(.35)}
  14%{opacity:1}
  58%{opacity:.8}
  100%{opacity:0;transform:scale(1.6)}
}

.sao-field{position:absolute;inset:0;pointer-events:none}
.sao-tracked-dial{position:absolute;left:0;top:0;width:200px;height:200px;
  opacity:0;transform-origin:center;will-change:transform}
/* compatibility mode: the same 200x200 box is scaled instead of resized */
.sao-root.is-compat .sao-tracked-dial{font-size:15px;transform-origin:0 0;will-change:transform,opacity}
.sao-tracked-dial .sao-chip{width:28%;height:9%;font-size:inherit;letter-spacing:0;
  padding:0;box-shadow:none;background:#dcf4ea;color:#69bdbe}
.sao-tracked-dial .sao-dial-svg{filter:none}
.sao-dial{position:absolute;left:50%;top:50%;width:120vmin;height:120vmin;
  margin:-60vmin 0 0 -60vmin;opacity:0;font-size:4.6vmin}
.sao-dial-svg{width:100%;height:100%;display:block;
  filter:drop-shadow(0 1.4vmin 3vmin rgba(50,150,170,.18))}
.sao-chip{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  display:grid;place-items:center;width:9.4em;height:2.1em;
  background:linear-gradient(180deg,#f4fefa 0%,#ddf7e9 100%);color:#63c4a6;
  font-size:1.35em;font-weight:300;letter-spacing:.28em;padding-left:.28em;
  text-shadow:0 0 .16em rgba(255,255,255,.95);
  box-shadow:0 0 .5em rgba(130,220,200,.4)}

.sao-lang{position:absolute;left:17.4%;top:29.2%;display:flex;align-items:center;
  opacity:0;animation:sao-lang-life 2s cubic-bezier(.2,.8,.2,1) 8s both}
.sao-pill{display:inline-flex;align-items:center;justify-content:center;
  height:9.8vmin;border-radius:1.5vmin;background:#1a7fe0;color:#fff;
  font-size:6vmin;letter-spacing:.01em;box-shadow:0 1vmin 2.4vmin rgba(30,110,190,.18)}
.sao-pill-lang{padding:0 6vmin}
.sao-pill-jp{position:absolute;left:100%;margin-left:-1.2vmin;padding:0 3vmin 0 0;
  opacity:0;animation:sao-jp-life .55s ease 8.45s both,sao-jp-out .6s ease 9.7s forwards}
.sao-tri{display:block;width:0;height:0;margin:0 2.2vmin 0 3.4vmin;
  border-left:2.6vmin solid #fff;border-top:1.7vmin solid transparent;
  border-bottom:1.7vmin solid transparent}

.sao-login{position:absolute;left:25.2%;top:33.6%;width:min(88vmin,88vw);height:30.6vmin;
  border-radius:2vmin;background:#1a86b6;border:.3vmin solid rgba(255,255,255,.55);
  display:flex;align-items:center;padding:0 4vmin;box-sizing:border-box;
  box-shadow:0 1.4vmin 3.4vmin rgba(30,120,150,.22);
  opacity:0;animation:sao-login-life 2.15s cubic-bezier(.2,.8,.2,1) 9.9s both}
.sao-login-title{font-size:6.4vmin;color:#fff;letter-spacing:.02em;flex:0 0 auto}
.sao-login-form{display:flex;flex-direction:column;gap:2.4vmin;margin-left:4.4vmin}
.sao-field-row{display:flex;flex-direction:column;gap:.7vmin}
.sao-field-label{font-size:4.2vmin;color:#fff;line-height:1}
.sao-input{display:block;min-width:35vmin;height:3.4vmin;background:#fff;border-radius:.3vmin;
  color:#111;font-size:3vmin;line-height:3.4vmin;letter-spacing:.16em;padding:0 .6vmin;
  box-sizing:border-box;overflow:hidden;white-space:nowrap}
.sao-input-pass{position:relative}
.sao-star{position:absolute;left:.6vmin;top:0;font-style:normal;opacity:0}
.sao-star.s1{animation:sao-star-1 1.1s steps(1) 10.45s both}
.sao-star.s2{animation:sao-star-2 1.1s steps(1) 10.45s both}
.sao-star.s3{animation:sao-star-3 1.1s steps(1) 10.45s both}

.sao-reg{position:absolute;left:0;right:0;top:31.5%;display:flex;flex-direction:column;
  align-items:center;pointer-events:none;
  opacity:0;animation:sao-reg-life 2.7s cubic-bezier(.2,.8,.2,1) 11s both}
.sao-reg-tab{height:8.6vmin;display:grid;place-items:center;padding:0 6vmin;
  border-radius:2.4vmin;background:#1a7fb8;border:.42vmin solid #b5b5b5;
  color:#fff;font-size:5.4vmin;letter-spacing:.08em;
  box-shadow:0 1.2vmin 3vmin rgba(30,120,150,.2)}
.sao-reg-panel{margin-top:1.2vmin;width:min(121vmin,94vw);box-sizing:border-box;
  border-radius:2.6vmin;background:#1a86b6;border:.46vmin solid #b0b0b0;
  padding:4.6vmin 6vmin 5vmin;box-shadow:0 1.6vmin 3.6vmin rgba(30,120,150,.22)}
.sao-reg-text{margin:0 auto;width:fit-content;color:#fff;font-size:4.6vmin;
  line-height:1.5;letter-spacing:.02em;text-align:left}
.sao-reg-name{margin:3.6vmin auto 0;width:41vmin;height:6.6vmin;display:grid;place-items:center;
  background:#37e0e0;border:.24vmin solid rgba(255,255,255,.75);
  color:#eafffb;font-size:4.2vmin;letter-spacing:.3em;padding-left:.3em;
  animation:sao-name-pop .6s ease 11.65s both}
.sao-reg-actions{display:flex;justify-content:center;gap:19vmin;margin-top:4.4vmin}
.sao-reg-btn{display:grid;place-items:center;width:21vmin;height:5.6vmin;border-radius:999px;
  background:#37e0e0;color:#fff;font-size:4vmin;letter-spacing:.06em;
  box-shadow:0 .6vmin 1.6vmin rgba(30,150,170,.28)}

.sao-hint{position:absolute;left:50%;bottom:3vmin;transform:translateX(-50%);
  font-size:clamp(9px,1.05vmin,13px);letter-spacing:.22em;color:#9aa9a4;white-space:nowrap;
  opacity:0;animation:sao-fade .6s ease 2.6s both,sao-blink 2.6s ease-in-out 3.2s infinite}

/* settings-page switch for the optional compatibility path */
.sao-compat-toggle{display:flex;align-items:flex-start;gap:1.1em;box-sizing:border-box;
  width:100%;max-width:760px;margin:0 0 1.6em;padding:1.1em 1.3em;cursor:pointer;
  border:1px solid rgba(148,163,184,.22);border-radius:10px;background:rgba(148,163,184,.06);
  color:inherit;font:inherit;line-height:1.55}
.sao-compat-toggle input{flex:0 0 auto;width:16px;height:16px;margin:.18em 0 0;accent-color:#38bdf8;cursor:pointer}
.sao-compat-toggle-text{display:flex;flex-direction:column;gap:.28em;font-size:13px}
.sao-compat-toggle-text small{font-size:12px;opacity:.72;line-height:1.5}

@media (max-width:900px){
  .sao-login{height:auto;padding:3vmin 4vmin;flex-direction:column;align-items:flex-start;gap:2vmin}
  .sao-login-form{margin-left:0}
}
@media (prefers-reduced-motion:reduce){
  .sao-root,.sao-root *{animation-duration:.001ms!important;animation-delay:0ms!important;
    animation-iteration-count:1!important;transition:none!important}
  .sao-burst-canvas,.sao-core{display:none}
}
`;

    // A fresh key disposes the previous canvas, timers and audio before replay.
    // Useful when tuning the effect without restarting the desktop host.
    function BootOverlay(props) {
      const [run, setRun] = useState(0);
      useEffect(() => {
        const replay = (event) => {
          if (event.ctrlKey && event.altKey && event.code === 'KeyL' && !event.repeat) {
            event.preventDefault();
            setRun((value) => value + 1);
          }
        };
        window.addEventListener('keydown', replay, true);
        return () => window.removeEventListener('keydown', replay, true);
      }, []);
      return h(BootScreen, { ...props, key: run });
    }

    /* ----------------------------------------------------------- settings UI */

    const SETTING_FIELDS = [
      ['beamSpeed', 'beamSpeed', 'beamSpeedHint', 'number'],
      ['beamLength', 'beamLength', 'beamLengthHint', 'number'],
      ['beamDensity', 'beamDensity', 'beamDensityHint', 'number'],
      ['dialScale', 'dialScale', 'dialScaleHint', 'number'],
      ['languageName', 'languageName', 'languageNameHint', 'text'],
      ['characterName', 'characterName', 'characterNameHint', 'text'],
    ];

    function formLabels(t) {
      return {
        unavailable: t('unavailable'), readOnly: t('readOnly'),
        saveFailed: t('saveFailed'), save: t('save'), saving: t('saving'),
      };
    }

    function SaoSettingsCard(props) {
      const { t } = props;
      const state = props.useSaoSettingsCard((snapshot) => snapshot);
      return h(SettingsForm, {
        labels: formLabels(t), state, onSave: props.save, onDiscard: props.discard,
      },
      ...SETTING_FIELDS.map(([field, label, hint, type]) => h(SettingsValueField, {
        key: field,
        id: `plugin-config-sao-${field}`,
        label: t(label), hint: t(hint),
        overriddenLabel: t('overridden'), resetLabel: t('reset'),
        invalidLabel: type === 'number' ? t('invalidNumber') : undefined,
        numeric: type === 'number',
        disabled: !state.writable,
        ...state[field],
        onEdit: (text) => props.edit(field, text),
        onReset: () => props.resetField(field),
      })),
      h('p', {
        style: {
          margin: '14px 0 0', color: 'var(--text-tertiary, #7d8794)',
          fontSize: 13, lineHeight: 1.6,
        },
      }, t('restartHint')));
    }

    function CompatModeToggle(props) {
      const [enabled, setEnabled] = useState(readCompatibilityMode);
      return h('label', { className: 'sao-compat-toggle' },
        h('input', {
          type: 'checkbox',
          checked: enabled,
          onChange: () => {
            const next = !enabled;
            writeCompatibilityMode(next);
            setEnabled(next);
          },
        }),
        h('span', { className: 'sao-compat-toggle-text' },
          h('strong', null, props.t('compatMode')),
          h('small', null, props.t('compatModeHint'))));
    }

    function SaoSettingsSection(props) {
      return h('section', {
        style: { width: '100%', maxWidth: 760, padding: '8px 0 32px' },
      },
      h('header', { style: { marginBottom: 24 } },
        h('h2', {
          style: { margin: '0 0 8px', fontSize: 22, fontWeight: 650, lineHeight: 1.35 },
        }, props.t('settingsTitle')),
        h('p', {
          style: {
            margin: 0, color: 'var(--text-secondary, #697386)',
            fontSize: 14, lineHeight: 1.6,
          },
        }, props.t('settingsDescription'))),
      h(CompatModeToggle, { t: props.t }),
      h(SaoSettingsCard, props));
    }

    class SaoSettingsController {
      constructor(scope) {
        this.form = new SettingsFormModel(scope, SETTING_FIELDS.map(([field, , , type]) => (
          type === 'number' ? settingsNumberField(field) : settingsTextField(field)
        )));
        this.store = this.form.bind(() => ({
          ...this.form.shell(),
          ...Object.fromEntries(SETTING_FIELDS.map(([field]) => [field, this.form.field(field)])),
        }));
      }
      inject() {
        return { hooks: { saoSettingsCard: this.store }, ...this.form.actions() };
      }
      dispose() { this.form.dispose(); }
    }

    /* ------------------------------------------------------------------ apply */

    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        const disposers = [];
        try {
          // Use the same dictionary registration contract as dshmarket.
          disposers.push(ctx.locale.register(NS, { zh: ZH, en: EN }));
        } catch (err) {
          /* locale is optional decoration for this overlay */
        }

        if (typeof ctx.effect === 'function') {
          ctx.effect(() => () => {
            disposers.forEach((dispose) => {
              try {
                dispose();
              } catch (err) {
                /* ignore */
              }
            });
          });
        }

        const translate = ctx.locale.bind(NS);

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'sao-link-start',
          order: 100,
        }, () => h(BootOverlay, { t: translate })));

        const settings = new SaoSettingsController(ctx.configForms.get('sao-link-start'));
        if (typeof ctx.effect === 'function') {
          ctx.effect(() => () => settings.dispose(), 'sao-link-start: settings form');
          // Match dshmarket: claim a first-class page in the Settings dialog's
          // left navigation instead of relying on a version-specific plugin card.
          ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
            name: 'settings.section',
            id: 'sao-link-start',
            order: 35,
            label: () => translate('settingsTitle'),
            locale: NS,
            inject: () => settings.inject(),
          }, (props) => h(SaoSettingsSection, { ...props, t: translate }))),
          'sao-link-start: settings section');
        }
      },
    };
  },
});
