# Project skills

Use the existing checkout at /workspace/the-system. Cloud tasks are isolated;
do not create a Git worktree unless the user explicitly requests one.

Before scaffolding or generating code, read and apply these installed skills:
- Coding and dependency decisions: .agents/skills/ponytail/SKILL.md (default full mode).
- Frontend design, palette, typography, and token choices: .agents/skills/frontend-design/SKILL.md.
- Tailwind CSS v4 implementation: .agents/skills/tailwind-4-docs/SKILL.md,
  plus its references/engineering-playbook.md and references/gotchas.md.

Follow the user's product brief when choosing a visual anchor. Ponytail governs
implementation simplicity; frontend-design governs visual tokens; Tailwind
guidance governs CSS implementation. Explicit user requirements take precedence.

The user accepted the upstream Tailwind documentation license and authorized
initialization during onboarding. Check references/docs-source.txt and the skill's
freshness instructions before relying on the snapshot. Use the runtime copy's
sync script for refreshes; keep generated docs out of the source checkout.

Additional installed skills: ponytail-review, ponytail-audit, ponytail-debt,
ponytail-gain, and ponytail-help, each under .agents/skills/<name>/SKILL.md.
Source repositories are retained under /workspace/skills. The Tailwind installed
copy is under /workspace/skill-runtime so generated docs do not modify its source
checkout. Recreate skill links with /workspace/setup/install-design-skills.sh.
