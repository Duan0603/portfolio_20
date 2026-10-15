import { education, profile, skillGroups, type Lang } from "@/lib/data";
import { rest, type Station } from "./game";

/** Interface strings for the drivable atelier. Content stays in lib/data.ts. */
export const copy = {
  vi: {
    start: "Bắt đầu",
    lede: "Một chuyến đi qua những gì tôi xây dựng. Lái xe đến từng điểm dừng, hoặc mở dự án để xem ngay.",
    projects: "Dự án",
    explore: "Khám phá 3D",
    quickProjects: "Xem nhanh dự án",
    directoryIntro: "Từ ý tưởng đến sản phẩm. Khám phá công nghệ và cách tôi xây dựng từng dự án.",
    searchProjects: "Tìm dự án hoặc công nghệ…",
    projectCount: "dự án",
    visitProject: "Lái tới dự án",
    noResults: "Chưa tìm thấy dự án",
    trySearch: "Thử một tên khác hoặc công nghệ như React, Python.",
    clearSearch: "Xem tất cả dự án",
    heroLine: "Từ ứng dụng web đến AI trên thiết bị edge.",
    loading: "Đang chuẩn bị chuyến đi…",
    loadFailed: "Không thể mở không gian 3D. Bạn vẫn có thể xem toàn bộ portfolio bên dưới.",
    itinerary: "Chọn điểm đến",
    returnHome: "Về điểm bắt đầu",
    coast: "Đà Nẵng, Việt Nam",
    how: "Cách đi",
    gas: "Ga và phanh / lùi",
    steer: "Đánh lái",
    hand: "Phanh tay, giữ để drift",
    boost: "Tăng tốc",
    tap: "Bấm xuống sàn, xe tự chạy tới đó",
    auto: "Xe tự lái tới trạm kế",
    hint: "W S ga và phanh, A D đánh lái, Space để drift",
    code: "Mã nguồn",
    garage: "Đổi xe",
    credit: "Mô hình 3D, CC BY 4.0:",
    demo: "Xem demo",
    begin: "Tới trạm đầu tiên",
    next: "Trạm kế",
    prev: "Trạm trước",
    close: "Đóng bảng thông tin",
    stations: "Các trạm",
    asPage: "Xem dạng trang",
    asWorld: "Khám phá 3D",
    driving: "Đang trên đường",
    highlights: "Điểm nhấn kỹ thuật",
    repos: "Kho GitHub khác",
    about: "Hồ sơ",
    education: "Học vấn",
    certs: "Chứng chỉ",
    skills: "Kỹ năng",
    contact: "Liên hệ",
    contactHead: "Cùng dựng thứ gì đó đáng để ghi nhớ.",
    contactBody: "Đang mở cơ hội vị trí full-time lẫn dự án freelance. Gửi tôi vài dòng, tôi sẽ phản hồi sớm.",
    email: "Gửi email",
    open: "Mở cơ hội full-time & freelance",
    toDay: "Chuyển sang giao diện sáng",
    toNight: "Chuyển sang giao diện tối",
    lang: "Ngôn ngữ",
  },
  en: {
    start: "Start",
    lede: "A little journey through what I build. Drive to each stop, or open a project to read it right away.",
    projects: "Projects",
    explore: "Explore in 3D",
    quickProjects: "Quick project view",
    directoryIntro: "From idea to implementation. Explore the technology and thinking behind each project.",
    searchProjects: "Find a project or technology…",
    projectCount: "projects",
    visitProject: "Drive to project",
    noResults: "No projects found",
    trySearch: "Try another name or a technology such as React or Python.",
    clearSearch: "Show all projects",
    heroLine: "From web applications to AI on the edge.",
    loading: "Getting your journey ready…",
    loadFailed: "The 3D space couldn't open. You can still read the complete portfolio below.",
    itinerary: "Choose a destination",
    returnHome: "Back to the start",
    coast: "Da Nang, Vietnam",
    how: "Getting around",
    gas: "Throttle and brake / reverse",
    steer: "Steer",
    hand: "Handbrake, hold to drift",
    boost: "Boost",
    tap: "Click the floor and the car drives there",
    auto: "The car drives itself to the next stop",
    hint: "W S throttle and brake, A D steer, Space to drift",
    code: "Source code",
    garage: "Change vehicle",
    credit: "3D models, CC BY 4.0:",
    demo: "Live demo",
    begin: "Go to the first exhibit",
    next: "Next stop",
    prev: "Previous stop",
    close: "Close the panel",
    stations: "Exhibits",
    asPage: "Read as a page",
    asWorld: "Explore in 3D",
    driving: "On the way",
    highlights: "Technical highlights",
    repos: "More on GitHub",
    about: "Profile",
    education: "Education",
    certs: "Certifications",
    skills: "Skills",
    contact: "Contact",
    contactHead: "Let's build something worth remembering.",
    contactBody: "Open to full-time roles and freelance projects. Send me a few lines and I'll get back to you soon.",
    email: "Send email",
    open: "Open to full-time & freelance",
    toDay: "Switch to light appearance",
    toNight: "Switch to dark appearance",
    lang: "Language",
  },
} satisfies Record<Lang, unknown>;

export function stationTitle(s: Station, lang: Lang) {
  const t = copy[lang];
  switch (s.kind) {
    case "intro":
      return profile.name;
    case "project":
      return s.project!.name;
    case "repos":
      return t.repos;
    case "about":
      return t.about;
    case "skills":
      return t.skills;
    case "contact":
      return t.contact;
  }
}

/** The name as it appears in the row of stops, where space is short. */
export function stationShort(s: Station, lang: Lang) {
  if (s.kind === "intro") return copy[lang].start;
  if (s.kind === "project") return s.project!.name.split(" ").slice(0, 2).join(" ");
  return stationTitle(s, lang);
}

/** Short, recognizable names for physical signs viewed across the promenade. */
export function stationSign(s: Station, lang: Lang) {
  if (s.kind === "repos") return "GitHub";
  if (s.project?.name === "Cinema Ticket Booking Platform") return "Cinema";
  if (s.project?.name === "Smart Waste Sorting System") return "Smart Waste";
  if (s.project?.name === "FitnexusApp") return "Fitnexus";
  return stationShort(s, lang);
}

/** The line of detail on a board, under its title. */
export function stationNote(s: Station, lang: Lang) {
  switch (s.kind) {
    case "project":
      return s.project!.description[lang];
    case "repos":
      return lang === "vi" ? `${rest.length} dự án khác, kèm mã nguồn và demo` : `${rest.length} more projects, with source and demos`;
    case "about":
      return `${education.school} / ${education.major}`;
    case "skills":
      return lang === "vi" ? "Từ giao diện web tới AI trên thiết bị edge" : "From the web interface to AI on edge devices";
    case "contact":
      return copy[lang].open;
    default:
      return profile.title;
  }
}

/** The tags along the foot of a board. */
export function stationChips(s: Station, lang: Lang) {
  switch (s.kind) {
    case "project":
      return s.project!.tags;
    case "repos":
      return rest.map((p) => p.name);
    case "about":
      return [`GPA ${education.gpa}`, education.period[lang]];
    case "skills":
      return skillGroups.map((g) => g.label[lang]);
    case "contact":
      return [profile.email];
    default:
      return [];
  }
}
