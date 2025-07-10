import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'pathe';
import { resolvePath } from 'mlly';

// 定义自己的类型
interface StubContext {
  options: {
    rootDir: string;
    outDir: string;
    declaration?: 'compatible' | 'node16' | boolean;
  };
  pkg: {
    name?: string;
    type?: 'module' | 'commonjs';
    exports?: Record<string, any>;
  };
}

// 简单的warn函数
function warn(ctx: StubContext, message: string): void {
  console.warn(`[rolldown] ${message}`);
}

interface ExportConfig {
  import?: string;
  require?: string;
  default?: string;
  [key: string]: any;
}
type ExportsMap = Record<string, string | ExportConfig>;

export async function rolldownStub(ctx: StubContext): Promise<void> {
  const exports = ctx.pkg.exports as ExportsMap;
  if (!exports) {
    warn(ctx, 'No exports field found in package.json, skipping stub generation');
    return;
  }

  // 计算 tsx 路径（相对 outDir）
  const tsxESMPath = relative(
    resolve(ctx.options.rootDir, ctx.options.outDir),
    await resolvePath('tsx', { url: import.meta.url, conditions: ['node', 'import'] })
  );
  const tsxCJSPath = relative(
    resolve(ctx.options.rootDir, ctx.options.outDir),
    await resolvePath('tsx', { url: import.meta.url, conditions: ['node', 'require'] })
  );

  await processExports(ctx, exports, tsxESMPath, tsxCJSPath);
}

async function processExports(
  ctx: StubContext,
  exports: ExportsMap,
  tsxESMPath: string,
  tsxCJSPath: string
): Promise<void> {
  const outDir = resolve(ctx.options.rootDir, ctx.options.outDir);
  await mkdir(outDir, { recursive: true });

  for (const [exportPath, exportConfig] of Object.entries(exports)) {
    const config: ExportConfig = typeof exportConfig === 'string' ? { import: exportConfig } : exportConfig;

    await generateStubForExport(ctx, exportPath, config, outDir, tsxESMPath, tsxCJSPath);
  }
}

async function generateStubForExport(
  ctx: StubContext,
  exportPath: string,
  exportConfig: ExportConfig,
  outDir: string,
  tsxESMPath: string,
  tsxCJSPath: string
): Promise<void> {
  const sourcePath = exportConfig.import || exportConfig.require || exportConfig.default;
  if (!sourcePath) {
    warn(ctx, `No source path found for export: ${exportPath}`);
    return;
  }
  if (sourcePath.includes('*')) {
    warn(ctx, `Wildcard export not supported: ${exportPath}`);
    return;
  }

  const resolvedSourcePath = resolve(ctx.options.rootDir, sourcePath.replace(/^\.\//, ''));
  const relativeSourcePath = relative(outDir, resolvedSourcePath);
  const outputBase = resolve(outDir, exportPath);
  const outputDir = dirname(outputBase);
  await mkdir(outputDir, { recursive: true });

  // 生成ESM stub
  if (exportConfig.import || exportConfig.default) {
    const esmStub = generateESMStub(relativeSourcePath, tsxESMPath);
    await writeFile(`${outputBase}.mjs`, esmStub);
  }
  // 生成CJS stub
  if (exportConfig.require || exportConfig.default) {
    const cjsStub = generateCJSStub(relativeSourcePath, tsxCJSPath);
    await writeFile(`${outputBase}.cjs`, cjsStub);
  }
  // 生成类型声明文件
  if (ctx.options.declaration) {
    const dtsContent = generateDTSStub(relativeSourcePath);
    await writeFile(`${outputBase}.d.ts`, dtsContent);
  }
}

function generateESMStub(sourcePath: string, tsxESMPath: string): string {
  return [
    `import { tsImport } from ${JSON.stringify(`${tsxESMPath}/esm/api`)};`,
    '',
    `const _module = await tsImport(new URL(${JSON.stringify(sourcePath)}, import.meta.url), import.meta.url);`,
    `export default _module?.default ?? _module;`
  ].join('\n');
}

function generateCJSStub(sourcePath: string, tsxCJSPath: string): string {
  return [
    `const tsx = require(${JSON.stringify(`${tsxCJSPath}/cjs/api`)});`,
    '',
    `const _module = tsx.require(require('path').resolve(__dirname, ${JSON.stringify(sourcePath)}));`,
    `module.exports = _module?.default ?? _module;`
  ].join('\n');
}

function generateDTSStub(sourcePath: string): string {
  return [
    `export * from ${JSON.stringify(sourcePath)};`,
    `export { default } from ${JSON.stringify(sourcePath)};`
  ].join('\n');
}
