import 'dotenv/config'; import { generateResponse } from './src/services/ai.service.js'; generateResponse([{role: 'user', content: 'test'}]).then(console.log).catch(console.error);
