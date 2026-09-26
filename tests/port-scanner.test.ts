import { describe, it, expect } from 'vitest';
import net from 'node:net';
import { findAvailablePort, isPortAvailable, PortExhaustionError } from '../src/server/port-scanner.js';

describe('Port Scanner - Exhaustive QA Coverage', () => {
  it('finds an available port with default options', async () => {
    const port = await findAvailablePort();
    expect(port).toBeGreaterThanOrEqual(4200);
    expect(port).toBeLessThan(4210);
  });

  it('skips a busy port and finds the next available port', async () => {
    const busyPort = 4288;
    const busyServer = net.createServer();
    await new Promise<void>((resolve) => busyServer.listen(busyPort, '127.0.0.1', () => resolve()));

    try {
      const isBusy = await isPortAvailable(busyPort, '127.0.0.1');
      expect(isBusy).toBe(false);

      const nextPort = await findAvailablePort({ startPort: busyPort, maxTries: 3 });
      expect(nextPort).toBeGreaterThan(busyPort);
    } finally {
      await new Promise<void>((resolve) => busyServer.close(() => resolve()));
    }
  });

  it('throws PortExhaustionError when all candidate ports are busy', async () => {
    const p1 = 4295;
    const p2 = 4296;

    const s1 = net.createServer();
    const s2 = net.createServer();

    await new Promise<void>((resolve) => s1.listen(p1, '127.0.0.1', () => resolve()));
    await new Promise<void>((resolve) => s2.listen(p2, '127.0.0.1', () => resolve()));

    try {
      await expect(findAvailablePort({ startPort: p1, maxTries: 2 })).rejects.toThrow(PortExhaustionError);
    } finally {
      await new Promise<void>((resolve) => s1.close(() => resolve()));
      await new Promise<void>((resolve) => s2.close(() => resolve()));
    }
  });

  it('handles socket errors cleanly in isPortAvailable', async () => {
    // Port 0 is invalid for binding in this context, or non-numeric
    const result = await isPortAvailable(-1);
    expect(result).toBe(false);
  });
});
