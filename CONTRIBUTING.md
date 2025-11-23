# Contributing to Claude Skill: Podcast Generator

Thank you for considering contributing to this project! This document provides guidelines and best practices for contributing.

## Code of Conduct

Be respectful, constructive, and collaborative. We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](../../issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Claude Desktop version
   - Browser and OS information
   - Sample content that causes the issue (if applicable)

### Suggesting Enhancements

1. Open a [GitHub Discussion](../../discussions) or Issue
2. Describe the enhancement and its benefits
3. Provide examples of how it would work
4. Explain why it would be useful for other users

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the guidelines below
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork
7. Open a Pull Request

## Development Guidelines

### Skill Development Standards

This skill follows [Anthropic's official skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices). Please adhere to these when making changes:

#### File Structure Rules

- Keep `SKILL.md` under 500 lines
- Use progressive disclosure: core workflow in SKILL.md, details in `reference/`
- Keep references one level deep: `SKILL.md` → `reference/*.md` (not deeper)
- Assets in `assets/` directory are not loaded into context automatically

#### Content Guidelines

- Use imperative voice: "Create dialogue" not "The skill creates dialogue"
- Be specific and actionable: avoid vague guidance
- Assume Claude is competent: only add genuinely needed context
- Challenge every line: "Does Claude really need this?"

#### Naming Conventions

- Skill name: hyphen-case (lowercase with hyphens)
- Must match pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Files: descriptive names in kebab-case

#### SKILL.md Frontmatter

Required format:
```yaml
---
name: skill-name
description: [What it does]. Use when [trigger conditions].
allowed-tools: Read
---
```

### Testing Your Changes

Before submitting a PR:

1. **Test manually in Claude**:
   - Copy skill to `~/.claude/skills/`
   - Restart Claude Desktop
   - Test with various inputs:
     - Short content (< 5 exchanges)
     - Long content (30+ exchanges)
     - Multiple languages (EN, DE, FR, ES)
     - Pre-formatted dialogue
     - Articles and lists

3. **Check quality requirements**:
   - Factual accuracy maintained
   - No hallucinations
   - TTS formatting correct (numbers in words)
   - Natural conversation flow
   - All source facts included

### Documentation

- Update README.md if you add new features
- Update SKILL.md following the progressive disclosure pattern
- Add language-specific rules to `reference/tts-formatting.md` if applicable
- Keep CLAUDE.md synchronized with project standards

### Code Style

#### Markdown
- Use ATX-style headers (`#`, `##`, `###`)
- Use bullet points for lists
- Add blank lines around code blocks
- Keep line length reasonable (< 120 chars when possible)

#### JavaScript/JSX (template)
- Use 2-space indentation
- Follow existing code style
- Add comments for complex logic
- Keep functions focused and small

## Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- Additional language support (Portuguese, Dutch, Polish, Russian, Japanese, Chinese)
- Improved dialogue generation patterns
- Better voice selection algorithms for different platforms
- Bug fixes and edge case handling

### Medium Priority
- Enhanced TTS formatting rules
- Performance optimizations
- Documentation improvements
- Usage examples and tutorials

### Future Features
- Support for 3+ speakers
- Custom voice configuration
- Background music integration
- Export to audio file formats
- Advanced dialogue styling

## Skill Validation Checklist

Before submitting changes to SKILL.md:

- [ ] Frontmatter is valid YAML
- [ ] Name follows hyphen-case pattern
- [ ] Description includes both capability and triggers
- [ ] File is under 500 lines
- [ ] Uses imperative voice throughout
- [ ] Progressive disclosure implemented correctly
- [ ] References are one level deep only
- [ ] Quality requirements are clear
- [ ] Decision tree updated if workflow changes

## Commit Message Guidelines

Write clear, descriptive commit messages:

- Use present tense: "Add feature" not "Added feature"
- Use imperative mood: "Fix bug" not "Fixes bug"
- First line: brief summary (< 72 chars)
- Blank line, then detailed explanation if needed
- Reference issues/PRs when applicable

Examples:
```
Add Portuguese language support to TTS formatting

- Add Portuguese number and date rules
- Update voice selection for Brazilian Portuguese
- Add examples to reference/tts-formatting.md

Fixes #42
```

## Questions?

- Open a [GitHub Discussion](../../discussions)
- Check [Claude Code Documentation](https://code.claude.com/docs/en/skills)
- Review [Anthropic Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
