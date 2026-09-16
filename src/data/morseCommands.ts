export type MorseCommandId =
  | 'auto_tap'
  | 'stop'
  | 'withdraw'
  | 'diamond'
  | 'debit'
  | 'spin'
  | 'level_up'
  | 'next_stage';

export interface MorseCommand {
  id: MorseCommandId;
  title: string;
  code: string; // Exact command code: AA**, SP**, WD**, DMD**, DBT*, S***, LVP****, NTG*
  compactCode: string;
  aliases: string[];
  description: string;
}

export const MORSE_COMMANDS: MorseCommand[] = [
  {
    id: 'auto_tap',
    title: 'Auto tap',
    code: 'AA**',
    compactCode: 'AA**',
    aliases: ['AA**', 'AA--', 'AA++', 'AUTOTAP', 'AUTO TAP'],
    description: 'Execute auto tap for player which instantly gets added to balance as if user is tapping.',
  },
  {
    id: 'stop',
    title: 'Stop',
    code: 'SP**',
    compactCode: 'SP**',
    aliases: ['SP**', 'SP--', 'SP++', 'STOP'],
    description: 'Automatically stops auto tap so player taps manually.',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    code: 'WD**',
    compactCode: 'WD**',
    aliases: ['WD**', 'WD--', 'WD++', 'WITHDRAW'],
    description: 'Opens secret $ reserve withdrawal interface for crypto wallet withdrawal.',
  },
  {
    id: 'diamond',
    title: 'Diamond',
    code: 'DMD**',
    compactCode: 'DMD**',
    aliases: ['DMD**', 'DMD--', 'DMD++', 'DIAMOND'],
    description: 'Opens upgraded 15-chart Morse lucky chance wheel for diamonds, keys, cash & points.',
  },
  {
    id: 'debit',
    title: 'Debit',
    code: 'DBT*',
    compactCode: 'DBT*',
    aliases: ['DBT*', 'DBT-', 'DBT+', 'DEBIT'],
    description: 'Allows player to deduct point balance by a custom amount.',
  },
  {
    id: 'spin',
    title: 'Spin',
    code: 'S***',
    compactCode: 'S***',
    aliases: ['S***', 'S---', 'S+++', 'SPIN'],
    description: '15-chart Morse lucky chance wheel: keys, diamonds, $ reserves, extra spins, points (6 spins / 24h).',
  },
  {
    id: 'level_up',
    title: 'Level up',
    code: 'LVP****',
    compactCode: 'LVP****',
    aliases: ['LVP****', 'LVP----', 'LVP++++', 'LEVELUP', 'LEVEL UP'],
    description: 'Automatically completes and rounds up current level giving total calculated points.',
  },
  {
    id: 'next_stage',
    title: 'Next stage',
    code: 'NTG*',
    compactCode: 'NTG*',
    aliases: ['NTG*', 'NTG-', 'NTG+', 'NEXTSTAGE', 'NEXT STAGE', 'STAGE 2'],
    description: 'Upgrades the game interface and color to Stage 2 with 30 levels.',
  },
];

/**
 * Match user input against known secret Morse/Terminal commands.
 * Normalizes input: case-insensitive, space-insensitive, and allows * or - or +.
 */
export function matchMorseCommand(input: string): MorseCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  const cleanNoSpaces = upper.replace(/\s+/g, '');
  // Normalize symbols: treats -, + as * so players typing either symbol work seamlessly
  const normalizedAsterisks = cleanNoSpaces.replace(/[-+]/g, '*');

  for (const cmd of MORSE_COMMANDS) {
    const targetCode = cmd.code;

    // 1. Direct match with primary code (e.g. AA**, SP**, S***, etc.)
    if (cleanNoSpaces === targetCode || normalizedAsterisks === targetCode) {
      return cmd;
    }

    // 2. Check if input ends with the code (in case of preceding chars in typing stream)
    if (cleanNoSpaces.endsWith(targetCode) || normalizedAsterisks.endsWith(targetCode)) {
      return cmd;
    }

    // 3. Match explicit full aliases (case-insensitive, no spaces)
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        const cleanAlias = alias.toUpperCase().replace(/\s+/g, '');
        if (cleanNoSpaces === cleanAlias || normalizedAsterisks === cleanAlias) {
          return cmd;
        }
      }
    }

    // 4. Match plain English title or ID
    if (trimmed.toLowerCase() === cmd.title.toLowerCase() || trimmed.toLowerCase() === cmd.id.toLowerCase()) {
      return cmd;
    }
  }

  return null;
}
