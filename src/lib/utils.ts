export const BAD_WORDS = [
  "ควย", "เย็ด", "เหี้ย", "สัส", "มึง", "กู", "ดอกทอง", "ระยำ", "จัญไร",
  "เงี่ยน", "หี", "อมหำ", "เสียบ", "น้ำแตก", "เลีย", "ดูด", "ขย่ม", "ซอย",
  "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cock", "sex"
];

export const SELF_HARM_KEYWORDS = [
  "ตาย", "ฆ่าตัวตาย", "ไม่อยากอยู่", "จบชีวิต", "ลาโลก", "ทำร้ายตัวเอง",
  "suicide", "kill myself", "end my life", "want to die"
];

export const CATEGORIES = [
  "ทั่วไป", "ความรัก", "ครอบครัว", "การเรียน", "การทำงาน", "สุขภาพจิต", "การเงิน"
];

export function filterProfanity(text: string): string {
  let filtered = text;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "***");
  });
  return filtered;
}

export function containsSelfHarm(text: string): boolean {
  return SELF_HARM_KEYWORDS.some(word => text.toLowerCase().includes(word));
}
