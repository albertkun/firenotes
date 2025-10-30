# FireNotes 🔥📝

A modern, lightweight Firefox extension that provides a quick popup notepad with multiple pages for organizing notes. Inspired by Windows Sticky Notes with a clean, modern shadcn/ui design aesthetic.

![FireNotes](icons/icon-96.png)

## Features ✨

- **Multiple Note Pages**: Create and manage multiple notes, similar to Windows Sticky Notes
- **Tab Navigation**: Easy switching between notes with a bottom tab bar
- **Quick Access**: Click the toolbar icon to instantly open your notepad
- **Auto-Save**: Your notes are automatically saved to local storage
- **Smart Titles**: Note titles auto-generate from the first line of content
- **Character Count**: Real-time character counter to track your note length
- **Modern UI**: Clean, shadcn/ui-inspired interface with smooth animations
- **Floating Add Button**: Prominent "+" button at the bottom-right to add new notes
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + S`: Manually save current note
  - `Ctrl/Cmd + N`: Create new note
  - `Ctrl/Cmd + W`: Delete current note
- **Persistent Storage**: All your notes persist across browser sessions
- **No Internet Required**: Works completely offline

## Installation 🚀

### From Source (Development)

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/albertkun/firenotes.git
   cd firenotes
   ```

2. **Open Firefox** and navigate to `about:debugging`

3. Click on "**This Firefox**" in the left sidebar

4. Click "**Load Temporary Add-on...**"

5. Navigate to the `firenotes` directory and select the `manifest.json` file

6. The FireNotes icon should now appear in your Firefox toolbar! 🎉

### For Permanent Installation (Unsigned)

For Firefox Developer Edition or Firefox Nightly:

1. Navigate to `about:config`
2. Search for `xpinstall.signatures.required`
3. Set it to `false`
4. Package the extension as a `.xpi` file and install it

## Usage 💡

1. **Open the notepad**: Click the FireNotes icon in your Firefox toolbar
2. **Start typing**: The notepad automatically focuses and is ready to use
3. **Auto-save**: Your notes are saved automatically as you type
4. **Add new notes**: Click the floating "+" button at the bottom-right
5. **Switch notes**: Click on note tabs at the bottom to switch between notes
6. **Delete notes**: Click the "×" on a note tab or the trash icon in the header (with confirmation)
7. **Character count**: See the character count in the top-right corner
8. **Note titles**: First line of your note becomes the tab title automatically

## Development 🛠️

The extension is built with vanilla JavaScript, HTML, and CSS. No build process required!

### File Structure

```
firenotes/
├── manifest.json          # Extension configuration
├── icons/                 # Extension icons
│   ├── icon-48.png
│   └── icon-96.png
├── popup/                 # Popup interface
│   ├── popup.html        # HTML structure
│   ├── popup.css         # Styles
│   └── popup.js          # JavaScript functionality
├── LICENSE               # GPL-3.0 License
└── README.md            # This file
```

### Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with HSL-based color system (shadcn/ui inspired)
- **JavaScript (ES6+)**: Multi-note functionality and storage handling
- **WebExtensions API**: Browser integration and local storage

## Contributing 🤝

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## License 📄

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Privacy 🔒

FireNotes stores all data locally using the browser's local storage API. No data is ever sent to external servers or third parties.

## Support 💬

If you encounter any issues or have questions, please [open an issue](https://github.com/albertkun/firenotes/issues) on GitHub.

---

Made with ❤️ for quick note-taking