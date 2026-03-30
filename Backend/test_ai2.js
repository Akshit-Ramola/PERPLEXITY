import 'dotenv/config'; import { generateChatTitle } from './src/services/ai.service.js'; generateChatTitle('hello').then(console.log).catch(console.error);
