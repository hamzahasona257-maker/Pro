import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('app_ar.arb and app_en.arb contain identical translation keys', () {
    final enRaw = File('lib/l10n/app_en.arb').readAsStringSync();
    final arRaw = File('lib/l10n/app_ar.arb').readAsStringSync();

    final enMap = jsonDecode(enRaw) as Map<String, dynamic>;
    final arMap = jsonDecode(arRaw) as Map<String, dynamic>;

    final enKeys = enMap.keys.where((k) => !k.startsWith('@')).toSet();
    final arKeys = arMap.keys.where((k) => !k.startsWith('@')).toSet();

    expect(enKeys.difference(arKeys), isEmpty);
    expect(arKeys.difference(enKeys), isEmpty);
    expect(enKeys.length, greaterThan(100));
  });
}
