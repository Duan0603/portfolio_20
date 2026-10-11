import type { Lang } from "./data";

/** Interface strings. Content (projects, bio, skills) lives in lib/data.ts. */
export const ui = {
  vi: {
    nav: { work: "Dự án", about: "Hồ sơ", skills: "Kỹ năng", contact: "Liên hệ" },
    navContact: "LIÊN HỆ ↗",
    langLabel: "Ngôn ngữ",
    toDay: "Chuyển sang giao diện sáng",
    toNight: "Chuyển sang giao diện tối",
    rail: { label: "Các chương", top: "Mở đầu" },
    hero: {
      cta: "Xem dự án",
      meta: "Mở cơ hội full-time & freelance",
      scroll: "Cuộn",
    },
    work: {
      title: "Dự án",
      intro:
        "Những tác phẩm trải từ nền tảng web, hệ thống microservices đến AI thị giác máy tính trên thiết bị edge.",
      highlights: "Điểm nhấn kỹ thuật",
      more: "Kho GitHub khác",
    },
    about: {
      title: "Hồ sơ",
      direction: "Định hướng",
      education: "Học vấn",
      certs: "Chứng chỉ",
      quick: "Liên hệ nhanh",
    },
    skills: {
      title: "Kỹ năng",
      intro:
        "Sáu tầng của một stack, từ giao diện web tới AI thị giác máy tính và phần cứng edge. Chọn một kỹ năng để xem nó đã dùng vào việc gì.",
      usedIn: "Dự án áp dụng: ",
    },
    contact: {
      headA: "Cùng dựng thứ gì đó",
      headB: "đáng để ghi nhớ.",
      body: "Đang mở cơ hội vị trí full-time lẫn dự án freelance. Gửi tôi vài dòng — tôi sẽ phản hồi sớm.",
      email: "Gửi email",
    },
    footer: "Dựng bằng Next.js · Three.js · WebGL",
  },
  en: {
    nav: { work: "Work", about: "Profile", skills: "Skills", contact: "Contact" },
    navContact: "CONTACT ↗",
    langLabel: "Language",
    toDay: "Switch to light appearance",
    toNight: "Switch to dark appearance",
    rail: { label: "Chapters", top: "Start" },
    hero: {
      cta: "View work",
      meta: "Open to full-time & freelance",
      scroll: "Scroll",
    },
    work: {
      title: "Work",
      intro:
        "Projects ranging from web platforms and microservice systems to computer-vision AI on edge devices.",
      highlights: "Technical highlights",
      more: "More on GitHub",
    },
    about: {
      title: "Profile",
      direction: "Focus",
      education: "Education",
      certs: "Certifications",
      quick: "Quick contact",
    },
    skills: {
      title: "Skills",
      intro:
        "Six layers of one stack, from the web interface to computer-vision AI and edge hardware. Pick a skill to see what it was used for.",
      usedIn: "Used in: ",
    },
    contact: {
      headA: "Let's build something",
      headB: "worth remembering.",
      body: "Open to full-time roles and freelance projects. Send me a few lines — I'll get back to you soon.",
      email: "Send email",
    },
    footer: "Built with Next.js · Three.js · WebGL",
  },
} satisfies Record<Lang, unknown>;
