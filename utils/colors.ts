// ビビットで見分けやすい色の配置（10色）
export const UNIVERSAL_COLORS = [
  { name: '赤', value: '#DC143C', description: 'ビビットな赤' },
  { name: 'オレンジ', value: '#FF8C00', description: 'ビビットなオレンジ' },
  { name: '黄', value: '#FFD700', description: 'ビビットな黄色' },
  { name: '黄緑', value: '#32CD32', description: 'ビビットな黄緑' },
  { name: '緑', value: '#228B22', description: 'ビビットな緑' },
  { name: '青', value: '#0000FF', description: 'ビビットな青' },
  { name: '水色', value: '#00FFFF', description: 'ビビットな水色' },
  { name: '紫', value: '#8A2BE2', description: 'ビビットな紫' },
  { name: 'ピンク', value: '#FF1493', description: 'ビビットなピンク' },
  { name: '茶色', value: '#A0522D', description: 'ビビットな茶色' },
];

// ランダムにカラーを選択
export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * UNIVERSAL_COLORS.length);
  return UNIVERSAL_COLORS[randomIndex].value;
}

// カラー名を取得
export function getColorName(colorValue: string): string {
  const color = UNIVERSAL_COLORS.find(c => c.value === colorValue);
  return color ? color.name : 'カスタムカラー';
}

// カラー説明を取得
export function getColorDescription(colorValue: string): string {
  const color = UNIVERSAL_COLORS.find(c => c.value === colorValue);
  return color ? color.description : '';
}
