// Zone definitions — one per Form 5 chapter
const ZONE_DATA = [
  { id: 1, chapter: 1, key: 'variation',      nameBm: 'Ubahan',            nameEn: 'Variation',      endDistance: 3000,  bgColor: '#0a1628', accentHex: 0x00ff88, labelColor: '#00ff88' },
  { id: 2, chapter: 2, key: 'matrices',       nameBm: 'Matriks',           nameEn: 'Matrices',       endDistance: 6000,  bgColor: '#0a0a2e', accentHex: 0x00ffff, labelColor: '#00ffff' },
  { id: 3, chapter: 3, key: 'insurance',      nameBm: 'Insurans',          nameEn: 'Insurance',      endDistance: 9000,  bgColor: '#1a0a08', accentHex: 0xff6600, labelColor: '#ff6600' },
  { id: 4, chapter: 4, key: 'taxation',       nameBm: 'Percukaian',        nameEn: 'Taxation',       endDistance: 12000, bgColor: '#1a1500', accentHex: 0xffcc00, labelColor: '#ffcc00' },
  { id: 5, chapter: 5, key: 'transformations',nameBm: 'Transformasi',      nameEn: 'Transformations',endDistance: 15000, bgColor: '#1a0a1a', accentHex: 0xff00ff, labelColor: '#ff00ff' },
  { id: 6, chapter: 6, key: 'trigonometry',   nameBm: 'Trigonometri',      nameEn: 'Trigonometry',   endDistance: 18000, bgColor: '#000a1a', accentHex: 0x0088ff, labelColor: '#0088ff' },
  { id: 7, chapter: 7, key: 'dispersion',     nameBm: 'Sukatan Serakan',   nameEn: 'Dispersion',     endDistance: 21000, bgColor: '#081a00', accentHex: 0x88ff00, labelColor: '#88ff00' },
  { id: 8, chapter: 8, key: 'modelling',      nameBm: 'Pemodelan',         nameEn: 'Modelling',      endDistance: 99999, bgColor: '#1a0008', accentHex: 0xff0044, labelColor: '#ff0044' }
];

export default class ZoneSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentZoneIndex = 0;  // 0-indexed
    this.zones = ZONE_DATA;
    this.hasJustChanged = false;
  }
  
  getCurrentZone() { return this.zones[this.currentZoneIndex]; }
  getCurrentChapter() { return this.zones[this.currentZoneIndex].chapter; }
  
  update(distanceMetres) {
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
