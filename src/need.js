{
  "name": "khayal",
  "version": "2.1.0",
  "description": "خيال — منصة عربية لمشاركة برومبتات الذكاء الاصطناعي",
  "type": "module",
  "engines": {
    "node": "20.x"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "db:setup": "node src/seed.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "pg": "^8.13.1",
    "dotenv": "^16.4.5"
  }
}