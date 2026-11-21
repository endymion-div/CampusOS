import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : 'Unexpected Gemini API error.';
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'Gemini API permission denied. Please verify your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Gemini API rate limit reached. Please retry shortly or check quota in Settings > Secrets.',
    };
  }
  if (msg.includes('400') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 400,
      message: 'Invalid Gemini API key. Check GEMINI_API_KEY configuration in Settings > Secrets.',
    };
  }
  return { status: 500, message: msg };
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    const ai = getGeminiClient();
    res.json({
      ok: true,
      geminiConfigured: Boolean(ai),
      model: MODEL_NAME,
    });
  });

  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { message, history, context } = req.body ?? {};
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'A message string is required.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets to enable live Gemini responses.',
        });
        return;
      }

      const contextSummary = JSON.stringify(context ?? {}, null, 2);
      const historyLines = Array.isArray(history)
        ? history
            .slice(-6)
            .map((h: { role?: string; content?: string }) => `${h.role === 'user' ? 'Student' : 'Assistant'}: ${h.content ?? ''}`)
            .join('\n')
        : '';

      const systemInstruction = `You are CampusOS AI Study Assistant, a precise, engineering-minded academic advisor for college students.
You have the student's live academic context (subjects, attendance percentages, upcoming exams, assignments, and timetable).
Always ground your recommendations in their actual dates, subjects, attendance risks (<75%), and workload.
Keep responses clear, structured, actionable, and concise using clean markdown bullets or numbered steps. Never invent courses or deadlines that are not in the student context.`;

      const prompt = `Student Academic Context:
${contextSummary}

Recent Conversation:
${historyLines}

Student Question:
${message}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply: response.text ?? 'I could not generate a response right now. Please try again.',
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/ai/study-plan', async (req, res) => {
    try {
      const { subject, examDate, topics, difficulty, hoursPerDay, existingExams } = req.body ?? {};
      if (!subject || !examDate) {
        res.status(400).json({ error: 'Subject and examDate are required.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets to generate AI study plans.',
        });
        return;
      }

      const prompt = `Build a realistic day-by-day study plan for a college student.
Subject: ${subject}
Exam Date: ${examDate}
Difficulty: ${difficulty || 'Moderate'}
Available Hours Per Day: ${hoursPerDay || 2}
Topics to Cover: ${Array.isArray(topics) ? topics.join(', ') : String(topics || 'Core syllabus')}
Other Upcoming Exams: ${JSON.stringify(existingExams ?? [])}
Generate between 3 and 7 focused study days leading up to the exam, ending with revision and timed practice.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are an academic planning engine. Return structured JSON matching the schema with concrete, non-generic study tasks for each day.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    date: { type: Type.STRING, description: 'YYYY-MM-DD date string' },
                    topic: { type: Type.STRING },
                    hours: { type: Type.NUMBER },
                    tasks: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['dayNumber', 'date', 'topic', 'hours', 'tasks'],
                },
              },
            },
            required: ['days'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{"days":[]}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { context } = req.body ?? {};
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets for live Gemini insights.',
        });
        return;
      }

      const prompt = `Analyze this student's academic telemetry and produce CampusOS Intelligence insights:
${JSON.stringify(context ?? {}, null, 2)}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are CampusOS Intelligence, an academic analytics engine. Analyze attendance percentages, grades, overdue/upcoming assignments, and exams to provide crisp, high-signal recommendations.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weeklySummary: { type: Type.STRING },
              weakSubjects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              upcomingWorkload: { type: Type.STRING },
              attendanceRisks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              examPrepStatus: { type: Type.STRING },
              recommendedPriorities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'weeklySummary',
              'weakSubjects',
              'upcomingWorkload',
              'attendanceRisks',
              'examPrepStatus',
              'recommendedPriorities',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusOS server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start CampusOS server:', err);
  process.exit(1);
});
