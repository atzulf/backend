import app from '../dist/main.js';

export default async function handler(req, res) {
  return app(req, res);
}
