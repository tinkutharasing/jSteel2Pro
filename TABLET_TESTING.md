# Tablet Testing Guide for jSteelPro

## Quick Start Commands

### iOS Tablet Testing
```bash
# iPad Pro (12.9-inch) - Full size tablet
npm run ios:tablet

# iPad mini (6th generation) - Compact tablet
npm run ios:tablet-mini

# Custom tablet size
npx react-native run-ios --simulator="iPad Air (5th generation)"
```

### Android Tablet Testing
```bash
# Run on tablet AVD
npm run android:tablet

# Or specify device directly
npx react-native run-android --deviceId=your_tablet_avd_id
```

## Setting Up iOS Simulator for Tablet Testing

1. **Open iOS Simulator**:
   ```bash
   open -a Simulator
   ```

2. **Select Tablet Device**:
   - Go to `Device` → `iOS` → Choose tablet device
   - Recommended: "iPad Pro (12.9-inch)" for full testing
   - Alternative: "iPad mini (6th generation)" for compact testing

3. **Enable Hardware Keyboard** (for tablet keypad):
   - In simulator: `I/O` → `Keyboard` → `Connect Hardware Keyboard`
   - This shows the tablet keypad interface

4. **Test Different Orientations**:
   - Use `Device` → `Rotate Left/Right` to test landscape/portrait

## Setting Up Android Tablet AVD

1. **Open Android Studio**
2. **Go to AVD Manager** (`Tools` → `AVD Manager`)
3. **Create Virtual Device**:
   - Choose "Tablet" category
   - Select device (e.g., "Pixel Tablet" or "Nexus 10")
   - Choose API level (recommend API 34+)
   - Set RAM: 4GB+, Internal Storage: 8GB+

## Testing Tablet-Specific Features

### 1. Responsive Layout
- Test your app in both portrait and landscape
- Verify form fields adapt to tablet screen sizes
- Check navigation elements scale appropriately

### 2. Input Methods
- Test with tablet keypad
- Verify signature field works on larger screen
- Test image upload on tablet resolution

### 3. Print Functionality
- Test print layout on tablet screen sizes
- Verify PDF generation works correctly
- Test different paper orientations

## Common Tablet Testing Scenarios

### Form Input Testing
- Test all input fields with tablet keypad
- Verify auto-complete and suggestions
- Test multi-line text inputs

### Navigation Testing
- Test bottom navigation on tablet
- Verify stack navigation works
- Test modal presentations

### Performance Testing
- Monitor memory usage on tablet
- Test with larger datasets
- Verify smooth scrolling and animations

## Troubleshooting

### iOS Simulator Issues
- If simulator doesn't start: `xcrun simctl boot "iPad Pro (12.9-inch)"`
- Reset simulator: `xcrun simctl erase "iPad Pro (12.9-inch)"`

### Android Emulator Issues
- If emulator is slow: Increase RAM in AVD settings
- Enable hardware acceleration in BIOS
- Use x86_64 system images for better performance

## Best Practices

1. **Always test on multiple tablet sizes**
2. **Test both orientations**
3. **Verify touch targets are appropriately sized**
4. **Test with different input methods**
5. **Monitor performance metrics**

## Device-Specific Notes

### iPad Pro (12.9-inch)
- Resolution: 2732 x 2048
- Best for: Full testing, landscape layouts
- Keypad: Full-size tablet keypad

### iPad mini (6th generation)
- Resolution: 2266 x 1488
- Best for: Compact tablet testing
- Keypad: Compact tablet keypad

### Android Tablets
- Various resolutions and aspect ratios
- Test on multiple Android versions
- Consider different manufacturer skins
