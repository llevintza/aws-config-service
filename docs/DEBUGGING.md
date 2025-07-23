# 🐛 Debugging Guide

This guide explains how to debug your AWS Config Service locally with VS Code.

## Quick Start

1. **Set breakpoints** by clicking on the line numbers in your TypeScript files
2. **Press F5** to start debugging, or use the Run & Debug panel
3. **Choose a debug configuration** from the dropdown

## Debug Configurations Available

### 1. Debug TypeScript App ⚡ (Recommended)

- Debugs TypeScript files directly using ts-node
- Hot reload enabled - changes trigger automatic restart
- Best for development

### 2. Debug Compiled JS 🚀

- Compiles TypeScript first, then debugs JavaScript
- Faster startup after initial compilation
- Good for testing production-like builds

### 3. Attach to Running Process 🔗

- Attach to an already running debug process
- Use this with `yarn debug` in terminal
- Useful for debugging running services

### 4. Debug with ts-node-dev 🔄

- Uses ts-node-dev for debugging with hot reload
- Equivalent to running `yarn debug`

## Debug Scripts

Run these in your terminal if you prefer command-line debugging:

```bash
# Debug with hot reload (recommended)
yarn debug

# Debug with breakpoint on first line (waits for debugger)
yarn debug:brk

# Debug compiled JavaScript (faster)
yarn debug:compiled

# Debug compiled JS with initial breakpoint
yarn debug:compiled:brk
```

## How to Debug Step-by-Step

### Option 1: VS Code Debug Panel (Easiest)

1. **Open VS Code** in your project directory
2. **Set breakpoints**: Click on line numbers where you want to pause execution
3. **Open Run & Debug panel**: Click the debug icon in the sidebar (or Ctrl+Shift+D)
4. **Select "Debug TypeScript App"** from the dropdown
5. **Press F5** or click the green play button
6. **Test your API**: Visit http://localhost:3000 or make API calls
7. **Debug when breakpoints hit**: Use debug controls to step through code

### Option 2: Terminal + Attach (Manual)

1. **Start debug server**: `yarn debug`
2. **In VS Code**: Go to Run & Debug panel
3. **Select "Attach to Running Process"**
4. **Press F5** to attach
5. **Test your API** to trigger breakpoints

## Debugging Controls

When debugging is active, you can use these controls:

- **F5**: Continue execution
- **F10**: Step over (execute current line)
- **F11**: Step into (enter function calls)
- **Shift+F11**: Step out (exit current function)
- **Ctrl+Shift+F5**: Restart debugger
- **Shift+F5**: Stop debugger

## Useful Debugging Features

### Debug Console

- **Evaluate expressions**: Type JavaScript/TypeScript expressions
- **Inspect variables**: Hover over variables to see their values
- **Call functions**: Execute functions in the current scope

### Variables Panel

- **View all variables** in current scope
- **Expand objects** to see their properties
- **Watch specific expressions** by adding them to the Watch panel

### Call Stack

- **See the execution path** that led to the current breakpoint
- **Click on stack frames** to navigate between function calls

## Adding Programmatic Breakpoints

Add `debugger;` statement in your code:

```typescript
export async function getConfig(request: ConfigRequest): Promise<ConfigValue | null> {
  // This will pause execution when debugging
  debugger;

  const { tenant, cloudRegion, service, configName } = request;
  // ... rest of your code
}
```

## Debugging Tips

### Performance

- **Use "Debug Compiled JS"** for faster debugging if startup time matters
- **Source maps are enabled**, so you can still debug TypeScript files

### Troubleshooting

- **Port 9229 busy?** Kill existing debug processes: `lsof -ti:9229 | xargs kill`
- **Breakpoints not hit?** Ensure source maps are working and files are saved
- **Can't attach?** Make sure debug server is running with `yarn debug`

### Best Practices

- **Set breakpoints in business logic** (routes, services) rather than framework code
- **Use conditional breakpoints** (right-click breakpoint) for specific conditions
- **Enable "Break on exceptions"** to catch errors early

## Example: Debugging the Config Endpoint

1. **Set a breakpoint** in `src/routes/config.ts` on the line where you handle the request
2. **Set another breakpoint** in `src/services/configService.ts` in the `getConfig` method
3. **Start debugging** with F5
4. **Make a request**: `curl http://localhost:3000/config/tenant1/cloud/us-east-1/service/api-gateway/config/rate-limit`
5. **Step through the code** to see how the request flows through your application

## Debugging with Docker

For debugging in Docker (advanced):

1. **Modify Dockerfile** to expose debug port:

   ```dockerfile
   EXPOSE 3000 9229
   ```

2. **Run with debug flags**:

   ```bash
   docker run -p 3000:3000 -p 9229:9229 aws-config-service node --inspect=0.0.0.0:9229 dist/server.js
   ```

3. **Attach from VS Code** using "Attach to Running Process" configuration

---

Happy debugging! 🐛✨
