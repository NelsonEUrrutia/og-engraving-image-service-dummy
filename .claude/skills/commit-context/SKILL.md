---
name: commit-context
description: >
  Documents the current state of the project by updating CLAUDE.md and TODO.md
  at the end of a working session or meaningful checkpoint. Trigger this skill
  whenever the user says "commit context", "save progress", "checkpoint",
  "document status", or asks to save/record what was done in the session.
  Use it proactively when a significant decision, bug fix, pattern, or feature
  is completed — even if the user doesn't explicitly ask. This skill is the
  equivalent of a git commit for project knowledge and task state.
---

# Commit Context Skill

Persist session knowledge so the next Claude Code session starts with full
context — no re-explaining required.

## When to trigger

- User says: "commit context", "checkpoint", "save progress", "document status"
- A significant decision, pattern, or architectural choice was just made
- A bug was solved and the fix reveals something worth remembering
- A feature chunk is complete
- The conversation is getting long and context compaction is approaching
- End of a working session

---

## Step 1 — Review the conversation

Before touching any file, scan the full conversation for:

- **Decisions made**: architecture choices, library picks, naming conventions
- **Corrections**: anything the user had to correct you on (high priority — these prevent repeat mistakes)
- **Patterns established**: code structures, file organization, workflows
- **Commands clarified**: build, test, run, deploy commands
- **Blockers or discoveries**: unexpected constraints, gotchas, dependencies found
- **Tasks completed or created**: anything finished or that emerged as new work

---

## Step 2 — Update CLAUDE.md

**Rules for CLAUDE.md:**

- Only add **durable knowledge** — things a fresh session needs to know
- Do NOT add session narrative ("today we worked on X")
- Do NOT add things already documented there
- Keep entries concise and concrete (verifiable, not vague)
- Target under 200 lines total — if growing large, consolidate or remove stale entries

**Good candidates:**

```
- Architectural decisions with rationale
- Conventions ("always use X, not Y — because Z")
- Commands that aren't obvious from the repo
- Things I got wrong that the user corrected
- File structure or module responsibilities
```

**Bad candidates (do not add):**

```
- What we talked about today
- Temporary workarounds the user said to ignore later
- Obvious things any dev would know
```

Make targeted edits — add, update, or remove entries. Do not rewrite the whole file.

---

## Step 3 — Update TODO.md

Apply these changes precisely:

1. **Mark completed items** — change `[ ]` to `[x]` for anything finished this session
2. **Add new tasks** — anything that emerged as next steps or follow-ups
3. **Add blockers** — note dependencies or blockers discovered
4. **Reorder if needed** — move highest priority items to the top of "Up Next"
5. **Do NOT delete** `[x]` done items — keep them for history

Expected TODO.md structure (create if missing):

```markdown
## In Progress

- [ ] Current active task

## Up Next

- [ ] Next priority item
- [ ] Following item

## Blocked

- [ ] Blocked task — waiting on: X

## Done

- [x] Completed task
```

---

## Step 4 — Report changes

After updating both files, give the user a brief report:

```
**Context committed.**

CLAUDE.md — added/updated:
- [list what changed, one line each]

TODO.md — updated:
- Marked done: [list]
- Added: [list]
- Reordered: [yes/no]
```

If nothing warranted an update in a file, say so explicitly rather than making
unnecessary edits.

---

## Edge cases

**If CLAUDE.md doesn't exist yet:** Create it with a minimal structure:

```markdown
# Project Context

## Commands

- [fill in]

## Architecture

- [fill in]

## Conventions

- [fill in]

## Watch out for

- [fill in]
```

**If TODO.md doesn't exist yet:** Create it with the standard structure above,
populated from what you know about current and upcoming work.

**If nothing meaningful happened:** Tell the user — don't make up entries just
to have something to commit.

**If unsure whether something belongs in CLAUDE.md:** Ask before adding. One
wrong entry trains bad habits for future sessions.
