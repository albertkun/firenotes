# FirePad Installation Guide

## Quick Installation (For Testing)

### Method 1: Load Temporary Add-on (Recommended for Development)

1. **Open Firefox** and navigate to `about:debugging` in the address bar
2. Click on **"This Firefox"** in the left sidebar
3. Click the **"Load Temporary Add-on..."** button
4. Navigate to your `firepad` folder and select the `manifest.json` file
5. The FirePad icon should appear in your toolbar!

**Note**: Temporary add-ons are removed when you close Firefox.

### Method 2: Load from ZIP file

1. Build the extension (if not already built):
   ```bash
   cd firepad
   npm install -g web-ext
   web-ext build
   ```

2. Go to `about:debugging` → **"This Firefox"** → **"Load Temporary Add-on..."**
3. Select the `web-ext-artifacts/firepad-1.0.0.zip` file

## Permanent Installation

### For Firefox Developer Edition or Nightly

1. **Disable signature requirement**:
   - Navigate to `about:config`
   - Search for `xpinstall.signatures.required`
   - Set it to `false`

2. **Install the extension**:
   - Navigate to `about:addons`
   - Click the gear icon → "Install Add-on From File..."
   - Select the `firepad-1.0.0.zip` file

### For Firefox Release (Requires Signing)

To permanently install on Firefox Release, you'll need to:

1. **Create an account** at [addons.mozilla.org](https://addons.mozilla.org/)
2. **Submit your extension** for review
3. Once approved, it will be signed and available for installation

## Verifying Installation

After installation, you should see:
- ✅ A FirePad icon in your Firefox toolbar
- ✅ Clicking it opens a popup with a notepad interface
- ✅ Your notes persist across browser sessions

## Usage

1. **Open**: Click the FirePad icon in your toolbar
2. **Write**: Start typing or paste content
3. **Auto-save**: Your notes save automatically as you type
4. **Clear**: Click the trash icon to clear all notes
5. **Keyboard shortcuts**:
   - `Ctrl/Cmd + S`: Manually save
   - `Ctrl/Cmd + Shift + Delete`: Clear notes

## Troubleshooting

### Extension doesn't load
- Make sure you selected the `manifest.json` file (not a folder)
- Check the browser console for errors (`Ctrl/Cmd + Shift + J`)

### Notes don't save
- Check that the extension has storage permissions
- Look for errors in the extension's console

### Icon doesn't appear
- Make sure the extension is enabled in `about:addons`
- Try restarting Firefox

## Uninstallation

1. Navigate to `about:addons`
2. Find "FirePad" in the extensions list
3. Click the three dots menu → "Remove"

## Development

To modify the extension:

1. Make your changes to the source files
2. If using temporary add-on, click "Reload" in `about:debugging`
3. Test your changes

## Support

For issues or questions, please visit:
https://github.com/albertkun/firepad/issues

## Privacy
FirePad stores notes locally in your browser and does not send data anywhere. See `PRIVACY.md` for details.
