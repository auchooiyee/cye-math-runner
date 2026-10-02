// Zone definitions — one per Form 5 chapter
const ZONE_DATA = [
  { id: 1, chapter: 1, key: 'variation',      nameBm: 'Ubahan',            nameEn: 'Variation',      endDistance: 3000,  bgColor: '#0a1628', accentHex: 0x00ff88, tintHex: 0xb8ffda, labelColor: '#00ff88', motifs: ['y = kx', '∝', 'k / x'] },
  { id: 2, chapter: 2, key: 'matrices',       nameBm: 'Matriks',           nameEn: 'Matrices',       endDistance: 6000,  bgColor: '#0a0a2e', accentHex: 0x00ffff, tintHex: 0xc5ffff, labelColor: '#00ffff', motifs: ['[ 1  0 ]', 'A⁻¹', 'det A'] },
  { id: 3, chapter: 3, key: 'insurance',      nameBm: 'Insurans',          nameEn: 'Insurance',      endDistance: 9000,  bgColor: '#1a0a08', accentHex: 0xff6600, tintHex: 0xffd0ad, labelColor: '#ff6600', motifs: ['SHIELD', 'POLICY', '✓ COVER'] },
  { id: 4, chapter: 4, key: 'taxation',       nameBm: 'Percukaian',        nameEn: 'Taxation',       endDistance: 12000, bgColor: '#1a1500', accentHex: 0xffcc00, tintHex: 0xffefb0, labelColor: '#ffcc00', motifs: ['RM', 'TAX %', 'REBATE'] },
  { id: 5, chapter: 5, key: 'transformations',nameBm: 'Transformasi',      nameEn: 'Transformations',endDistance: 15000, bgColor: '#1a0a1a', accentHex: 0xff00ff, tintHex: 0xffc2ff, labelColor: '#ff00ff', motifs: ['△ → △′', '↻ 90°', '× k'] },
  { id: 6, chapter: 6, key: 'trigonometry',   nameBm: 'Trigonometri',      nameEn: 'Trigonometry',   endDistance: 18000, bgColor: '#000a1a', accentHex: 0x0088ff, tintHex: 0xb8d7ff, labelColor: '#0088ff', motifs: ['sin θ', 'cos θ', 'tan θ'] },
  { id: 7, chapter: 7, key: 'dispersion',     nameBm: 'Sukatan Serakan',   nameEn: 'Dispersion',     endDistance: 21000, bgColor: '#081a00', accentHex: 0x88ff00, tintHex: 0xd8ffad, labelColor: '#88ff00', motifs: ['σ', 'x̄', 'IQR'] },
  { id: 8, chapter: 8, key: 'modelling',      nameBm: 'Pemodelan',         nameEn: 'Modelling',      endDistance: 99999, bgColor: '#1a0008', accentHex: 0xff0044, tintHex: 0xffb5c8, labelColor: '#ff0044', motifs: ['f(x)', 'DATA → MODEL', 'PREDICT'] }
];

export default class ZoneSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentZoneIndex = 0;  // 0-indexed
    this.zones = ZONE_DATA;
    this.hasJustChanged = false;
    this.lockedChapter = null;
  }
  
  getCurrentZone() { return this.zones[this.currentZoneIndex]; }
  getCurrentChapter() { return this.zones[this.currentZoneIndex].chapter; }

  lockToChapter(chapter) {
    const index = this.zones.findIndex(zone => zone.chapter === chapter);
    if (index >= 0) {
      this.currentZoneIndex = index;
      this.lockedChapter = chapter;
    }
  }
  
  update(distanceMetres) {
    if (this.lockedChapter) return;
    const newIndex = this.zones.findIndex(z => distanceMetres < z.endDistance);
    const clampedIndex = newIndex === -1 ? this.zones.length - 1 : newIndex;
    
    if (clampedIndex !== this.currentZoneIndex) {
      this.currentZoneIndex = clampedIndex;
      this.hasJustChanged = true;
      this.scene.events.emit('zone-changed', this.zones[this.currentZoneIndex]);
    } else {
      this.hasJustChanged = false;
    }
  }
  
  getBossForCurrentZone(bossesData) {
    const chapter = this.getCurrentChapter();
    return bossesData.find(b => b.zone === chapter) || bossesData[0];
  }
}
