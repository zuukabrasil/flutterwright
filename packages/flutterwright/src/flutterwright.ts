import WebSocket from 'ws';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Locator } from './locator';

/**
 * The core framework orchestrator. Manages the lifecycle of the Flutter application process,
 * establishes high-speed WebSocket RPC connectivity to the Dart VM Service, and handles commands.
 */
export class Flutterwright {
  private ws: WebSocket | null = null;
  private pendingRequests = new Map<number, { resolve: (value: any) => void; reject: (reason?: any) => void }>();
  private messageIdCounter = 1;
  private isolateId: string | null = null;
  private flutterProcess: ChildProcess | null = null;

  // Visual evidence state tracking variables
  private recordingInterval: NodeJS.Timeout | null = null;
  private isRecordingActive = false;

  /**
   * Spawns the underlying Flutter execution engine layer. Automatically detects whether the 
   * target is a raw source code repository directory or a pre-compiled target binary bundle (.apk).
   * @param projectPath Path to the target Flutter app directory OR path to a pre-compiled debug/profile .apk file.
   * @param deviceId Target device runtime handle destination string (e.g., 'linux', 'emulator-5554').
   */
  async launch(projectPath: string, deviceId: string = 'linux'): Promise<void> {
    return new Promise((resolve, reject) => {
      let args = ['run', '-d', deviceId];
      let spawnOptions: any = { shell: true };

      if (projectPath.toLowerCase().endsWith('.apk')) {
        console.log(`Pre-compiled APK binary payload detected! Bypassing local compilation tiers...`);
        
        args.push(`--use-application-binary=${projectPath}`);
        
        spawnOptions.cwd = process.cwd();
      } else {
        console.log(`Source code workspace track isolated. Compiling Flutter pipeline targets on device: '${deviceId}'...`);
        spawnOptions.cwd = projectPath;
      }

      this.flutterProcess = spawn('flutter', args, spawnOptions);

      const vmUrlRegex = /A Dart VM Service on .* is available at: (http:\/\/127\.0\.0\.1:\d+\/[A-Za-z0-9_-]+=\/)/;

      this.flutterProcess.stdout?.on('data', async (data) => {
        const output = data.toString();
        const match = output.match(vmUrlRegex);
        
        if (match && !this.ws) {
          const httpUrl = match[1];
          const wsUrl = httpUrl.replace('http://', 'ws://') + 'ws';
          
          console.log(`🔗 Dart VM URL intercepted successfully! Connecting transport layer to: ${wsUrl}`);
          
          try {
            await this.connect(wsUrl);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      this.flutterProcess.stderr?.on('data', (data) => {
        console.error(`[Flutter Error]: ${data.toString()}`);
      });

      this.flutterProcess.on('close', (code) => {
        console.log(`Flutter terminal runner process terminated with exit code: ${code}`);
      });
    });
  }

  /**
   * Establishes low-level raw WebSocket synchronization with the remote debugging endpoint interface.
   * @param wsUrl Handshake route path string.
   */
  async connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data);
      });

      this.ws.on('open', async () => {
        try {
          // Handshake protocol: fetch active Virtual Machine inventory structure allocations
          const vmInfo = await this._sendRaw('getVM', {});
          this.isolateId = vmInfo.isolates[0].id;
          console.log(`Primary application thread isolate isolated. Connection 100% functional.`);
          resolve();
        } catch (e) {
          reject(e);
        }
      });

      this.ws.on('error', (error) => {
        reject(new Error(`Fatal transport tier handshake degradation mapping connection layout: ${error.message}`));
      });
    });
  }

  /**
   * Evaluates incoming message buffers from the WebSocket pipeline stream to fulfill pending JSON-RPC request allocations.
   */
  private handleMessage(data: WebSocket.Data) {
    try {
      const response = JSON.parse(data.toString());
      if (response.id && this.pendingRequests.has(response.id)) {
        const { resolve, reject } = this.pendingRequests.get(response.id)!;
        if (response.error) {
          reject(new Error(`Dart Runtime Exception payload received: ${JSON.stringify(response.error)}`));
        } else {
          resolve(response.result); 
        }
        this.pendingRequests.delete(response.id);
      }
    } catch (e) {
      console.error('Failed to parse incoming engine service wire format context:', e);
    }
  }

  /**
   * Low-level JSON-RPC protocol envelope builder. Sends asynchronous tracking requests to the pipeline.
   */
  private async _sendRaw(method: string, params: any): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket driver communication pipeline state is currently unavailable or disconnected.');
    }
    return new Promise((resolve, reject) => {
      const id = this.messageIdCounter++;
      this.pendingRequests.set(id, { resolve, reject });
      const payload = { jsonrpc: '2.0', id, method, params };
      
      this.ws!.send(JSON.stringify(payload), (err) => {
        if (err) {
          this.pendingRequests.delete(id);
          reject(err);
        }
      });
    });
  }

  /**
   * Dispatches high-level customized service extension calls directly into the targeted isolate structure.
   * @param method Custom protocol method string register.
   * @param params Configuration arguments mapping object.
   */
  public async sendCommand(method: string, params: any = {}): Promise<any> {
    if (!this.isolateId) throw new Error('Cannot transmit execution context signals: application primary thread context is missing.');
    return this._sendRaw(method, { ...params, isolateId: this.isolateId });
  }

  /**
   * Programmatically requests a viewport raster snapshot directly from the Flutter layout compositor.
   * @param options Target file layout mapping path destination criteria.
   */
  async screenshot(options: { path: string }): Promise<void> {
    const dir = path.dirname(options.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const response = await this.sendCommand('ext.flutterwright.screenshot', {});
    if (response && response.status === 'success' && response.data) {
      const buffer = Buffer.from(response.data, 'base64');
      fs.writeFileSync(options.path, buffer);
      console.log(`Viewport raster file snapshot committed to disk layout: ${options.path}`);
    } else {
      throw new Error('Asynchronous pipeline execution breakdown: failure extracting raster image stream data from the driver.');
    }
  }

  /**
   * Initializes a high-frequency background polling tracking thread to ingest frame buffers sequentially.
   * @param videoDir Filesystem container path directory allocation.
   * @param testName Primary title handle context parameters.
   */
  async startVideoRecording(videoDir: string, testName: string): Promise<void> {
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    this.isRecordingActive = true;
    let frameCounter = 0;

    this.recordingInterval = setInterval(async () => {
      if (!this.ws || !this.isRecordingActive) return;

      try {
        const response = await this.sendCommand('ext.flutterwright.screenshot', {});
        if (response && response.status === 'success' && response.data) {
          const buffer = Buffer.from(response.data, 'base64');
          const frameFileName = `${testName}_frame_${String(frameCounter++).padStart(4, '0')}.png`;
          fs.writeFileSync(path.join(videoDir, frameFileName), buffer);
        }
      } catch (err) {
      }
    }, 100);
  }

  /**
   * Halts the active video tracking process worker and detaches internal loop handlers.
   */
  async stopVideoRecording(): Promise<void> {
    this.isRecordingActive = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
      console.log('Video capture stream paused. Canvas frame sequence preserved inside target workspace directory structure.');
    }
  }

  /**
   * Safely unwinds all background processes, terminates logging loops, and disconnects open communication streams.
   */
  async disconnect(): Promise<void> {
    await this.stopVideoRecording();

    return new Promise((resolve) => {
      if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
        this.ws.close();
      }
      this.ws = null;
      
      if (this.flutterProcess) {
        console.log('Requesting graceful application environment shutdown from Flutter engine (key: "q")...');
        this.flutterProcess.stdin?.write('q');
        
        setTimeout(() => {
          if (this.flutterProcess && this.flutterProcess.killed === false) {
            this.flutterProcess.kill('SIGKILL');
          }
          this.flutterProcess = null;
          resolve();
        }, 1500);
      } else {
        resolve();
      }
    });
  }

  /**
   * Instantiates a new tracking locator wrapper target context reference descriptor.
   * @param selector Custom identifier string mapping strategy rules.
   */
  locator(selector: string): Locator {
    if (!this.ws) throw new Error('Cannot construct tree component locator handles: active communication environment is currently offline.');
    return new Locator(this, selector);
  }

  /**
   * Fluent API locator mapping shortcut helper aimed at looking up elements directly by text visibility patterns.
   * @param text Target value tracking query string.
   */
  getByText(text: string): Locator {
    return this.locator(`text=${text}`);
  }
}