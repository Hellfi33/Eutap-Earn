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
  code: string; // Exact format with spaces
  compactCode: string; // Without spaces
  description: string;
}

export const MORSE_COMMANDS: MorseCommand[] = [
  {
    id: 'auto_tap',
    title: 'Auto tap',
    code: '*+ ++-* -*++ -**',
    compactCode: '*++++--*++-**',
    description: 'Execute auto tap for player which instantly gets added to balance as if user is tapping.',
  },
  {
    id: 'stop',
    title: 'Stop',
    code: '+--* --- -**- --*',
    compactCode: '+--*----**---*',
    description: 'Automatically stops auto tap so player taps manually.',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    code: '-*++ **- -*+ -**-',
    compactCode: '-*++**--*+-**-',
    description: 'Opens secret $ reserve withdrawal interface for crypto wallet withdrawal.',
  },
  {
    id: 'diamond',
    title: 'Diamond',
    code: '-+*+ +-** *-** -+*',
    compactCode: '-+*++-****--+*',
    description: 'Opens secret diamond spin wheel with 10 slices (1 to 7 diamonds winnable).',
  },
  {
    id: 'debit',
    title: 'Debit',
    code: '-**- +*- *-** -**',
    compactCode: '-**-+*-*---**',
    description: 'Allows player to deduct point balance by a custom amount.',
  },
  {
    id: 'spin',
    title: 'Spin',
    code: '---* *-+- -*++ -**-',
    compactCode: '---**-+--*++-**-',
    description: 'Lucky chance spin for diamonds (units & tens) and points (in millions).',
  },
  {
    id: 'level_up',
    title: 'Level up',
    code: '*-** ++-* *-*- +**',
    compactCode: '*-**++-**-*-+**',
    description: 'Automatically completes and rounds up current level giving total calculated points.',
  },
  {
    id: 'next_stage',
    title: 'Next stage',
    code: '-+*+ -*++ *--- +***',
    compactCode: '-+*+-*++*---+***',
    description: 'Upgrades the game interface and color to Stage 2 with 30 levels.',
  },
];

/**
 * Match a user input against known Morse commands
 * Accepts with or without spaces, ignoring trailing/leading whitespace
 */
export function matchMorseCommand(input: string): MorseCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const cleanNoSpaces = trimmed.replace(/\s+/g, '');

  for (const cmd of MORSE_COMMANDS) {
    if (trimmed === cmd.code) return cmd;
    if (cleanNoSpaces === cmd.compactCode) return cmd;
  }

  return null;
}
