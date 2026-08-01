// Curated vocabulary for the two-level filter bar's "国家 / 时期" facet.
// Tags are free-form (see d1/schema.sql), so there's no DB field marking a
// tag as a country/period — anything not in this list falls into the plain
// "标签" facet instead.
export const COUNTRY_PERIOD_TAGS = new Set([
  // countries / regions
  '中国', '法国', '英国', '美国', '德国', '俄国', '俄罗斯', '日本', '韩国',
  '意大利', '西班牙', '葡萄牙', '匈牙利', '波兰', '捷克', '奥地利', '瑞士',
  '瑞典', '挪威', '丹麦', '荷兰', '比利时', '爱尔兰', '希腊', '古希腊',
  '古罗马', '印度', '土耳其', '以色列', '埃及', '巴西', '阿根廷', '墨西哥',
  '加拿大', '澳大利亚', '南非', '伊朗', '阿拉伯',
  // periods / dynasties / eras
  '先秦', '春秋', '战国', '秦', '汉', '魏晋', '南北朝', '隋', '唐', '唐诗',
  '五代', '宋', '宋词', '元', '元曲', '明', '清', '明清', '民国', '近现代',
  '现代', '当代', '古代', '中世纪', '文艺复兴', '启蒙运动', '维多利亚时代',
  '二战', '冷战', '二十世纪', '十九世纪', '十八世纪',
])

export function classifyTag(tag) {
  return COUNTRY_PERIOD_TAGS.has(tag) ? 'country' : 'topic'
}

export function splitTagGroups(tagCounts) {
  const countryTagCounts = []
  const topicTagCounts = []
  for (const entry of tagCounts) {
    const [tag] = entry
    ;(classifyTag(tag) === 'country' ? countryTagCounts : topicTagCounts).push(entry)
  }
  return { countryTagCounts, topicTagCounts }
}
