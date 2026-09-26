import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isHeadlessEnvironment, launchPreviewBrowser } from '../src/server/browser-launcher.js';
import open from 'open';

vi.mock('open', () => ({
  default: vi.fn()
}));

describe('Browser Launcher - Exhaustive QA Coverage', () => {
  const originalEnv = { ...process.env };
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('detects headless when VDP_HEADLESS is true', () => {
    process.env.VDP_HEADLESS = 'true';
    expect(isHeadlessEnvironment()).toBe(true);
  });

  it('detects headless on Linux when DISPLAY and WAYLAND_DISPLAY are unset', () => {
    delete process.env.VDP_HEADLESS;
    delete process.env.DISPLAY;
    delete process.env.WAYLAND_DISPLAY;
    Object.defineProperty(process, 'platform', { value: 'linux' });

    expect(isHeadlessEnvironment()).toBe(true);
  });

  it('detects GUI on Linux when DISPLAY is present', () => {
    delete process.env.VDP_HEADLESS;
    delete process.env.SSH_CONNECTION;
    process.env.DISPLAY = ':0';
    Object.defineProperty(process, 'platform', { value: 'linux' });

    expect(isHeadlessEnvironment()).toBe(false);
  });

  it('returns false for standard desktop GUI on darwin/win32', () => {
    delete process.env.VDP_HEADLESS;
    delete process.env.SSH_CONNECTION;
    Object.defineProperty(process, 'platform', { value: 'darwin' });

    expect(isHeadlessEnvironment()).toBe(false);
  });

  it('detects headless on Windows when SSH_CONNECTION is present without DISPLAY', () => {
    delete process.env.VDP_HEADLESS;
    process.env.SSH_CONNECTION = '192.168.1.1 22 192.168.1.2 5555';
    delete process.env.DISPLAY;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    expect(isHeadlessEnvironment()).toBe(true);
  });

  it('returns launched: false in headless environment without calling open', async () => {
    process.env.VDP_HEADLESS = 'true';
    const result = await launchPreviewBrowser('http://127.0.0.1:4200');

    expect(result.launched).toBe(false);
    expect(result.url).toBe('http://127.0.0.1:4200');
    expect(open).not.toHaveBeenCalled();
  });

  it('calls open and returns launched: true when GUI is present', async () => {
    delete process.env.VDP_HEADLESS;
    delete process.env.SSH_CONNECTION;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    const mockChildProcess = {
      on: vi.fn()
    };
    vi.mocked(open).mockResolvedValueOnce(mockChildProcess as any);

    const result = await launchPreviewBrowser('http://127.0.0.1:4200');
    expect(result.launched).toBe(true);
    expect(result.url).toBe('http://127.0.0.1:4200');
    expect(open).toHaveBeenCalledWith('http://127.0.0.1:4200', { wait: false });
  });

  it('handles open failure gracefully and returns launched: false with error message', async () => {
    delete process.env.VDP_HEADLESS;
    delete process.env.SSH_CONNECTION;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    vi.mocked(open).mockRejectedValueOnce(new Error('Spawn ENOENT'));

    const result = await launchPreviewBrowser('http://127.0.0.1:4200');
    expect(result.launched).toBe(false);
    expect(result.error).toBe('Spawn ENOENT');
  });

  it('attaches error listener to spawned child process', async () => {
    delete process.env.VDP_HEADLESS;
    delete process.env.SSH_CONNECTION;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    let errorHandler: ((err: Error) => void) | undefined;
    const mockChild = {
      on: vi.fn((event, handler) => {
        if (event === 'error') errorHandler = handler;
      })
    };
    vi.mocked(open).mockResolvedValueOnce(mockChild as any);

    await launchPreviewBrowser('http://127.0.0.1:4200');
    expect(mockChild.on).toHaveBeenCalledWith('error', expect.any(Function));

    // Simulate child error
    if (errorHandler) {
      expect(() => errorHandler!(new Error('Async browser crash'))).not.toThrow();
    }
  });
});
