# AvThR - AI Report & Quiz Generator

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