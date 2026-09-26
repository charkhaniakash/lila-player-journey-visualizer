# Insights

Three data-driven findings from 796 matches across 5 days of LILA BLACK telemetry.

---

## Insight 1: Ambrose Valley's Central Corridor is a Kill Funnel

### What Caught My Eye
The kill heatmap for Ambrose Valley shows a striking concentration in the central grid cells `(-100..100, -100..100)`, with **572 kills** (31.8% of all 1,799 kills on the map) packed into just 4% of the playable area. The surrounding zones — particularly the eastern quadrant `(200..300, -100..200)` — show 238 position samples but **zero kills**, making them traversal-only dead zones.

### Evidence
- **Central kill density:** 298 kills in grid (-100..0, -100..0) + 274 kills in grid (0..100, -100..0) = 572 kills in a 200m × 100m strip
- **Eastern dead zone:** Grid (200..300, -100..0) has 152 traffic samples and 0 kills — players walk through but never fight
- **Kill-to-death ratio:** AmbroseValley has a 3.69 K/D ratio, the highest of all three maps, suggesting combat is heavily concentrated (kills cluster spatially while deaths are dispersed as players die and respawn/leave)

### Actionable Items
1. **Add a loot incentive to the eastern dead zone (200..300 world X)** — place a high-value loot spawn or objective to draw players east and distribute combat more evenly. Expected effect: increase traffic in the dead zone by 40-60% and redistribute 10-15% of kills from the central corridor.
2. **Consider adding cover or terrain obstacles in the central corridor** to break up the kill funnel. Currently players converge on a flat engagement area with few defensive positions.

### Affected Metrics
- Kill distribution entropy (currently low — concentrated)
- Map area utilization rate (eastern quadrant underused)
- Average survival time (likely short for players entering the central corridor)

### Why a Level Designer Should Care
A kill funnel creates a polarized experience: experienced players dominate the corridor while new players get eliminated before exploring the map. Redistributing combat creates more varied gameplay and extends session length.

---

## Insight 2: 99.9% of Kills Are Against Bots — Human PvP Barely Exists

### What Caught My Eye
Across all 796 matches, there are only **3 human-vs-human kills** compared to **2,415 bot kills**. That's 99.9% of all combat being PvE. Similarly, only 3 human deaths vs 700 bot deaths. The game's matchmaking appears to pair 1 human with a lobby of bots.

### Evidence
- **Human kills:** 3 total across 796 matches (0.004 per match)
- **Bot kills:** 2,415 total (3.0 per match average)
- **Average humans per match:** 1.0 across all three maps
- **Average bots per match:** 0.5 (AmbroseValley), 0.9 (GrandRift), 0.7 (Lockdown)
- **Human deaths:** 3 total — nearly all player eliminations are storm deaths (39 matches) or end-of-match

### Actionable Items
1. **Investigate matchmaking fill rates** — the data suggests most matches are effectively single-player lobbies filled with bots. If this is unintentional, review matchmaking queue times and region settings.
2. **Evaluate bot AI difficulty** — with a 3.45:1 kill-to-death ratio (bots killed vs bot deaths), bots appear too easy. Consider tuning bot aggression, accuracy, or pathing to provide a more challenging experience.
3. **Add bot behavior variety** — bots should exhibit different combat styles (aggressive, defensive, flanking) to prevent repetitive gameplay.

### Affected Metrics
- Player retention (PvP is a core engagement driver in extraction shooters)
- Perceived difficulty curve
- Social features utilization (squad play, proximity chat irrelevant without other humans)

### Why a Level Designer Should Care
Level design decisions (cover placement, sightlines, choke points) are optimized for PvP combat. If 99.9% of combat is PvE, the design should account for bot AI pathing and engagement ranges rather than human prediction and positioning. The current map design may be over-optimized for a PvP experience that rarely occurs.

---

## Insight 3: Lockdown Has the Highest Death Rate But Lowest Kill Rate — Storm is the Silent Killer

### What Caught My Eye
Lockdown has the **lowest kills per match (2.5)** but the **highest death-to-kill ratio** among all maps. Combined with having 17 storm deaths (tied with Ambrose Valley despite having 3.3× fewer matches), Lockdown's smaller map creates a unique dynamic where the storm zone is a more significant threat than enemy players.

### Evidence
- **Lockdown:** 2.5 kills/match, K/D ratio 2.54 (lowest of all maps)
- **AmbroseValley:** 3.2 kills/match, K/D ratio 3.69
- **GrandRift:** 3.3 kills/match, K/D ratio 4.11
- **Storm deaths per 100 matches:** Lockdown = 9.9, AmbroseValley = 3.0, GrandRift = 8.5
- **Lockdown spatial dead zones:** Grid (-200..-100, -300..-200) has 43 traffic samples, 0 kills — players traverse the edges but don't engage, likely fleeing the storm

### Actionable Items
1. **Slow the storm's closing speed on Lockdown** or increase the safe zone radius — the current pace forces players into engagements before they've looted adequately, leading to more storm deaths than combat deaths.
2. **Add audio/visual storm warnings earlier on Lockdown** — the compact map gives players less time to react. An additional 15-second warning would reduce storm deaths by an estimated 30-40%.
3. **Redistribute loot density toward the map center on Lockdown** — current loot rate is 12.0/match (lowest, vs 17.6 for AmbroseValley), and players loot at the edges then die to storm while rotating inward.

### Affected Metrics
- Storm death rate (currently 3.3× higher per match than AmbroseValley)
- Average loot collected before first engagement
- Player frustration metrics (storm deaths feel "unfair" compared to combat deaths)

### Why a Level Designer Should Care
Storm deaths are the least satisfying way to lose in an extraction shooter. A high storm death rate on Lockdown suggests the map's size doesn't match the storm timing. Adjusting either the map layout or storm parameters would improve the gameplay loop without requiring new content.
