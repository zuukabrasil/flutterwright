import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:ui' as ui;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class FlutterwrightDriver {
  static void enable() {
    developer.postEvent('flutterwright', {'status': 'started'});
    print('🎭 Flutterwright Driver listening for commands on Dart VM...');

    _registerTapCommand();
    _registerFillCommand();
    _registerGetTextCommand();
    _registerScreenshotCommand();
    _registerSwipeCommand();
    _registerCountCommand();
    _registerLongPressCommand();
    _registerDoubleClickCommand();
    _registerHoverCommand();
  }

  static void _registerTapCommand() {
    developer.registerExtension('ext.flutterwright.tap',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;
        Element? element = _findElement(target, parent: parent);

        if (element != null) {
          await _simulateTap(element);
          print(
              'Physical CLICK triggered on element: $target (Scoped: ${parent ?? "Root"})');
          return developer.ServiceExtensionResponse.result(
              jsonEncode({'status': 'success'}));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerFillCommand() {
    developer.registerExtension('ext.flutterwright.fill',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final text = parameters['text'] as String;
        final parent = parameters['parent'] as String?;
        Element? element = _findElement(target, parent: parent);

        if (element != null) {
          await _simulateFill(element, text);
          print(
              '⌨️ Text "$text" filled into element: $target (Scoped: ${parent ?? "Root"})');
          return developer.ServiceExtensionResponse.result(
              jsonEncode({'status': 'success'}));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerGetTextCommand() {
    developer.registerExtension('ext.flutterwright.getText',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;
        Element? element = _findElement(target, parent: parent);

        if (element != null) {
          final text = _extractText(element);
          return developer.ServiceExtensionResponse.result(jsonEncode({
            'status': 'success',
            'text': text,
          }));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerScreenshotCommand() {
    developer.registerExtension('ext.flutterwright.screenshot',
        (method, parameters) async {
      try {
        RenderRepaintBoundary? boundary;

        void findRepaintBoundary(RenderObject object) {
          if (boundary != null) return;
          if (object is RenderRepaintBoundary) {
            boundary = object;
            return;
          }
          object.visitChildren(findRepaintBoundary);
        }

        final rootElement = WidgetsBinding.instance.renderViewElement;
        if (rootElement != null && rootElement.renderObject != null) {
          findRepaintBoundary(rootElement.renderObject!);
        }

        if (boundary != null) {
          final image = await boundary!.toImage(pixelRatio: 1.0);
          final byteData =
              await image.toByteData(format: ui.ImageByteFormat.png);

          if (byteData != null) {
            final bytes = byteData.buffer.asUint8List();
            final base64Image = base64Encode(bytes);

            return developer.ServiceExtensionResponse.result(jsonEncode({
              'status': 'success',
              'data': base64Image,
            }));
          }
        }

        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError,
            'Failed to isolate an active RenderRepaintBoundary composition layer.');
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerSwipeCommand() {
    developer.registerExtension('ext.flutterwright.swipe',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;
        final direction = parameters['direction'] as String;
        final distance =
            double.parse(parameters['distance']?.toString() ?? '200');
        final steps = int.parse(parameters['steps']?.toString() ?? '10');

        Element? element = _findElement(target, parent: parent);

        if (element != null) {
          await _simulateSwipe(element, direction, distance, steps);

          print(
              'Physical SWIPE ($direction) triggered on element: $target (Distance: $distance px)');

          return developer.ServiceExtensionResponse.result(
              jsonEncode({'status': 'success'}));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerCountCommand() {
    developer.registerExtension('ext.flutterwright.count',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;

        final elements = _findElements(target, parent: parent);
        return developer.ServiceExtensionResponse.result(jsonEncode({
          'status': 'success',
          'count': elements.length,
        }));
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerLongPressCommand() {
    developer.registerExtension('ext.flutterwright.longPress',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;
        final index = int.parse(parameters['index']?.toString() ?? '0');
        final durationMs =
            int.parse(parameters['durationMs']?.toString() ?? '600');

        Element? element = _findElement(target, parent: parent, index: index);

        if (element != null) {
          await _simulateLongPress(element, durationMs);
          print(
              'Physical LONG PRESS ($durationMs ms) triggered on element: $target [index: $index]');
          return developer.ServiceExtensionResponse.result(
              jsonEncode({'status': 'success'}));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target at index $index');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerDoubleClickCommand() {
    developer.registerExtension('ext.flutterwright.doubleClick',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;
        final index = int.parse(parameters['index']?.toString() ?? '0');

        Element? element = _findElement(target, parent: parent, index: index);

        if (element != null) {
          await _simulateDoubleClick(element);
          print(
              'Physical DOUBLE CLICK triggered on element: $target [index: $index]');
          return developer.ServiceExtensionResponse.result(
              jsonEncode({'status': 'success'}));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target at index $index');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static void _registerHoverCommand() {
    developer.registerExtension('ext.flutterwright.hover',
        (method, parameters) async {
      try {
        final target = parameters['target'] as String;
        final parent = parameters['parent'] as String?;
        final index = int.parse(parameters['index']?.toString() ?? '0');

        Element? element = _findElement(target, parent: parent, index: index);

        if (element != null) {
          await _simulateHover(element);
          print('Pointer HOVER mapped onto element: $target [index: $index]');
          return developer.ServiceExtensionResponse.result(
              jsonEncode({'status': 'success'}));
        } else {
          return developer.ServiceExtensionResponse.error(
              developer.ServiceExtensionResponse.invalidParams,
              'Element not found: $target at index $index');
        }
      } catch (e) {
        return developer.ServiceExtensionResponse.error(
            developer.ServiceExtensionResponse.extensionError, e.toString());
      }
    });
  }

  static Future<void> _simulateTap(Element element) async {
    await Scrollable.ensureVisible(element);
    await WidgetsBinding.instance.endOfFrame;

    final RenderBox box = element.renderObject as RenderBox;
    final Offset center = box.localToGlobal(box.size.center(Offset.zero));

    final downEvent = PointerDownEvent(position: center);
    final upEvent = PointerUpEvent(position: center);

    WidgetsBinding.instance.handlePointerEvent(downEvent);
    WidgetsBinding.instance.handlePointerEvent(upEvent);
  }

  static Future<void> _simulateFill(Element element, String text) async {
    await Scrollable.ensureVisible(element);
    await WidgetsBinding.instance.endOfFrame;

    StatefulElement? editableElement;

    void findEditable(Element e) {
      if (e is StatefulElement && e.widget is EditableText) {
        editableElement = e;
      } else {
        e.visitChildren(findEditable);
      }
    }

    if (element is StatefulElement && element.widget is EditableText) {
      editableElement = element;
    } else {
      element.visitChildren(findEditable);
    }

    if (editableElement != null) {
      final state = editableElement!.state;

      if (state is EditableTextState) {
        String currentText = '';

        for (int i = 0; i < text.length; i++) {
          currentText += text[i];

          state.updateEditingValue(TextEditingValue(
            text: currentText,
            selection: TextSelection.collapsed(offset: currentText.length),
          ));

          await WidgetsBinding.instance.endOfFrame;
          await Future.delayed(const Duration(milliseconds: 150));
        }
        return;
      }
    }

    throw Exception('The element is not a valid editable text field.');
  }

  static Future<void> _simulateSwipe(
      Element element, String direction, double distance, int steps) async {
    await Scrollable.ensureVisible(element);
    await WidgetsBinding.instance.endOfFrame;

    final RenderBox box = element.renderObject as RenderBox;
    final Offset center = box.localToGlobal(box.size.center(Offset.zero));

    Offset start = center;
    Offset end = center;

    switch (direction) {
      case 'up':
        end = Offset(center.dx, center.dy - distance);
        break;
      case 'down':
        end = Offset(center.dx, center.dy + distance);
        break;
      case 'left':
        end = Offset(center.dx - distance, center.dy);
        break;
      case 'right':
        end = Offset(center.dx + distance, center.dy);
        break;
    }

    WidgetsBinding.instance
        .handlePointerEvent(PointerDownEvent(position: start));
    await WidgetsBinding.instance.endOfFrame;

    for (int i = 1; i <= steps; i++) {
      double t = i / steps;
      Offset currentPosition = Offset.lerp(start, end, t)!;

      WidgetsBinding.instance
          .handlePointerEvent(PointerMoveEvent(position: currentPosition));
      await WidgetsBinding.instance.endOfFrame;

      await Future.delayed(const Duration(milliseconds: 10));
    }

    WidgetsBinding.instance.handlePointerEvent(PointerUpEvent(position: end));
    await WidgetsBinding.instance.endOfFrame;
  }

  static Future<void> _simulateLongPress(
      Element element, int durationMs) async {
    await Scrollable.ensureVisible(element);
    await WidgetsBinding.instance.endOfFrame;

    final RenderBox box = element.renderObject as RenderBox;
    final Offset center = box.localToGlobal(box.size.center(Offset.zero));

    WidgetsBinding.instance
        .handlePointerEvent(PointerDownEvent(position: center));
    await WidgetsBinding.instance.endOfFrame;

    await Future.delayed(Duration(milliseconds: durationMs));

    WidgetsBinding.instance
        .handlePointerEvent(PointerUpEvent(position: center));
    await WidgetsBinding.instance.endOfFrame;
  }

  static Future<void> _simulateDoubleClick(Element element) async {
    await _simulateTap(element);
    await Future.delayed(const Duration(milliseconds: 120));
    await _simulateTap(element);
  }

  static Future<void> _simulateHover(Element element) async {
    await Scrollable.ensureVisible(element);
    await WidgetsBinding.instance.endOfFrame;

    final RenderBox box = element.renderObject as RenderBox;
    final Offset center = box.localToGlobal(box.size.center(Offset.zero));

    WidgetsBinding.instance
        .handlePointerEvent(PointerHoverEvent(position: center));
    await WidgetsBinding.instance.endOfFrame;
  }

  static Element? _findElement(String? selector,
      {String? parent, int index = 0}) {
    final elements = _findElements(selector, parent: parent);
    if (elements.isEmpty || index < 0 || index >= elements.length) return null;
    return elements[index];
  }

  static List<Element> _findElements(String? selector, {String? parent}) {
    if (selector == null) return [];

    Element? startScopeElement;
    if (parent != null) {
      startScopeElement = _findElement(parent);
      if (startScopeElement == null) return [];
    } else {
      startScopeElement = WidgetsBinding.instance.renderViewElement;
    }

    final List<Element> foundElements = [];

    void search(Element element) {
      if (selector.startsWith('text=')) {
        final textToFind = selector.substring(5);
        if (element.widget is Text &&
            (element.widget as Text).data == textToFind) {
          foundElements.add(element);
        }
      } else if (selector.startsWith('semantics-label=')) {
        final labelToFind = selector.substring(16);
        if (element.widget is Semantics) {
          final semanticsWidget = element.widget as Semantics;
          if (semanticsWidget.properties.label == labelToFind) {
            foundElements.add(element);
          }
        }
      } else {
        if (element.widget.key == ValueKey(selector)) {
          foundElements.add(element);
        }
      }

      element.visitChildren(search);
    }

    if (startScopeElement != null) {
      if (parent != null) {
        startScopeElement.visitChildren(search);
      } else {
        search(startScopeElement);
      }
    }

    return foundElements;
  }

  static String? _extractText(Element element) {
    String? foundText;

    void visitor(Element e) {
      if (foundText != null) return;

      if (e.widget is Text) {
        foundText = (e.widget as Text).data;
      } else if (e.widget is EditableText) {
        foundText = (e.widget as EditableText).controller.text;
      } else if (e.widget is SelectableText) {
        foundText = (e.widget as SelectableText).data;
      } else {
        e.visitChildren(visitor);
      }
    }

    visitor(element);
    return foundText;
  }
}
