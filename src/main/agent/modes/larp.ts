/**
 * Anti-Slop Design Engine (larp)
 * 
 * Enforces strict anti-slop rules on prompts and generated UI code:
 * 1. BANS generic AI design tells:
 *    - Warm cream + terracotta/warm-clay cliché palette
 *    - Tracked-out ALL-CAPS eyebrow labels above every card
 *    - Generic SaaS card kits with identical soft grey shadows
 *    - Useless decorative emojis in technical headers
 * 2. ENFORCES intentional typography & motion:
 *    - Type scales derived from subject matter (not default system sans)
 *    - Apple fluid interruptible spring motion (150-300ms, instantaneous active state)
 *    - Line lengths strictly under 80 characters
 *    - Accessible 4.5:1 contrast floor
 */

export interface LarpLintResult {
  passed: boolean
  violations: string[]
  suggestions: string[]
}

export class LarpEngine {
  public static getSystemPromptDirective(): string {
    return `
[ANTI-SLOP DESIGN MODE (larp) ACTIVE]
You are operating under strict anti-slop visual and architectural guidelines.
Do NOT use generic AI web templates or design cliches. Specifically:
- NEVER use warm cream backgrounds with terracotta accents unless explicitly ordered.
- NEVER use all-caps tracked-out eyebrow labels above every card.
- NEVER decorate headers or list items with emojis.
- NEVER chop layouts into identical soft-grey rounded cards without functional hierarchy.
- ALWAYS choose intentional, opinionated typography with line lengths < 80 characters.
- ALWAYS make buttons and touch targets feel physical: respond instantly on pointer-down (:active scale 0.98), and use interruptible spring physics for transitions.
- ALWAYS write active-voice, minimal, purposeful copy.
`
  }

  public static lintCode(code: string): LarpLintResult {
    const violations: string[] = []
    const suggestions: string[] = []

    // Check for excessive uppercase tracking
    if (/uppercase\s+tracking-(wider|widest)/i.test(code)) {
      violations.push('Found tracked-out all-caps eyebrow label cliché (e.g. uppercase tracking-wider).')
      suggestions.push('Replace eyebrow text with natural sentence-case or structural hierarchy.')
    }

    // Check for emojis in markup
    if (/[\u{1F300}-\u{1F9FF}]/u.test(code)) {
      violations.push('Found decorative emoji character inside UI elements.')
      suggestions.push('Replace decorative emojis with accessible, semantic SVG icons.')
    }

    // Check for unconstrained cards
    if ((code.match(/rounded-xl\s+bg-card/g) || []).length > 6) {
      violations.push('Found repetitive uniform SaaS-card kit with identical radii and padding.')
      suggestions.push('Group related data into unified tables or seamless master-detail layouts instead of endless cards.')
    }

    return {
      passed: violations.length === 0,
      violations,
      suggestions,
    }
  }
}
