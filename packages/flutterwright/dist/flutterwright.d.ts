import { Locator } from './locator';
/**
 * The core framework orchestrator. Manages the lifecycle of the Flutter application process,
 * establishes high-speed WebSocket RPC connectivity to the Dart VM Service, and handles commands.
 */
export declare class Flutterwright {
    private ws;
    private pendingRequests;
    private messageIdCounter;
    private isolateId;
    private flutterProcess;
    private recordingInterval;
    private isRecordingActive;
    /**
     * Spawns the underlying Flutter execution engine layer. Automatically detects whether the
     * target is a raw source code repository directory or a pre-compiled target binary bundle (.apk).
     * @param projectPath Path to the target Flutter app directory OR path to a pre-compiled debug/profile .apk file.
     * @param deviceId Target device runtime handle destination string (e.g., 'linux', 'emulator-5554').
     */
    launch(projectPath: string, deviceId?: string): Promise<void>;
    /**
     * Establishes low-level raw WebSocket synchronization with the remote debugging endpoint interface.
     * @param wsUrl Handshake route path string.
     */
    connect(wsUrl: string): Promise<void>;
    /**
     * Evaluates incoming message buffers from the WebSocket pipeline stream to fulfill pending JSON-RPC request allocations.
     */
    private handleMessage;
    /**
     * Low-level JSON-RPC protocol envelope builder. Sends asynchronous tracking requests to the pipeline.
     */
    private _sendRaw;
    /**
     * Dispatches high-level customized service extension calls directly into the targeted isolate structure.
     * @param method Custom protocol method string register.
     * @param params Configuration arguments mapping object.
     */
    sendCommand(method: string, params?: any): Promise<any>;
    /**
     * Programmatically requests a viewport raster snapshot directly from the Flutter layout compositor.
     * @param options Target file layout mapping path destination criteria.
     */
    screenshot(options: {
        path: string;
    }): Promise<void>;
    /**
     * Initializes a high-frequency background polling tracking thread to ingest frame buffers sequentially.
     * @param videoDir Filesystem container path directory allocation.
     * @param testName Primary title handle context parameters.
     */
    startVideoRecording(videoDir: string, testName: string): Promise<void>;
    /**
     * Halts the active video tracking process worker and detaches internal loop handlers.
     */
    stopVideoRecording(): Promise<void>;
    /**
     * Safely unwinds all background processes, terminates logging loops, and disconnects open communication streams.
     */
    disconnect(): Promise<void>;
    /**
     * Instantiates a new tracking locator wrapper target context reference descriptor.
     * @param selector Custom identifier string mapping strategy rules.
     */
    locator(selector: string): Locator;
    /**
     * Fluent API locator mapping shortcut helper aimed at looking up elements directly by text visibility patterns.
     * @param text Target value tracking query string.
     */
    getByText(text: string): Locator;
}
