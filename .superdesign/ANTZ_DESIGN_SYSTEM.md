# Antz Design System — Hard Constraint

**Source of truth:** `Antz Colours.pdf` + `Antz Typography.pdf`
**Canonical tokens:** `.superdesign/design_iterations/antz_theme.css`

---

## Rule

When designing **any** UI for this project, I am restricted to:

1. **Only** the colors listed below (by hex — no ad-hoc tints, no external palettes, no blues except the two brand navy shades used for *on-container* text).
2. **Only** the **Inter** typeface — no other Google Fonts, no Geist, no serif, no mono substitutions.
3. **Only** the 17 type styles defined below — no invented sizes/weights.

Every HTML I generate MUST `@import` or `<link>` `antz_theme.css` and use semantic classes (`antz-display-title`, etc.) or CSS variables.

---

## Color Tokens

### Core (MD3 Antz)
| Name | Hex | Use |
|---|---|---|
| addPrimary | `#00AFD6` | add / cyan accent |
| displaybgPrimary | `#E8F4F2` | elevated display bg |
| displaybgSecondary | `#DDEBE9` | subtler display bg |
| moderateSecondary | `#E4B819` | warning amber |
| moderatePrimary | `#FFE86E` | attention yellow |
| notes | `#FCF4AE` | notes / highlight |
| neutralPrimary | `#000000` | primary text |
| neutralSecondary | `#7A8684` | muted text |
| neutral_05 | `rgba(0,0,0,0.05)` | hairline overlay |
| neutral_50 | `rgba(0,0,0,0.40)` | dim overlay |

### Brand
| Name | Hex |
|---|---|
| Primary | `#37BD69` |
| OnPrimary | `#FFFFFF` |
| PrimaryContainer | `#52F990` |
| OnPrimaryContainer | `#1F515B` |
| Secondary | `#00D6C9` |
| OnSecondary | `#FFFFFF` |
| SecondaryContainer | `#AFEFEB` |
| OnSecondaryContainer | `#1F415B` |
| SecondaryDark | `#00ABAB` |
| Tertiary | `#FA6140` |
| OnTertiary | `#FFFFFF` |
| TertiaryContainer | `#FFBDA8` |
| OnTertiaryContainer | `#250E01` |

### State
| Name | Hex |
|---|---|
| Error | `#E93353` |
| OnError | `#FFFFFF` |
| ErrorContainer | `#FFD3D3` |
| OnErrorContainer | `#4A0415` |

### Surface
| Name | Hex |
|---|---|
| Background | `#EFF5F2` |
| OnBackground | `#E1F9ED` |
| Surface | `#F2FFF8` |
| OnSurface | `#006D35` |
| SurfaceVariant | `#DAE7DF` |
| OnSurfaceVariant | `#44544A` |
| Outline | `#839D8D` |
| OutlineVariant | `#C3CEC7` |

### Priority
| Name | Hex |
|---|---|
| Priority 01 | `#FB4364` |
| Priority 01 base | `#FFEBEF` |
| Priority 02 | `#8479F9` |
| Priority 02 base | `#E8EAFA` |
| Permanent | `#7D1BCA` |

### Opacity
| Name | Value |
|---|---|
| green @ 50% | `rgba(45,193,194,0.50)` |
| Primarywhite25 | `rgba(255,255,255,0.25)` |
| OnPrimarycont20 | `rgba(31,81,91,0.20)` |
| OnPrimary75 | `rgba(255,255,255,0.75)` |

---

## Typography — Inter only

| Style | Weight | Size | Class |
|---|---|---|---|
| Display Title | SemiBold (600) | 48px | `.antz-display-title` |
| Large Title | SemiBold (600) | 36px | `.antz-large-title` |
| Stat Title | SemiBold (600) | 28px | `.antz-stat-title` |
| Major Title | SemiBold (600) | 24px | `.antz-major-title` |
| Major Medium | Medium (500) | 24px | `.antz-major-medium` |
| Medium Title | Bold (700) | 20px | `.antz-medium-title` |
| Medium Medium | Medium (500) | 20px | `.antz-medium-medium` |
| Minor Title | SemiBold (600) | 16px | `.antz-minor-title` |
| Minor Medium | Medium (500) | 16px | `.antz-minor-medium` |
| Minor Regular | Regular (400) | 16px | `.antz-minor-regular` |
| Minor Reg Italic | Italic (400) | 16px | `.antz-minor-italic` |
| Body Title | SemiBold (600) | 14px | `.antz-body-title` |
| Body Medium | Medium (500) | 14px, 0.10px tracking | `.antz-body-medium` |
| Body Regular | Regular (400) | 14px | `.antz-body-regular` |
| Subtext Title | SemiBold (600) | 12px | `.antz-subtext-title` |
| Subtext Regular | Regular (400) | 12px | `.antz-subtext-regular` |
| Small | Medium (500) | 10px | `.antz-small` |

Line-height: `Automatic` → sensible defaults per style in the CSS.
Letter-spacing: `0` except Body Medium (`0.10px`).

---

## What NOT to use

- ❌ No indigo / generic blues (#3B82F6, #6366F1, etc.)
- ❌ No Bootstrap primary blue
- ❌ No Tailwind default palette (slate/zinc/sky/rose/etc.) — override with tokens above
- ❌ No Geist, Space Mono, DM Sans, Poppins, Playfair, or any font other than Inter
- ❌ No arbitrary font sizes (13px, 15px, 18px, etc.) — snap to the scale above
