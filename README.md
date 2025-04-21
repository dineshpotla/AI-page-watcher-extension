# Page Change Watcher

A professional Chrome extension to monitor any webpage for changes using LLMs (any model available via OpenRouter). Get instant SMS, email, and desktop notifications when your custom monitoring instruction is satisfied.

---

## Features

- **LLM-based monitoring:** Uses any model available via OpenRouter to analyze full page text with your custom prompt/instruction.
- **Flexible change detection:** You define what to watch for (status changes, keyword appearance, etc.) using natural language.
- **SMS alerts:** Send SMS notifications via Twilio (user-configurable).
- **Email alerts:** (Stub for integration) Add your provider for email notifications.
- **Desktop notifications & sound:** Get notified instantly on your computer.
- **Auto-refresh:** Configurable interval for automatic page reloads and re-checks.
- **Professional UI:** Modern, tabbed popup for monitoring and settings.
- **Secure credential storage:** API keys and settings are stored locally in Chrome, never hardcoded.

---

## Installation

1. **Clone or download** this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select this project folder.

---

## Usage

1. Click the extension icon in Chrome.
2. Enter your **monitoring instruction** (e.g., `Check if 'in progress' has changed to 'success'`).
3. Set the **refresh interval** (in seconds).
4. Go to the **Settings** tab:
    - Enter your **OpenRouter API key** (get one from [OpenRouter](https://openrouter.ai)).
    - (Optional) Enable and configure **SMS** and **Email** notifications.
5. Click **Start Watching**.
6. Grant notification permissions when prompted.

The extension will monitor the page, send your instruction and the page text to the LLM (via OpenRouter, using your selected model), and notify you when a change is detected (based on the LLM’s structured JSON response).

---

## Security

- **API keys are never hardcoded**; users must enter them in the extension popup.
- For production deployments, consider proxying API requests through a secure backend.
- Never share your API keys publicly.

---

## Development

- All logic is in `content.js`, `popup.js`, and UI in `popup.html`.
- Extension uses [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/) for settings.
- LLM prompt expects a JSON output:
  ```json
  {
    "changed": true/false,
    "summary": "A brief half-line summary of what changed (or 'No change detected')"
  }
  ```
- Only sends notifications if `changed: true`.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

MIT (add a LICENSE file if you wish)

---

## Credits

- [OpenRouter](https://openrouter.ai) for LLM API
- [Twilio](https://twilio.com) for SMS
- LLaMA 4 Maverick (Meta)

---

## Screenshots

_Add a screenshot of your extension popup and a notification here!_

---

## Contact

For questions, open an issue or reach out via GitHub.

## Notes

- The extension uses the free tier of OpenRouter's LLaMA 4 Maverick model
- Auto-refresh intervals must be at least 30 seconds
- Desktop notifications require user permission
- SMS alerts use Twilio and require a valid phone number
