const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔵 QuestionPro AI Mobile Builder 🔵');
console.log('===============================\n');

// Check if a platform argument was provided
const args = process.argv.slice(2);
let targetPlatform = args[0]?.toLowerCase();

function validatePlatform() {
  return new Promise((resolve) => {
    if (targetPlatform === 'android' || targetPlatform === 'ios' || targetPlatform === 'both') {
      resolve();
      return;
    }

    rl.question('\n📱 Select target platform (android/ios/both): ', (answer) => {
      targetPlatform = answer.toLowerCase();
      if (!['android', 'ios', 'both'].includes(targetPlatform)) {
        console.log('⚠️ Invalid selection. Defaulting to "both" platforms');
        targetPlatform = 'both';
      }
      resolve();
    });
  });
}

async function buildApp() {
  try {
    await validatePlatform();
    
    // Step 1: Build the app
    console.log('\n🔨 Building web app...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Web build completed successfully');
    } catch (error) {
      console.error('❌ Web build failed:', error);
      process.exit(1);
    }

    const androidPath = path.join(__dirname, 'android');
    const iosPath = path.join(__dirname, 'ios');
    
    // Step 2: Add and update Android platform if requested
    if (targetPlatform === 'android' || targetPlatform === 'both') {
      console.log('\n🤖 Setting up Android platform...');
      if (!fs.existsSync(androidPath)) {
        try {
          execSync('npx cap add android', { stdio: 'inherit' });
          console.log('✅ Android platform added');
        } catch (error) {
          console.error('❌ Failed to add Android platform:', error);
        }
      } else {
        console.log('✅ Android platform already exists');
      }
    }
    
    // Step 3: Add and update iOS platform if requested
    if (targetPlatform === 'ios' || targetPlatform === 'both') {
      console.log('\n🍏 Setting up iOS platform...');
      if (!fs.existsSync(iosPath)) {
        try {
          execSync('npx cap add ios', { stdio: 'inherit' });
          console.log('✅ iOS platform added');
        } catch (error) {
          console.error('❌ Failed to add iOS platform:', error);
        }
      } else {
        console.log('✅ iOS platform already exists');
      }
    }
    
    // Step 4: Copy and sync with chosen platforms
    console.log('\n📦 Updating native platforms...');
    try {
      execSync('npx cap copy', { stdio: 'inherit' });
      execSync('npx cap sync', { stdio: 'inherit' });
      console.log('✅ Native platforms updated successfully');
    } catch (error) {
      console.error('❌ Failed to update native platforms:', error);
    }
    
    // Step 5: Generate app icons and splash screens
    console.log('\n🎨 Checking for app assets...');
    const iconSource = path.join(__dirname, 'client', 'public', 'app-icon.png');
    const splashSource = path.join(__dirname, 'client', 'public', 'splash-screen.png');
    
    if (!fs.existsSync(iconSource)) {
      console.log('⚠️ No app icon found at client/public/app-icon.png');
      console.log('   You should add a 1024x1024 PNG icon file there');
    } else {
      console.log('✅ App icon found');
    }
    
    if (!fs.existsSync(splashSource)) {
      console.log('⚠️ No splash screen found at client/public/splash-screen.png');
      console.log('   You should add a 2732x2732 PNG splash screen file there');
    } else {
      console.log('✅ Splash screen found');
    }

    // Success message
    console.log('\n🚀 Mobile app build process completed!');
    
    if (targetPlatform === 'android' || targetPlatform === 'both') {
      console.log('\n📱 For Android:');
      console.log('   To open in Android Studio, run: npx cap open android');
    }
    
    if (targetPlatform === 'ios' || targetPlatform === 'both') {
      console.log('\n📱 For iOS:');
      console.log('   To open in Xcode, run: npx cap open ios');
    }
    
    console.log('\n💡 Tips:');
    console.log('• Make sure Android Studio or Xcode is properly set up');
    console.log('• For iOS, you need a Mac and an Apple Developer account');
    console.log('• For Android, make sure you have JDK installed and properly configured');
    console.log('\nHappy coding! 🎉');
  } finally {
    rl.close();
  }
}

buildApp();