import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installAntigravity, installClaude, installCursor, installAll, main } from '../src/cli.js';
import { VdpMcpServer } from '../src/server/mcp-server.js';

describe('CLI - Exhaustive QA Coverage', () => {
  const tempDirs: string[] = [];

  const createTempDir = () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vdp-cli-test-'));
    tempDirs.push(dir);
    return dir;
  };

  afterEach(async () => {
    vi.restoreAllMocks();
    for (const dir of tempDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {}
    }
  });

  it('runs installAntigravity and creates skills, rules, and mcp_config.json', async () => {
    const testDir = createTempDir();
    const result = await installAntigravity(testDir);

    expect(result.success).toBe(true);

    const skillFile = path.join(testDir, '.agents', 'skills', 'visual-shotgun', 'SKILL.md');
    expect(fs.existsSync(skillFile)).toBe(true);
    expect(fs.readFileSync(skillFile, 'utf-8')).toContain('visual-shotgun');

    const ruleFile = path.join(testDir, '.agents', 'rules', 'visual-decision.md');
    expect(fs.existsSync(ruleFile)).toBe(true);
    expect(fs.readFileSync(ruleFile, 'utf-8')).toContain('Visual Decision Rule');

    const mcpConfig = path.join(testDir, 'mcp_config.json');
    expect(fs.existsSync(mcpConfig)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(mcpConfig, 'utf-8'));
    expect(parsed.mcpServers['visual-decision-plane']).toBeDefined();
  });

  it('handles existing valid and malformed mcp_config.json gracefully', async () => {
    const testDir = createTempDir();
    const mcpConfig = path.join(testDir, 'mcp_config.json');

    // Case 1: Existing valid config with existing servers
    fs.writeFileSync(mcpConfig, JSON.stringify({ mcpServers: { otherServer: { command: 'echo' } } }));
    await installAntigravity(testDir);
    let parsed = JSON.parse(fs.readFileSync(mcpConfig, 'utf-8'));
    expect(parsed.mcpServers.otherServer).toBeDefined();
    expect(parsed.mcpServers['visual-decision-plane']).toBeDefined();

    // Case 2: Corrupted JSON file
    fs.writeFileSync(mcpConfig, '{ invalid json');
    await installAntigravity(testDir);
    parsed = JSON.parse(fs.readFileSync(mcpConfig, 'utf-8'));
    expect(parsed.mcpServers['visual-decision-plane']).toBeDefined();

    // Case 3: Valid JSON lacking mcpServers key
    fs.writeFileSync(mcpConfig, JSON.stringify({ version: '1.0.0' }));
    await installAntigravity(testDir);
    parsed = JSON.parse(fs.readFileSync(mcpConfig, 'utf-8'));
    expect(parsed.mcpServers['visual-decision-plane']).toBeDefined();
  });

  it('runs installClaude and creates .claude.json and CLAUDE.md with fallback handling', async () => {
    const testDir = createTempDir();
    const claudeJson = path.join(testDir, '.claude.json');

    // Case 1: Fresh install
    const res1 = await installClaude(testDir);
    expect(res1.success).toBe(true);
    expect(fs.existsSync(claudeJson)).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'CLAUDE.md'))).toBe(true);

    // Case 2: Corrupted JSON file & existing rule in CLAUDE.md
    fs.writeFileSync(claudeJson, '{ malformed');
    const res2 = await installClaude(testDir);
    expect(res2.success).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(claudeJson, 'utf-8'));
    expect(parsed.mcpServers['visual-decision-plane']).toBeDefined();

    // Case 3: Valid JSON lacking mcpServers
    fs.writeFileSync(claudeJson, JSON.stringify({ version: 1 }));
    await installClaude(testDir);
  });

  it('runs installCursor and creates .cursor/mcp.json and .cursorrules with fallback handling', async () => {
    const testDir = createTempDir();
    const cursorDir = path.join(testDir, '.cursor');
    const cursorMcp = path.join(cursorDir, 'mcp.json');

    // Case 1: Fresh install
    const res1 = await installCursor(testDir);
    expect(res1.success).toBe(true);
    expect(fs.existsSync(cursorMcp)).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.cursorrules'))).toBe(true);

    // Case 2: Corrupted JSON file & existing rule in .cursorrules
    fs.writeFileSync(cursorMcp, '{ bad json');
    const res2 = await installCursor(testDir);
    expect(res2.success).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(cursorMcp, 'utf-8'));
    expect(parsed.mcpServers['visual-decision-plane']).toBeDefined();

    // Case 3: Valid JSON lacking mcpServers
    fs.writeFileSync(cursorMcp, JSON.stringify({ version: 1 }));
    await installCursor(testDir);
  });

  it('runs installAll and bootstraps Antigravity, Claude, and Cursor simultaneously', async () => {
    const testDir = createTempDir();
    const res = await installAll(testDir);
    expect(res.success).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'mcp_config.json'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.claude.json'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '.cursor', 'mcp.json'))).toBe(true);
  });

  it('main routes specific integration flags to appropriate installers', async () => {
    const testDir = createTempDir();
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(testDir);

    await main(['install-antigravity']);
    expect(fs.existsSync(path.join(testDir, 'mcp_config.json'))).toBe(true);

    await main(['install-claude']);
    expect(fs.existsSync(path.join(testDir, '.claude.json'))).toBe(true);

    await main(['install-cursor']);
    expect(fs.existsSync(path.join(testDir, '.cursor', 'mcp.json'))).toBe(true);

    await main(['init']);
    expect(fs.existsSync(path.join(testDir, '.agents', 'rules', 'visual-decision.md'))).toBe(true);
    cwdSpy.mockRestore();
  });

  it('main starts VdpMcpServer when no install flag is passed', async () => {
    const startSpy = vi.spyOn(VdpMcpServer.prototype, 'start').mockResolvedValue(undefined);
    const serverInstance = await main([]);
    expect(startSpy).toHaveBeenCalledOnce();
    expect(serverInstance).toBeInstanceOf(VdpMcpServer);
  });

  it('executes cli directly as a subprocess when run from command line', async () => {
    const testDir = createTempDir();
    const cliScript = path.resolve(process.cwd(), 'dist', 'cli.js');
    if (fs.existsSync(cliScript)) {
      const { execFileSync } = await import('node:child_process');
      const out = execFileSync(process.execPath, [cliScript, 'init'], {
        cwd: testDir,
        encoding: 'utf-8',
        env: { ...process.env, VITEST: '' }
      });
      expect(out).toContain('[VDP] Universal installation complete');
      expect(fs.existsSync(path.join(testDir, 'mcp_config.json'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude.json'))).toBe(true);
    }
  });
});
