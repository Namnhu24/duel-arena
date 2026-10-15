# Yu-Gi-Oh! Master Duel Arena 3D

## Run locally
Requirements: Node.js 22.12+ and npm.

```bash
npm install
npm run build
npm start
```

Open http://localhost:3000. The production Express server serves the built Vite app and hosts multiplayer WebSocket connections at `/ws`.

For development, use `npm run dev`. Vite's dev server attaches the WebSocket duel server at `/ws`.

## Deploy on Render
1. Push this repository to GitHub.
2. In Render, create **New → Web Service** and connect the repository.
3. Set Runtime to **Node**.
4. Set Build Command to `npm install && npm run build`.
5. Set Start Command to `npm start`.
6. Deploy. Render supplies `PORT` automatically; the server listens on `process.env.PORT`.
7. Open the generated HTTPS URL and test the game and online rooms.

Do not deploy this project as a Static Site: online duels require the Node.js server and WebSocket endpoint.

## Deploy on Railway
1. Create a project from the GitHub repository.
2. Set Build Command to `npm install && npm run build` and Start Command to `npm start` if not detected automatically.
3. Generate a public domain for the service.
4. Test the home page and `/ws` multiplayer connections.

## Notes
- The home screen background is served from `public/menu-dragon.png`.
- Online rooms are held in server memory and can be cleared when the service restarts.
- Keep secrets in the hosting provider's environment variables, not in Git.
