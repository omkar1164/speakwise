/**
 * WebSocket plugin — placeholder, disabled by default.
 *
 * To enable:
 *   1. Uncomment all code below.
 *   2. Register the plugin in server.ts:
 *        import { websocketPlugin } from './plugins/websocket.js';
 *        server.register(websocketPlugin);
 */

// import fp from 'fastify-plugin';
// import websocket from '@fastify/websocket';
// import type { FastifyInstance } from 'fastify';
//
// export const websocketPlugin = fp(async (fastify: FastifyInstance): Promise<void> => {
//   await fastify.register(websocket);
//
//   fastify.get('/ws', { websocket: true }, (socket) => {
//     socket.on('message', (raw) => {
//       socket.send(`echo: ${raw.toString()}`);
//     });
//
//     socket.on('close', () => {
//       fastify.log.info('WebSocket client disconnected');
//     });
//   });
// });
