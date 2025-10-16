require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, Header } = require('docx');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper function to create prompts
function createReportPrompt(data) {
    const lengthGuide = {
        short: '500-800 words',
        medium: '1000-1500 words',
        long: '2000+ words'
    };
    
    const formatInstructions = data.formatting.includes('bullet') ? 'Include bullet points where appropriate. ' : '';
    const numberedInstructions = data.formatting.includes('numbered') ? 'Use numbered lists for sequential information. ' : '';
    const tableInstructions = data.formatting.includes('tables') ? 'Include tables for data comparison where relevant. ' : '';
    const headingInstructions = data.formatting.includes('headings') ? 'Use clear section headings (## for main sections, ### for subsections). ' : '';
    
    return `Create a comprehensive report about "${data.topic}" that is ${lengthGuide[data.length]}.

Format Requirements:
- Use markdown formatting for structure
- ${headingInstructions}
- Use **bold** for important terms and concepts
- Use *italics* for emphasis
- Use __underline__ for key definitions
- ${formatInstructions}
- ${numberedInstructions}
- ${tableInstructions}
- Include an introduction, main content sections, and conclusion
- Make it informative, well-structured, and engaging
- Ensure proper paragraph breaks for readability

The report should be educational and factual, covering key aspects of the topic in depth.`;
}

function createQuizPrompt(data) {
    const totalQuestions = data.numQuestions;
    let questionsPerType = {};
    
    // Calculate questions per type based on selection
    if (data.types.length === 1) {
        questionsPerType[data.types[0]] = totalQuestions;
    } else if (data.types.length === 2) {
        questionsPerType[data.types[0]] = Math.ceil(totalQuestions * 0.6);
        questionsPerType[data.types[1]] = totalQuestions - questionsPerType[data.types[0]];
    } else if (data.types.length === 3) {
        questionsPerType[data.types[0]] = Math.ceil(totalQuestions * 0.5);
        questionsPerType[data.types[1]] = Math.ceil(totalQuestions * 0.3);
        questionsPerType[data.types[2]] = totalQuestions - questionsPerType[data.types[0]] - questionsPerType[data.types[1]];
    }
    
    const typeInstructions = data.types.map(type => {
        const count = questionsPerType[type];
        switch (type) {
            case 'mcq': return `${count} multiple choice questions with 4 options each`;
            case 'oneword': return `${count} one-word answer questions`;
            case 'flashcard': return `${count} flashcard-style Q&A pairs`;
            default: return '';
        }
    }).filter(Boolean).join(', ');

    return `Create a ${data.difficulty} difficulty quiz about "${data.topic}" with exactly ${data.numQuestions} questions total.

Include exactly: ${typeInstructions}

IMPORTANT: Create questions in the exact order and quantities specified above. Do not exceed ${totalQuestions} total questions.

Format the response as JSON with this structure:
{
    "topic": "${data.topic}",
    "difficulty": "${data.difficulty}",
    "questions": [
        {
            "type": "mcq",
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
        },
        {
            "type": "oneword",
            "question": "Question text",
            "answer": "correct answer"
        },
        {
            "type": "flashcard",
            "question": "Question text",
            "answer": "Answer text"
        }
    ]
}

Make questions engaging and educational, testing understanding rather than just memorization.`;
}

// API Routes
app.post('/api/generate-report', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = createReportPrompt(req.body);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        
        res.json({
            success: true,
            content: content,
            metadata: {
                topic: req.body.topic,
                length: req.body.length,
                format: req.body.format,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate report. Please check your API key and try again.'
        });
    }
});

app.post('/api/generate-quiz', async (req, res) => {
    try {
        console.log('Generating quiz for:', req.body.topic);
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = createQuizPrompt(req.body);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();
        
        // Clean and parse JSON response
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const quizData = JSON.parse(content);
        
        res.json({
            success: true,
            ...quizData,
            metadata: {
                generatedAt: new Date().toISOString(),
                requestedTypes: req.body.types,
                requestedQuestions: req.body.numQuestions
            }
        });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz. Please check your API key and try again.'
        });
    }
});

// Download Routes
app.post('/api/download-report', async (req, res) => {
    try {
        const { content, format } = req.body;
        
        if (format === 'pdf') {
            const browser = await puppeteer.launch({ 
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            // Create HTML with proper styling for PDF
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 25px 20px 40px 20px;
                            position: relative;
                        }
                        
                        .watermark {
                            position: fixed;
                            top: 5px;
                            left: 5px;
                            font-size: 8px;
                            color: #000000;
                            font-weight: 700;
                            opacity: 0.3;
                            z-index: 1000;
                            font-family: Arial, sans-serif;
                            letter-spacing: 0.5px;
                        }
                        
                        h1, h2, h3 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; }
                        h1 { font-size: 28px; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
                        h2 { font-size: 22px; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
                        h3 { font-size: 18px; color: #34495e; }
                        p { margin-bottom: 15px; text-align: justify; }
                        ul, ol { margin: 15px 0; padding-left: 30px; }
                        li { margin-bottom: 8px; }
                        strong { color: #2c3e50; font-weight: 600; }
                        em { color: #7f8c8d; font-style: italic; }
                        u { text-decoration: underline; color: #e74c3c; }
                        
                        .report-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .report-table th, .report-table td { 
                            border: 1px solid #bdc3c7; 
                            padding: 12px 8px; 
                            text-align: left; 
                            vertical-align: top;
                        }
                        .report-table th { 
                            background-color: #ecf0f1; 
                            font-weight: 600; 
                            color: #2c3e50;
                        }
                        .report-table tr:nth-child(even) {
                            background-color: #f8f9fa;
                        }
                        
                        .page-break { page-break-before: always; }
                        @page { margin: 1in; size: A4; }
                    </style>
                </head>
                <body>
                    <div class="watermark">Th Logic</div>
                    ${formatContentForPDF(content)}
                </body>
                </html>
            `;
            
            await page.setContent(html);
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' }
            });
            
            await browser.close();
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
            res.send(pdf);
            
        } else if (format === 'docx') {
            const paragraphs = convertToDocxParagraphs(content);
            
            const doc = new Document({
                sections: [{
                    headers: {
                        default: new Header({
                            children: [new Paragraph({
                                children: [new TextRun({
                                    text: "Th Logic",
                                    size: 14,
                                    color: "000000",
                                    bold: true
                                })],
                                alignment: "left"
                            })]
                        })
                    },
                    children: paragraphs
                }]
            });
            
            const buffer = await Packer.toBuffer(doc);
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', 'attachment; filename="report.docx"');
            res.send(buffer);
        }
        
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ success: false, error: 'Failed to generate download' });
    }
});

app.post('/api/download-quiz', async (req, res) => {
    try {
        const quizData = req.body;
        
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 25px 40px 40px 40px; 
                        line-height: 1.6; 
                        position: relative;
                    }
                    
                    .watermark {
                        position: fixed;
                        top: 5px;
                        left: 5px;
                        font-size: 8px;
                        color: #000000;
                        font-weight: 700;
                        opacity: 0.3;
                        z-index: 1000;
                        font-family: Arial, sans-serif;
                        letter-spacing: 0.5px;
                    }
                    
                    .quiz-header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .question { margin-bottom: 30px; page-break-inside: avoid; }
                    .question-title { font-weight: bold; margin-bottom: 10px; font-size: 16px; }
                    .options { margin-left: 20px; }
                    .option { margin: 8px 0; }
                    .answer-key { margin-top: 50px; page-break-before: always; }
                    @page { margin: 1in; size: A4; }
                </style>
            </head>
            <body>
                <div class="watermark">Th Logic</div>
                ${generateQuizHTML(quizData)}
            </body>
            </html>
        `;
        
        await page.setContent(html);
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' }
        });
        
        await browser.close();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="quiz.pdf"');
        res.send(pdf);
        
    } catch (error) {
        console.error('Error downloading quiz:', error);
        res.status(500).json({ success: false, error: 'Failed to generate quiz download' });
    }
});

// Helper functions
function formatContentForPDF(content) {
    let formatted = content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');
    
    // Handle tables - convert markdown tables to HTML
    formatted = formatted.replace(/\|(.+)\|\n\|[-:\s\|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
        const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
        const tableRows = rows.trim().split('\n').map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        let tableHTML = '<table class="report-table"><thead><tr>';
        headerCells.forEach(cell => {
            tableHTML += `<th>${cell}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        tableRows.forEach(row => {
            if (row.length > 0) {
                tableHTML += '<tr>';
                row.forEach(cell => {
                    tableHTML += `<td>${cell}</td>`;
                });
                tableHTML += '</tr>';
            }
        });
        
        tableHTML += '</tbody></table>';
        return tableHTML;
    });
    
    formatted = formatted
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?![<\s])/gm, '<p>')
        .replace(/(?<![>])$/gm, '</p>')
        .replace(/(<li>.*?<\/li>\s*)+/g, '<ul>$&</ul>')
        .replace(/(<li>\d+\..*?<\/li>\s*)+/g, '<ol>$&</ol>');
    
    return formatted;
}

function convertToDocxParagraphs(content) {
    const lines = content.split('\n');
    const paragraphs = [];
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i];
        
        // Handle tables
        if (line.includes('|') && line.trim() !== '') {
            // Find table bounds
            let tableLines = [];
            let j = i;
            while (j < lines.length && lines[j].includes('|') && lines[j].trim() !== '') {
                tableLines.push(lines[j]);
                j++;
            }
            
            if (tableLines.length >= 3) { // Header + separator + at least one row
                const headerRow = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
                const dataRows = tableLines.slice(2).map(row => 
                    row.split('|').map(cell => cell.trim()).filter(cell => cell)
                );
                
                if (headerRow.length > 0 && dataRows.length > 0) {
                    // Create table
                    const tableRows = [];
                    
                    // Header row
                    tableRows.push(new TableRow({
                        children: headerRow.map(cell => new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: cell, bold: true })]
                            })]
                        }))
                    }));
                    
                    // Data rows
                    dataRows.forEach(row => {
                        if (row.length > 0) {
                            tableRows.push(new TableRow({
                                children: row.map(cell => new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: cell })]
                                    })]
                                }))
                            }));
                        }
                    });
                    
                    paragraphs.push(new Table({
                        rows: tableRows
                    }));
                    
                    i = j;
                    continue;
                }
            }
        }
        
        // Handle headings and regular text
        if (line.startsWith('# ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line.replace('# ', ''), bold: true, size: 32 })],
                heading: HeadingLevel.HEADING_1
            }));
        } else if (line.startsWith('## ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line.replace('## ', ''), bold: true, size: 28 })],
                heading: HeadingLevel.HEADING_2
            }));
        } else if (line.startsWith('### ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line.replace('### ', ''), bold: true, size: 24 })],
                heading: HeadingLevel.HEADING_3
            }));
        } else if (line.trim()) {
            // Handle formatted text
            const textRuns = [];
            let text = line;
            
            // Process bold, italic, underline
            const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__)/);
            parts.forEach(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    textRuns.push(new TextRun({ text: part.slice(2, -2), bold: true }));
                } else if (part.startsWith('*') && part.endsWith('*')) {
                    textRuns.push(new TextRun({ text: part.slice(1, -1), italics: true }));
                } else if (part.startsWith('__') && part.endsWith('__')) {
                    textRuns.push(new TextRun({ text: part.slice(2, -2), underline: {} }));
                } else if (part) {
                    textRuns.push(new TextRun({ text: part }));
                }
            });
            
            paragraphs.push(new Paragraph({
                children: textRuns.length > 0 ? textRuns : [new TextRun({ text: line })]
            }));
        } else {
            // Empty line
            paragraphs.push(new Paragraph({}));
        }
        
        i++;
    }
    
    return paragraphs;
}

function generateQuizHTML(quizData) {
    let html = `
        <div class="quiz-header">
            <h1>${quizData.topic}</h1>
            <p>Difficulty: ${quizData.difficulty} | Questions: ${quizData.questions.length}</p>
        </div>
    `;
    
    quizData.questions.forEach((question, index) => {
        html += `<div class="question">`;
        html += `<div class="question-title">${index + 1}. ${question.question}</div>`;
        
        if (question.type === 'mcq') {
            html += `<div class="options">`;
            question.options.forEach((option, optIndex) => {
                html += `<div class="option">○ ${option}</div>`;
            });
            html += `</div>`;
        } else if (question.type === 'oneword') {
            html += `<div class="answer-space">Answer: _________________</div>`;
        }
        
        html += `</div>`;
    });
    
    // Answer key
    html += `<div class="answer-key">`;
    html += `<h2>Answer Key</h2>`;
    quizData.questions.forEach((question, index) => {
        if (question.type === 'mcq') {
            const correctOption = question.options[question.correctAnswer];
            html += `<p>${index + 1}. ${correctOption}</p>`;
        } else if (question.type === 'oneword') {
            html += `<p>${index + 1}. ${question.answer}</p>`;
        }
    });
    html += `</div>`;
    
    return html;
}

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 AvThR Server running on http://localhost:${PORT}`);
    console.log('🚀 Ready to generate reports and quizzes!');
});