enum Weekday {
  monday(1, 'Mon', 'M'),
  tuesday(2, 'Tue', 'T'),
  wednesday(3, 'Wed', 'W'),
  thursday(4, 'Thu', 'T'),
  friday(5, 'Fri', 'F'),
  saturday(6, 'Sat', 'S'),
  sunday(7, 'Sun', 'S');

  const Weekday(this.isoIndex, this.shortLabel, this.singleLetter);

  final int isoIndex;
  final String shortLabel;
  final String singleLetter;

  static Weekday fromIsoIndex(int index) {
    return Weekday.values.firstWhere(
      (day) => day.isoIndex == index,
      orElse: () => Weekday.monday,
    );
  }
}
