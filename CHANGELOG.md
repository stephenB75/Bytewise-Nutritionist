# Bytewise Nutritionist Changelog

## Version 1.3.1 (August 13, 2025) - Navigation Scroll Reset Implementation

### 🔧 Navigation UX Enhancement
- **Scroll Reset Functionality**: Implemented instant scroll to hero component on all navigation clicks
- **Root Cause Resolution**: Fixed CSS `scroll-behavior: smooth` interference with instant scroll attempts
- **Universal Coverage**: All navigation elements now use enhanced `handleTabChange` function (8+ buttons)

### 🐛 Navigation Bug Fixes
- **Scroll Behavior Override**: Temporarily disables smooth scrolling during navigation for instant results
- **Multi-Method Scroll Reset**: Uses window.scrollTo, documentElement.scrollTop, and body.scrollTop fallbacks
- **Timing Optimization**: requestAnimationFrame and setTimeout ensure proper scroll execution

### 📱 Navigation Elements Enhanced
- **Bottom Navigation Tabs**: Home, nutrition, fasting, daily, profile (5 tabs)
- **Hero Buttons**: Track Food and Sign Up buttons
- **ByteWise Logo**: Returns to home with scroll reset

---

## Version 1.3.0 (August 13, 2025) - Critical Date Bug Fix

### 🐛 Critical Bug Fixes
- **Fixed Date Logging Issue**: Resolved critical bug where meal entries were logged with server UTC dates instead of user's local dates
- **Timezone Detection**: Implemented browser-based timezone detection using `Intl.DateTimeFormat` API
- **Automatic Date Correction**: Added system to automatically detect and fix existing meals with incorrect dates
- **Enhanced Weekly Summary**: Fixed weekly calorie tracking to show meals on correct days of the week

### 🔧 Technical Improvements
- **Enhanced `getLocalDateKey()` Function**: Now uses browser timezone APIs for accurate local date calculation
- **Updated Meal Date Fixer**: Improved logic to match `getLocalDateKey()` timezone handling
- **Timezone Debugging Utility**: Added comprehensive timezone debugging for troubleshooting date issues
- **Performance Optimization**: Added caching to prevent excessive date checking operations

### 📊 Data Integrity
- **Meal Date Validation**: Existing meal entries are automatically validated and corrected on app startup
- **Cross-Timezone Compatibility**: App now works correctly across all user timezones
- **Consistent Date Display**: All meal entries and weekly summaries now show consistent, accurate local dates

---

## Version 1.2.4 (August 13, 2025) - Production Ready

### 🚀 Major Features
- **Production Deployment Ready**: Complete CSP policy fixes and PWA manifest optimization
- **Enhanced Error Suppression**: Triple-layered browser extension error blocking system
- **Authentication System**: Supabase Auth with JWT tokens and session management
- **USDA Database Integration**: Comprehensive food database with accurate nutritional data
- **Progressive Web App**: Full PWA capabilities with offline functionality

### 🐛 Bug Fixes
- Fixed circular authentication dependency causing 401 errors
- Resolved PWA manifest icon loading issues
- Implemented aggressive browser extension error suppression
- Fixed calorie calculation accuracy for international foods
- Resolved session management and token refresh issues

### 🎨 UI/UX Improvements
- Clean mobile-first design with Bytewise branding
- Enhanced food search with historical data integration
- Streamlined profile management with tabbed navigation
- Professional iconography with updated iOS app assets
- Smooth page transitions with directional animations

### 🔧 Technical Improvements
- Optimized database performance with proper indexing
- Enhanced data persistence with dual-layer system
- Improved error handling and logging
- Clean production build process
- Comprehensive deployment verification

### 📱 Mobile Support
- Android and iOS compatibility via Capacitor
- Native mobile plugins integration
- App Store deployment ready configuration
- Responsive design for all screen sizes

---

*For detailed technical changes and implementation notes, see the archive directory.*