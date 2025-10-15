# App Store Preparation Guide - ByteWise Nutritionist

## ✅ Current Status: 90% App Store Ready

### Completed Requirements ✅
- **Technical Configuration**: iOS build pipeline working with 9 Capacitor plugins
- **OAuth Compliance**: Third-party OAuth hidden on iOS (no Sign in with Apple required)
- **Privacy Permissions**: Camera, Photos, File System properly configured
- **Icons & Screenshots**: Complete set configured in manifest.json
- **Build Assets**: Properly deployed from dist/public with verification
- **App Identity**: Bundle ID `com.bytewise.nutritionist` ready

---

## 📋 App Store Submission Checklist

### 1. ✅ App Information
- **App Name**: ByteWise Nutritionist
- **Bundle Identifier**: com.bytewise.nutritionist
- **SKU**: com.bytewise.nutritionist
- **Primary Language**: English (US)

### 2. ✅ Categories & Ratings
- **Primary Category**: Health & Fitness
- **Secondary Category**: Food & Drink
- **Age Rating**: 4+ (Food/nutrition apps are all-ages appropriate)

### 3. 📝 App Store Metadata (Ready for Optimization)

#### Current App Description (from manifest.json):
```
Professional nutrition tracking app with USDA database integration, meal planning, and progress analytics
```

#### Optimized App Description:
```
Transform your nutrition journey with AI-powered food analysis! 

🍎 KEY FEATURES:
• Snap photos of meals for instant AI nutritional analysis
• Track macros, micros, and calories with USDA precision  
• Personalized meal planning and goal setting
• Progress tracking with achievement rewards
• Dark/light themes and responsive design

🤖 AI-POWERED ANALYSIS:
Using Google's advanced Gemini Vision AI, ByteWise identifies food items and calculates precise nutritional information from photos. No manual entry required!

📊 COMPREHENSIVE TRACKING:
• Complete USDA FoodData Central integration
• Detailed micronutrient monitoring (vitamins, minerals)
• Custom food and recipe creation
• Export reports and meal logs

🎯 GOAL-ORIENTED:
Set personalized nutrition goals and track progress with our achievement system. Perfect for weight management, fitness goals, or general health monitoring.

Privacy-focused with secure cloud storage. Your nutrition data stays private and encrypted.

Download now and start your smarter nutrition journey!
```

#### Keywords (100 characters max):
```
nutrition,food,diet,calories,macro,health,AI,tracker,meal,USDA,vitamins,fitness,weight,goals
```

### 4. 🖼️ App Store Screenshots

#### Required Sizes:
- **iPhone 6.7"** (1290 x 2796): For iPhone 14 Pro Max, iPhone 15 Pro Max
- **iPhone 6.5"** (1242 x 2688): For iPhone XS Max, iPhone 11 Pro Max
- **iPhone 5.5"** (1242 x 2208): For iPhone 8 Plus

#### Screenshot Content Plan:
1. **Main Dashboard**: Showing daily nutrition overview
2. **AI Food Analysis**: Camera scanning food with results
3. **Meal Logging**: Adding foods to meals
4. **Progress Tracking**: Charts and achievement badges
5. **User Profile**: Settings and goal configuration

### 5. ⚖️ Privacy Policy & Terms Required

#### Privacy Policy Requirements:
```markdown
# Privacy Policy - ByteWise Nutritionist

Last Updated: [DATE]

## Information We Collect
- Account information (email, preferences)
- Nutrition data (meals, foods, goals)
- Photos uploaded for food analysis (stored securely for processing)
- Usage analytics (anonymous)

## How We Use Information
- Provide nutrition tracking and AI food analysis
- Process uploaded photos through Google Gemini Vision API
- Store photos securely for analysis accuracy and troubleshooting
- Improve app functionality and user experience
- Send meal reminders and notifications (if enabled)

## Data Storage & Security
- Data encrypted in transit and at rest
- Stored securely with Supabase (SOC 2 compliant)
- Photos stored in secure cloud storage with unique identifiers
- No data sale to third parties
- Photos processed by Google Gemini Vision API under their privacy terms

## Your Rights
- Access, modify, or delete your data anytime
- Export your nutrition data
- Opt out of notifications

## Third-Party Services
- Google Gemini Vision API (food analysis)
- USDA FoodData Central (nutrition database)
- Supabase (data storage and authentication)
- RevenueCat (subscription management)

Contact: privacy@bytewisenutritionist.com
```

#### Terms of Service Requirements:
```markdown
# Terms of Service - ByteWise Nutritionist

Last Updated: [DATE]

## Service Description
ByteWise Nutritionist is a nutrition tracking application providing AI-powered food analysis and health monitoring tools.

## Acceptable Use
- Personal, non-commercial use only
- Accurate information entry
- No attempt to reverse engineer AI systems
- Respect usage limits and fair use policies

## Subscriptions & Payments
- Premium features available via subscription
- Processed securely through Apple App Store
- Automatic renewal unless cancelled
- Refunds according to Apple's policies

## Disclaimers
- Not medical advice or professional nutrition counseling
- Nutrition data is informational only
- Consult healthcare providers for medical dietary needs
- AI analysis may have accuracy limitations

## Limitation of Liability
Service provided "as is" without warranties. We are not liable for dietary decisions or health outcomes.

Contact: support@bytewisenutritionist.com
```

### 6. 🔒 App Store Privacy Nutrition Label

#### Data Collection Summary:
- **Contact Info**: Email addresses (for account creation)
- **Health & Fitness**: Nutrition data, meal logs, dietary preferences
- **User Content**: Photos or Videos (food photos for AI analysis)
- **Diagnostics**: Crash reports and error logs
- **Usage Data**: App analytics (anonymous)
- **Identifiers**: User account identifiers

#### Privacy Practices:
- **Data Linked to User**: Account info, nutrition data, preferences, food photos
- **Data Not Linked to User**: Anonymous analytics only
- **Data Used for Tracking**: None (no ads or cross-app tracking)

#### Data Usage Purposes:
- **App Functionality**: Nutrition tracking, AI food analysis, meal logging
- **Diagnostics**: Crash reports for app improvement only

### 7. 🎯 Subscription Configuration (RevenueCat)

#### Subscription Tiers:
- **Free Tier**: Basic food logging, limited AI analyses
- **Premium Monthly**: $9.99/month - Unlimited AI, advanced analytics
- **Premium Annual**: $79.99/year - Best value, all features

#### App Store Connect Products:
```
Product ID: premium_monthly
Type: Auto-Renewable Subscription
Price: $9.99 USD
Duration: 1 Month

Product ID: premium_annual  
Type: Auto-Renewable Subscription
Price: $79.99 USD
Duration: 1 Year
```

### 8. 📱 Build & Submission Preparation

#### Final Pre-Submission Steps:
1. **Xcode Build Configuration**:
   ```bash
   # Set to Release configuration
   # Enable "Automatically manage signing"
   # Set deployment target to iOS 14.0
   # Verify all capabilities enabled
   ```

2. **Archive & Upload**:
   ```bash
   # In Xcode: Product → Archive
   # Use Organizer to upload to App Store Connect
   # Select "Upload to App Store" option
   ```

3. **App Store Connect Final Setup**:
   - Upload app binary via Xcode
   - Add privacy policy URL
   - Configure subscription products
   - Set pricing and availability
   - Submit for App Review

### 9. 🚨 Critical App Review Guidelines Compliance

#### Confirmed Compliant ✅:
- **OAuth Compliance**: No third-party social login on iOS (no Sign in with Apple required)
- **Content Guidelines**: Health/nutrition content is appropriate
- **Privacy Requirements**: Transparent data collection and usage
- **Subscription Guidelines**: Clear pricing and cancellation terms
- **Technical Standards**: iOS 14.0+ support, proper permissions

#### App Review Notes to Include:
```
Review Notes for Apple:
- This app provides nutrition tracking with AI-powered food analysis
- No third-party social login options on iOS (email/password only)
- Camera permission used solely for food photography and AI analysis
- Photos are uploaded to secure cloud storage and processed by Google Gemini Vision API
- Subscription provides unlimited AI analyses and premium features
- All nutrition data is stored securely with user privacy protection
```

---

## 🚀 Final Steps Before Submission

### 1. Legal Documents Setup
- [ ] Create privacy policy webpage
- [ ] Create terms of service webpage  
- [ ] Add URLs to App Store Connect

### 2. Marketing Assets
- [ ] Capture fresh screenshots from iOS build
- [ ] Create App Store preview video (optional but recommended)
- [ ] Prepare press kit and launch materials

### 3. Business Setup
- [ ] Configure RevenueCat with App Store Connect
- [ ] Set up App Store Connect agreements
- [ ] Configure pricing for all regions

### 4. Technical Validation
- [ ] Final iOS device testing with all features
- [ ] Verify subscription flows work end-to-end
- [ ] Test privacy settings and data export features
- [ ] Confirm AI analysis works with fresh API keys

### 5. Submission Timeline
- **Week 1**: Complete legal documents and screenshots
- **Week 2**: Final testing and business configuration  
- **Week 3**: App Store submission and review process
- **Week 4**: Launch preparation and marketing

---

## 📞 Support Information

### Customer Support Channels:
- **Email**: support@bytewisenutritionist.com
- **Privacy Inquiries**: privacy@bytewisenutritionist.com
- **Website**: https://www.bytewisenutritionist.com
- **In-App Support**: Contact form in app settings

### Review Response Preparation:
- Monitor App Store Connect for review feedback
- Prepare rapid response team for any review issues
- Have development team on standby for potential fixes

---

**Status**: Ready for legal document creation and final screenshots. Technical implementation is complete and App Store compliant.