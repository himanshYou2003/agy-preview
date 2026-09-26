import open from 'open';

export interface LaunchResult {
  launched: boolean;
  url: string;
  error?: string;
}

export function isHeadlessEnvironment(): boolean {
  // If explicitly headless flag set
  if (process.env.VDP_HEADLESS === 'true') return true;

  // On Windows, GUI is usually available unless SSH session
  if (process.platform === 'win32') {
    return !!process.env.SSH_CONNECTION && !process.env.DISPLAY;
  }

  // On Linux/Unix, check DISPLAY / WAYLAND_DISPLAY
  if (process.platform === 'linux') {
    return !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY;
  }

  return false;
}

export async function launchPreviewBrowser(url: string): Promise<LaunchResult> {
  if (isHeadlessEnvironment()) {
    console.error(`\n[VDP] Headless/remote environment detected. Open preview at:\n  ${url}\n`);
    return {
      launched: false,
      url
    };
  }

  try {
    const childProcess = await open(url, { wait: false });
    childProcess.on('error', (err) => {
      console.error(`[VDP] Could not auto-launch browser: ${err.message}. Open manually at: ${url}`);
    });
    return {
      launched: true,
      url
    };
  } catch (err: any) {
    console.error(`[VDP] Failed to launch browser: ${err.message}. Open manually at: ${url}`);
    return {
      launched: false,
      url,
      error: err.message
    };
  }
}
