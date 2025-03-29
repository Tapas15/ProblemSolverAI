# Framework Pro

An advanced learning platform for business professionals to master 10 key business frameworks through structured learning paths, quizzes, and certification.

## Features

- 10 Business Frameworks (MECE, Jobs-To-Be-Done, SWOT, Porter's Five Forces, First Principles Thinking, Blue Ocean Strategy, SCAMPER, Design Thinking, Problem-Tree Analysis, Pareto Principle)
- Certification system with professional certificate generation
- Mobile-optimized interface with Capacitor for native mobile features
- Progress tracking and achievement system
- Comprehensive learning modules with detailed content
- AI-generated quiz questions for each framework at multiple difficulty levels

## Deployment Options

### Web Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Environment Variables**:
   Make sure the following environment variables are set:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Secret for session management

### Mobile Deployment (Android)

1. **Build the web application**:
   ```bash
   npm run build
   ```

2. **Sync Capacitor**:
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. In Android Studio:
   - Generate a signed APK from the Build menu
   - Or generate an App Bundle for Google Play Store submission

### Mobile Deployment (iOS)

1. **Build the web application**:
   ```bash
   npm run build
   ```

2. **Sync Capacitor**:
   ```bash
   npx cap sync
   ```

3. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

4. In Xcode:
   - Configure your signing identity
   - Build and archive for App Store submission

## Cloud Deployment

### Replit Deployment

1. Use the Replit deploy button in the UI
2. Ensure all secrets are properly configured
3. Your app will be available at a `.replit.app` domain

### Other Cloud Providers

The application can be deployed to:

- Vercel
- Netlify
- Heroku
- Railway
- Render

Each platform requires specific environment variable configuration and may need adjustments to build commands.

## Database Setup

Before deploying, ensure your PostgreSQL database is properly set up:

```bash
npm run db:push
```

This will create all required tables according to the schema definitions.

## Updating After Deployment

To update the application after deployment:

1. Make your code changes
2. Test thoroughly
3. Rebuild and redeploy using the same process
4. For mobile apps, generate a new APK/IPA and distribute to users

## Quiz Generation

For generating new quiz questions using Google's Gemini AI:

1. Ensure you have a valid Gemini API key set as `GEMINI_API_KEY` in your environment
2. Run `node improved-quiz-generator.cjs` to regenerate all quiz questions
3. Run `node improved-quiz-generator.cjs --framework <ID>` to regenerate questions for a specific framework

For more details, see [README-QUIZ-GENERATION.md](README-QUIZ-GENERATION.md).

## License

All rights reserved. This codebase is proprietary and confidential.