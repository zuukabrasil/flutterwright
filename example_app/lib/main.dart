import 'package:flutter/material.dart';
import 'package:flutterwright_driver/flutterwright_driver.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  FlutterwrightDriver.enable();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutterwright Test Sandbox',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _welcomeMessage = "Preencha seu nome";
  bool _isItemDeleted = false;
  bool _isInputHovered = false;
  final TextEditingController _controller = TextEditingController();

  void _processSubmission({required String triggerMethod}) {
    setState(() {
      if (_controller.text.trim().isNotEmpty) {
        _welcomeMessage = "Olá, ${_controller.text.trim()}! ($triggerMethod)";
      } else {
        _welcomeMessage = "Preencha seu nome";
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutterwright Test Room'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          const SizedBox(height: 20),

          GestureDetector(
            onDoubleTap: () {
              setState(() {
                _welcomeMessage = "⚡ Double Click Detected! ⚡";
              });
            },
            child: Center(
              child: Text(
                _welcomeMessage,
                key: const ValueKey('welcome-txt'),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          const SizedBox(height: 30),

          MouseRegion(
            onEnter: (_) => setState(() => _isInputHovered = true),
            onExit: (_) => setState(() => _isInputHovered = false),
            child: TextField(
              key: const ValueKey('name-input'),
              controller: _controller,
              decoration: InputDecoration(
                labelText: 'Seu Nome',
                hintText: 'Enter your name here',
                helperText: _isInputHovered ? 'Pointer hovering active!' : null,
                border: const OutlineInputBorder(),
                prefixIcon: Icon(
                  Icons.person,
                  color: _isInputHovered ? Colors.deepPurple : Colors.grey,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          ElevatedButton.icon(
            key: const ValueKey('submit-btn'),
            icon: const Icon(Icons.check),
            onPressed: () => _processSubmission(triggerMethod: 'Standard Tap'),
            onLongPress: () => _processSubmission(triggerMethod: 'Long Press'),
            label: const Text('Confirmar'),
          ),

          const SizedBox(height: 600),

          const Divider(thickness: 2),
          const SizedBox(height: 20),
          const Text(
            'Interactive Gestures Section',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 10),

          if (!_isItemDeleted)
            SingleChildScrollView(
              key: const ValueKey('item-wrapper-0'),
              scrollDirection: Axis.horizontal,
              physics: const ClampingScrollPhysics(),
              child: Row(
                children: [
                  Container(
                    key: const ValueKey('item-index-0'),
                    width: MediaQuery.of(context).size.width - 48,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: const BorderRadius.horizontal(
                        left: Radius.circular(12),
                      ),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: const ListTile(
                      leading: Icon(Icons.drag_handle, color: Colors.blue),
                      title: Text('Lucas Rafael Card Record'),
                      subtitle: Text('◀ Swipe left to uncover context actions'),
                    ),
                  ),

                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _isItemDeleted = true;
                        _welcomeMessage = "Record Deleted Successfully";
                      });
                    },
                    child: Container(
                      key: const ValueKey('delete-btn'),
                      width: 100,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.horizontal(
                          right: Radius.circular(12),
                        ),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.delete, color: Colors.white),
                          SizedBox(height: 4),
                          Text(
                            'Delete',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            Container(
              height: 80,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: const Center(
                child: Text(
                  'Card item structure was wiped.',
                  style: TextStyle(
                    color: Colors.grey,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ),

          const SizedBox(height: 100),
        ],
      ),
    );
  }
}
