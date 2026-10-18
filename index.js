import z from '@deepseek-ai/schemastery';

export const Config = z.object({
  beamSpeed: z.number().min(0.4).max(2.5).step(0.05).default(1)
    .role('slider').description('光束穿梭速度').volatile(),
  beamLength: z.number().min(0.4).max(2.5).step(0.05).default(1)
    .role('slider').description('光束长度').volatile(),
  beamDensity: z.number().min(0.4).max(2).step(0.05).default(1)
    .role('slider').description('光束数量').volatile(),
  dialScale: z.number().min(0.35).max(1.2).step(0.05).default(0.65)
    .role('slider').description('圆盘整体大小').volatile(),
  languageName: z.string().min(1).max(24).default('Japanese')
    .description('语言名称').volatile(),
  characterName: z.string().min(1).max(32).default('Kirito(M)')
    .description('人物名称').volatile(),
});

/** Make validated settings available before the browser plugin starts. */
export function apply(ctx, config) {
  ctx.on('webserver/index-inject', (table) => {
    const read = (value) => value && typeof value.get === 'function' ? value.get() : value;
    table.push({
      kind: 'global',
      name: '__SAO_LINK_START_CONFIG__',
      value: {
        beamSpeed: read(config.beamSpeed),
        beamLength: read(config.beamLength),
        beamDensity: read(config.beamDensity),
        dialScale: read(config.dialScale),
        languageName: read(config.languageName),
        characterName: read(config.characterName),
      },
    });
  });
}
