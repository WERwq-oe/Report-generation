# AvThR - AI Report & Quiz Generator

A powerful AI-powered application that generates comprehensive reports and interactive quizzes using Google's Gemini AI. Built with Node.js, Express, and vanilla JavaScript.

## ✨ Features

- 🤖 **AI-Powered Content Generation** - Uses Google Gemini AI for intelligent report and quiz creation
- 📊 **Multiple Report Formats** - Generate reports in PDF, DOCX, and web formats
- 🎯 **Interactive Quizzes** - Create multiple choice, one-word answer, and flashcard-style questions
- 🎨 **Modern UI/UX** - Clean, responsive design with dark/light theme support
- 📱 **Mobile Friendly** - Fully responsive across all devices
- ⚡ **Fast Performance** - Optimized for speed and reliability

## 🚀 Live Demo

Visit the live application: [Your Deployment URL Here]

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/WERwq-oe/Report-generation.git
cd Report-generation
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🌐 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key

### Option 2: Deploy to Render

1. **Create account at [render.com](https://render.com)**

2. **Connect your GitHub repository**

3. **Add Environment Variable:**
   - In your service settings, add `GEMINI_API_KEY`

### Option 3: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables:**
   ```bash
   railway variables set GEMINI_API_KEY=your_api_key_here
   ```

### Option 4: Deploy to Heroku

1. **Install Heroku CLI and login**

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key_here
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

## 📁 Project Structure

```
AvThR/
├── 📄 index.html          # Main application page
├── 📄 about.html          # About page
├── 📄 faq.html            # FAQ page
├── 🎨 styles.css          # Application styles
├── ⚡ script.js           # Frontend JavaScript
├── 🚀 server.js           # Express.js backend server
├── 📦 package.json        # Node.js dependencies
├── 🔒 .env                # Environment variables (not in repo)
├── 📋 .env.example        # Environment template
├── 🚫 .gitignore          # Git ignore rules
├── 📖 README.md           # This file
├── ⚙️ vercel.json         # Vercel deployment config
├── 🌐 netlify.toml        # Netlify deployment config
├── 🎯 render.yaml         # Render deployment config
└── 🐳 Dockerfile         # Docker configuration
```

## 🔧 API Endpoints

- `POST /api/generate-report` - Generate AI-powered reports
- `POST /api/generate-quiz` - Create interactive quizzes
- `POST /api/download-report` - Download reports in PDF/DOCX
- `POST /api/download-quiz` - Download quiz as PDF

## 🎨 Customization

### Themes
The application supports both light and dark themes. Users can toggle between themes using the theme switcher in the navigation.

### Styling
Modify `styles.css` to customize the appearance:
- CSS custom properties for easy theme management
- Responsive design with mobile-first approach
- Modern glassmorphism design elements

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation and sanitization
- ✅ Secure API key management

## 📈 Performance

- ⚡ Optimized bundle size
- 🚀 Fast API responses
- 📱 Mobile-optimized UI
- 💾 Efficient memory usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [FAQ page](faq.html)
2. Review this README
3. Check your Gemini API key configuration
4. Open an issue on GitHub

## 🙏 Acknowledgments

- Google Gemini AI for powerful content generation
- Express.js for robust backend framework
- Puppeteer for PDF generation
- All contributors and users of this project - AI Report & Quiz Generator

A professional web application that generates comprehensive reports and interactive quizzes on any topic using AI technology powered by Th Logic.

## Features

✅ **Report Generation**
- Create detailed reports in multiple lengths (Short: 500-800, Medium: 1000-1500, Long: 2000+ words)
- Choose between normal text and handwritten-style typography
- Advanced formatting options (bullet points, numbered lists, tables, headings)
- Perfect PDF and DOCX downloads with proper pagination

✅ **Interactive Quiz Generation**
- Multiple quiz formats: MCQ, One-word answers, and Flashcards
- Select multiple formats simultaneously
- Customizable difficulty levels and question counts
- Interactive quiz-taking experience with scoring

✅ **Professional Design**
- Clean, modern interface with dark/light theme support
- Responsive design for all devices
- Smooth animations and user experience
- Professional typography and layout

✅ **AI-Powered Content**
- Powered by Th Logic AI for accurate content generation
- Intelligent formatting and structure
- High-quality, educational content

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
AvThR/
├── index.html          # Main HTML file
├── styles.css          # Professional CSS styling
├── script.js           # Frontend JavaScript functionality
├── server.js           # Node.js backend server
├── package.json        # Node.js dependencies
└── README.md          # Project documentation
```

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **AI Integration:** Google Generative AI (Gemini)
- **PDF Generation:** Puppeteer
- **DOCX Generation:** docx library
- **Styling:** Custom CSS with theme support

## API Endpoints

- `POST /api/generate-report` - Generate AI reports
- `POST /api/generate-quiz` - Generate AI quizzes
- `POST /api/download-report` - Download reports (PDF/DOCX)
- `POST /api/download-quiz` - Download quizzes (PDF)

## Features Overview

### Report Generation
- Enter any topic
- Select report length
- Choose text format (normal or handwritten)
- Enable formatting options
- Download in PDF or DOCX format

### Quiz Generation  
- Enter quiz topic
- Select quiz types (can choose multiple)
- Set number of questions and difficulty
- Interactive preview and quiz-taking
- Download as PDF

### Design Highlights
- Professional black and white color scheme
- Clean typography using Inter font family
- Responsive layout for mobile and desktop
- Smooth animations and transitions
- Dark/light theme toggle

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - Free to use and modify.

## About

AvThR is designed to make high-quality educational content generation accessible to everyone. Whether you're a student, educator, or professional, AvThR helps you create comprehensive reports and engaging quizzes instantly.

Powered by **Th Logic AI** - Advanced artificial intelligence for educational content generation.