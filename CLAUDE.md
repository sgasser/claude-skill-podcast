# Podcast Skill Project

## Project Overview
- Claude Code skill for generating audio podcasts from text
- Uses Web Speech API (browser TTS)
- Supports multiple languages and platforms (iOS, Android, Desktop)
- Zero cost, no API keys required

## Skill Development Standards

### File Structure
- Keep SKILL.md under 500 lines (currently ~181 lines)
- Use progressive disclosure: SKILL.md for workflow, reference/ for details
- Assets in assets/ directory (not loaded into context automatically)
- Reference files in reference/ directory (loaded on demand)

### Naming Conventions
- Skill name: hyphen-case (lowercase with hyphens)
- Must match pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
- Current skill name: `podcast` (valid, but could use `podcast-generation`)

### SKILL.md Frontmatter
- Required fields: name, description
- Optional fields: license, allowed-tools, metadata
- Description format: "[What it does]. Use when [trigger conditions]."
- Description max length: 1024 characters

### Content Guidelines
- Use imperative voice: "Create dialogue" not "The skill creates dialogue"
- Be specific and actionable: avoid vague guidance
- Assume Claude is competent: only add genuinely needed context
- Challenge every line: "Does Claude really need this?"

### Progressive Disclosure Pattern
- SKILL.md: High-level workflow, decision trees, when to load references
- reference/: Detailed domain knowledge, technical specifications
- assets/: Templates, boilerplate (not loaded into context)
- Keep references one level deep: SKILL.md → reference.md (not deeper)

### Decision Trees
- Start with routing logic for different use cases
- Guide Claude to appropriate workflow based on context
- Use clear numbered phases for sequential workflows

### Quality Requirements
- All dialogue must be TTS-friendly (numbers in words, abbreviations spelled out)
- Factual accuracy: only use information from source material
- No hallucinations: never invent examples or context
- Natural conversation flow: avoid rapid back-and-forth

## Build and Testing

### Skill Validation
```bash
# Validate skill structure
python ../skills/scripts/quick_validate.py podcast/

# Package skill for distribution
python ../skills/scripts/package_skill.py podcast/
```

### Manual Testing Checklist
- Test with English, German, French, Spanish content
- Test short content (< 5 exchanges)
- Test long content (30+ exchanges)
- Test with pre-formatted dialogue
- Test with article/list content
- Verify TTS plays without errors on iOS, Android, Desktop

## Git Workflow
- Follow global git safety rules from ~/.claude/CLAUDE.md
- Commit message format: "component: clear description"
- Test skill validation before committing SKILL.md changes

## Technical Constraints
- Web Speech API: Browser-based, no server required
- Platform-specific voices: iOS (Siri), Android (Google), Desktop (Microsoft/Natural)
- Sentence length: Keep under 14 seconds for Chrome compatibility
- File format: JSX for Claude Artifacts rendering

## Documentation References
- Official Skills Repository: https://github.com/anthropics/skills
- Claude Code Docs: https://code.claude.com/docs/en/skills
- Skill Best Practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
