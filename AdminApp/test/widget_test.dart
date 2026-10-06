import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:yeloline/main.dart';

class TestHttpOverrides extends HttpOverrides {}

void main() {
  setUpAll(() {
    HttpOverrides.global = TestHttpOverrides();
  });

  testWidgets('App renders smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const YeloLineApp());
    await tester.pumpAndSettle();

    // Verify that YeloLine app builds cleanly
    expect(find.byType(YeloLineApp), findsOneWidget);
  });
}
