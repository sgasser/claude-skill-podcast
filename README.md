# Claude Skill: Podcast Generator

Generate audio podcasts from text using browser text-to-speech. Zero cost, no API keys, works in Claude.

## Features

- **Zero Cost**: Uses browser's built-in Web Speech API (no external APIs)
- **Multi-Language**: Supports English, German, French, Spanish, Italian, and more
- **Platform-Aware**: Automatically selects best voices for iOS, Android, and Desktop
- **Natural Dialogue**: Converts articles, lists, or topics into engaging host-expert conversations
- **Factual Accuracy**: Uses source material or Claude's knowledge without hallucinations
- **Interactive Player**: Play/pause, resume from any line, progress tracking
- **TTS-Optimized**: Automatic formatting for optimal text-to-speech pronunciation

## Demo

> [!NOTE]
> Demo video will be added after first push to GitHub

## Installation

1. Download the latest `podcast.skill` from [Releases](../../releases)
2. Open Claude (Desktop, Web, or Mobile)
3. Go to Settings → Skills → "Install from file"
4. Select `podcast.skill`

## Usage

Simply ask Claude to create a podcast:

```
Create a podcast about the history of artificial intelligence
```

```
Create a podcast from this article: [paste article]
```

```
Erstelle einen deutschen Podcast über Quantencomputer
```

Claude will automatically:
1. Detect or ask for the content language
2. Create a natural host-expert dialogue
3. Apply TTS-friendly formatting (numbers in words, etc.)
4. Generate a playable audio component

**Tip**: Use Microsoft Edge browser for best voice quality (250+ high-quality voices vs Chrome's 19).

### What You Can Podcast

- **Any Topic**: Claude can create podcasts from its knowledge
- **Articles**: News, blog posts, documentation
- **Lists**: Features, events, data points
- **Research**: Papers, reports, summaries
- **Your Own Dialogue**: Pre-formatted speaker scripts

## How It Works

1. **Analysis**: Claude extracts key facts or uses its knowledge
2. **Dialogue**: Creates host questions (~20%) and expert responses (~80%)
3. **TTS Formatting**: Converts text to speech-friendly format
4. **Audio Player**: Interactive component with Web Speech API

### Voice Selection

Automatically detects your platform and selects optimal voices:

- **Desktop Edge**: Microsoft Natural voices (best quality)
- **iOS/Safari**: Native Siri voices
- **Android/Chrome**: Google TTS voices
- **Desktop Chrome**: Limited voices (use Edge instead)

## Browser Compatibility

| Browser | Voices | Quality | Recommendation |
|---------|--------|---------|----------------|
| Microsoft Edge | 250+ | Excellent | ✅ Best choice |
| Safari (iOS) | Native Siri | Excellent | ✅ Best on iOS |
| Chrome | 19 | Limited | ⚠️ Use Edge instead |
| Firefox | Very few | Poor | ❌ Not recommended |

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development guidelines
- Skill validation
- Architecture details
- Best practices

### Quick Contributions

- Additional language support
- Improved voice selection
- Better dialogue patterns
- Bug fixes

## Limitations

- Requires browser with Web Speech API support
- Voice quality varies by platform and browser
- Cannot generate professional voice acting or emotions
- Works best with factual content

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Issues: [GitHub Issues](../../issues)
- Discussions: [GitHub Discussions](../../discussions)
- Documentation: [Claude Skills Docs](https://code.claude.com/docs/en/skills)

---

Built following [Anthropic's skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
