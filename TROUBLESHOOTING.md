# News To Me Troubleshooting Guide

This guide helps you resolve common issues with News To Me.

## Application Won't Start

### Problem: Application starts but browser doesn't open

**Symptoms**:
- Electron window appears but no browser launches
- Application seems stuck or frozen

**Solutions**:
1. **Manual Browser Launch**
   - Open your web browser (Chrome, Firefox, Edge, Safari)
   - Navigate to: `http://localhost:3001`
   - If you see the News To Me interface, the application is working

2. **Check Default Browser**
   - Windows Settings → Apps → Default apps
   - Verify a web browser is set as the default app
   - Try setting a different browser as default
   - Restart News To Me

3. **Firewall Issues**
   - Check Windows Defender Firewall settings
   - Ensure localhost connections are allowed
   - Try disabling firewall temporarily to test

### Problem: Error "Cannot find the application"

**Symptoms**:
- Error message when trying to start
- Application fails to launch

**Solutions**:
1. **Reinstall the Application**
   - Uninstall News To Me completely (see INSTALL.md)
   - Restart your computer
   - Reinstall News To Me

2. **Run as Administrator**
   - Right-click News To Me icon
   - Select "Run as administrator"
   - Click "Yes" when prompted

3. **Check Disk Space**
   - Ensure you have at least 200 MB free disk space
   - Delete unnecessary files if needed

## Port Already in Use

### Problem: "Port 3001 already in use" error

**Symptoms**:
- Error message when launching
- Backend fails to start

**Solutions**:
1. **Find and Close the Conflicting Application**
   ```bash
   # Open Command Prompt and run:
   netstat -ano | findstr :3001
   ```
   - Note the PID (last column)
   - Close the application using that port
   - Restart News To Me

2. **Use a Different Port**
   - Edit `src/main/server.ts` in the source code
   - Change `private serverPort = 3001;` to a different port (e.g., 3002)
   - Rebuild the application

3. **Restart Your Computer**
   - A system restart often frees up ports
   - Try launching News To Me again

## Backend Server Issues

### Problem: Backend starts but shows errors in console

**Symptoms**:
- Console shows error messages
- Application partially works
- Some features missing or broken

**Solutions**:
1. **Check Environment Variables**
   - Required: `NODE_ENV` (development or production)
   - Required: `PORT` (should be 3001)
   - Backend loads these automatically

2. **Check Configuration**
   - Verify `.env` file exists (if using environment variables)
   - Check config files are in correct locations
   - Review application logs for specific errors

3. **Reset Configuration**
   - Delete any custom configuration files
   - Reinstall the application
   - Use default configuration

### Problem: Backend crashes immediately after starting

**Symptoms**:
- Error message: "Server exited with code [number]"
- Application won't stay open

**Solutions**:
1. **Check Dependencies**
   - Corrupted installation
   - Missing Node.js modules
   - **Fix**: Uninstall and reinstall News To Me

2. **Check System Resources**
   - Insufficient RAM
   - Out of disk space
   - High system load
   - **Fix**: Close other applications, restart computer

3. **Check Port Binding**
   - Port 3001 might require elevated privileges
   - **Fix**: Run News To Me as Administrator

## Browser Issues

### Problem: Browser opens but shows "Connection Refused"

**Symptoms**:
- Browser opens to `http://localhost:3001`
- Shows error: "Cannot connect to server"

**Solutions**:
1. **Verify Backend is Running**
   - Check if backend process is still running
   - Restart News To Me
   - Check Windows Task Manager for `backend.exe` process

2. **Check Localhost**
   - Try `http://127.0.0.1:3001` instead of `http://localhost:3001`
   - If one works but not the other, check network configuration

3. **Disable VPN/Proxy**
   - Temporarily disable VPN or proxy software
   - Try accessing the application
   - Some proxies block localhost connections

### Problem: Browser crashes or freezes

**Symptoms**:
- Browser becomes unresponsive
- Page shows loading spinner indefinitely
- Frequent crashes

**Solutions**:
1. **Clear Browser Cache**
   - In your browser, press Ctrl+Shift+Delete
   - Clear browsing data
   - Restart News To Me

2. **Try Different Browser**
   - Chrome, Firefox, Edge, or Safari
   - Some browsers handle localhost better than others

3. **Disable Browser Extensions**
   - Extensions might interfere with News To Me
   - Temporarily disable all extensions
   - Try accessing News To Me

## Installation Issues

### Problem: Installation fails with error code

**Symptoms**:
- Installer crashes during setup
- Error message with code (e.g., 1603, 1618)

**Solutions**:
1. **Retry as Administrator**
   - Right-click the installer
   - Select "Run as Administrator"
   - Complete the installation

2. **Disable Antivirus**
   - Temporarily disable Windows Defender or antivirus software
   - Run the installer
   - Re-enable antivirus after installation

3. **Clean Uninstall**
   - If already partially installed, uninstall completely
   - Restart your computer
   - Install News To Me again

### Problem: "Access Denied" during installation

**Symptoms**:
- Error message: "Access Denied" or "Permission Denied"
- Cannot write to installation folder

**Solutions**:
1. **Run as Administrator**
   - Right-click installer
   - Select "Run as Administrator"

2. **Check Folder Permissions**
   - If installing to custom location, verify folder is writable
   - Try default installation path: `C:\Program Files\News To Me\`

3. **Unblock Installer**
   - Right-click `News To Me Setup.exe`
   - Select "Properties"
   - Check "Unblock" at the bottom
   - Click "Apply" and "OK"
   - Run the installer

## Performance Issues

### Problem: Application is slow or sluggish

**Symptoms**:
- Slow startup time
- Slow page loading
- UI is unresponsive

**Solutions**:
1. **First Launch is Slow**
   - First launch may take 10-30 seconds
   - Subsequent launches are typically faster
   - This is normal

2. **Close Background Applications**
   - Close browsers with many tabs
   - Close resource-heavy applications
   - Check Task Manager for high CPU/memory usage

3. **Check Disk Health**
   - Run Windows Disk Check
   - Right-click drive → Properties → Tools → Check
   - This may take several minutes

4. **Increase Virtual Memory**
   - Windows Settings → System → Advanced System Settings
   - Under "Performance," click "Settings"
   - Go to "Advanced" tab → Change
   - Increase virtual memory size

### Problem: High memory or CPU usage

**Symptoms**:
- Task Manager shows high CPU or memory for backend
- System becomes unresponsive

**Solutions**:
1. **Reduce Active Tabs**
   - Don't keep News To Me open in multiple tabs
   - Use only one instance

2. **Disable Resource-Heavy Features**
   - Disable browser extensions
   - Disable auto-refresh features
   - Disable video/animation features if available

3. **Restart Application**
   - Close News To Me completely
   - Wait 10 seconds
   - Restart the application

## Uninstallation Issues

### Problem: Cannot uninstall News To Me

**Symptoms**:
- Uninstaller won't run
- Error during uninstallation
- Application still appears in Programs list after uninstall

**Solutions**:
1. **Run Uninstaller as Administrator**
   - Right-click the uninstaller
   - Select "Run as Administrator"
   - Complete the uninstall

2. **Manual Uninstall**
   - Close News To Me completely
   - Delete folder: `C:\Program Files\News To Me\`
   - Go to Windows Settings → Apps → Apps & Features
   - Find "News To Me" and click "Uninstall"
   - Confirm uninstall

3. **Clean Registry (Advanced)**
   - Press Windows Key + R
   - Type `regedit` and press Enter
   - Navigate to `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`
   - Find and delete any "News To Me" entries
   - **Caution**: Registry editing can damage Windows if done incorrectly

## Getting More Help

If these solutions don't work:

1. **Check System Requirements** (see INSTALL.md)
2. **Verify Windows is Up to Date**
   - Check for Windows Updates
   - Install all available updates
   - Restart computer
3. **Try Different Computer**
   - Borrow another Windows computer to test
   - This helps identify if it's a system-specific issue
4. **Report the Issue**
   - Note any error messages
   - Describe what you were doing when the error occurred
   - Include your Windows version and system specs
   - Contact News To Me support

## Advanced Debugging

### View Application Logs

For developers and advanced users, check logs at:
```
C:\Users\[YourUsername]\AppData\Local\News To Me\logs\
```

### Enable Debug Mode

To enable additional logging:
1. Set environment variable: `DEBUG=true`
2. Restart News To Me
3. Check console output for debug messages

### Test Backend Directly

To test if the backend is running:
1. Open Command Prompt
2. Run: `curl http://localhost:3001/health`
3. Should return JSON with status "ok"
