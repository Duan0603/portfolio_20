export type Lang = "vi" | "en";
export type L = Record<Lang, string>;

export const profile = {
  name: "Hoàng Đức Duẫn",
  title: "Full-Stack Developer",
  location: {
    vi: "Đà Nẵng, Việt Nam",
    en: "Da Nang, Vietnam",
  } as L,
  email: "hoangduan06032005@gmail.com",
  phone: "0942373736",
  github: "https://github.com/Duan0603",
  summary: {
    vi: "Full-Stack Developer với hơn 1 năm kinh nghiệm, thành thạo JavaScript/TypeScript và hệ sinh thái React/Next.js, Node.js. Yêu thích học công nghệ mới và xây dựng những ứng dụng chất lượng cao, từ web platform đến AI/IoT trên thiết bị edge.",
    en: "Full-Stack Developer with 1+ years of experience, fluent in JavaScript/TypeScript and the React/Next.js and Node.js ecosystem. Keen on learning new technology and building high-quality applications, from web platforms to AI/IoT on edge devices.",
  } as L,
};

export const education = {
  school: "FPT University",
  major: "Software Engineer",
  period: { vi: "2023 - nay", en: "2023 - present" } as L,
  gpa: "3.2 / 4.0",
};

export const highSchool = {
  school: {
    vi: "THPT chuyên Võ Nguyên Giáp",
    en: "Vo Nguyen Giap High School for the Gifted",
  } as L,
  major: { vi: "Lớp chuyên Tin", en: "Specialised Informatics class" } as L,
  period: "2020 - 2023",
};

export const certifications = [
  "Google Project Management: Professional Certificate",
  "Front-End Developer Professional Certificate",
];

/** `title` is the stable key (used for layout and filtering); `label` is what is shown. */
export const skillGroups: { title: string; label: L; items: string[] }[] = [
  {
    title: "Ngôn ngữ",
    label: { vi: "Ngôn ngữ", en: "Languages" },
    items: ["JavaScript", "TypeScript", "Java", "Python"],
  },
  {
    title: "Frontend",
    label: { vi: "Frontend", en: "Frontend" },
    items: ["React.js", "Next.js (SSR)", "Angular", "Tailwind CSS", "RxJS"],
  },
  {
    title: "Backend",
    label: { vi: "Backend", en: "Backend" },
    items: ["Node.js", "Express.js", "NestJS", "Spring Boot", "Flask"],
  },
  {
    title: "Database",
    label: { vi: "Database", en: "Database" },
    items: ["PostgreSQL", "MongoDB", "TypeORM"],
  },
  {
    title: "AI / IoT",
    label: { vi: "AI / IoT", en: "AI / IoT" },
    items: ["YOLOv8", "PyTorch", "TensorRT", "OpenCV", "NVIDIA Jetson"],
  },
  {
    title: "Công cụ & DevOps",
    label: { vi: "Công cụ & DevOps", en: "Tools & DevOps" },
    items: ["Git/GitHub", "Docker", "Postman", "Jira", "Agile/Scrum"],
  },
];

export type Project = {
  name: string;
  description: L;
  tags: string[];
  repo?: string;
  demo?: string;
  highlights?: L[];
};

export const projects: Project[] = [
  {
    name: "Cinema Ticket Booking Platform",
    description: {
      vi: "Nền tảng đặt vé xem phim theo kiến trúc microservices với sơ đồ ghế tương tác, định giá động và tích hợp thanh toán an toàn.",
      en: "A microservices-based cinema ticketing platform with an interactive seat map, dynamic pricing and secure payment integration.",
    },
    tags: ["Angular", "NestJS", "TypeORM", "PostgreSQL", "RxJS", "Docker", "PayOS"],
    highlights: [
      {
        vi: "Xây dựng sơ đồ ghế động, xử lý logic ghế đôi (SweetBox) và định giá động (1.2x VIP, 1.5x SweetBox).",
        en: "Built a dynamic seat map with companion-seat (SweetBox) logic and dynamic pricing (1.2x VIP, 1.5x SweetBox).",
      },
      {
        vi: "Thiết kế microservices với API Gateway (TCP/RabbitMQ), mỗi service một database PostgreSQL riêng.",
        en: "Designed microservices behind an API Gateway (TCP/RabbitMQ), each service with its own PostgreSQL database.",
      },
      {
        vi: "Tích hợp cổng thanh toán PayOS với webhook/callback để tự động phát hành vé.",
        en: "Integrated the PayOS payment gateway with webhook/callback validation to issue tickets automatically.",
      },
    ],
  },
  {
    name: "Smart Waste Sorting System",
    description: {
      vi: "Hệ thống phân loại rác thông minh chạy AI trên thiết bị edge NVIDIA Jetson, kết hợp thị giác máy tính và điều khiển phần cứng.",
      en: "A smart waste sorting system running AI on an NVIDIA Jetson edge device, combining computer vision with hardware control.",
    },
    tags: ["Python", "YOLOv8", "TensorRT", "OpenCV", "Flask", "NVIDIA Jetson", "Docker"],
    highlights: [
      {
        vi: "Tối ưu model YOLOv8 sang TensorRT (.engine) để tăng tốc suy luận trên Jetson.",
        en: "Compiled the YOLOv8 model to TensorRT (.engine) to accelerate inference on the Jetson.",
      },
      {
        vi: "Xây dựng pipeline CV dùng MOG2 Background Subtraction để kích hoạt suy luận khi có chuyển động.",
        en: "Built a CV pipeline using MOG2 background subtraction to trigger inference only when motion appears.",
      },
      {
        vi: "Điều khiển servo qua giao thức I2C (PCA9685) và dashboard Flask đa luồng stream MJPEG real-time.",
        en: "Drove servos over I2C (PCA9685) and built a multi-threaded Flask dashboard with real-time MJPEG streaming.",
      },
    ],
  },
  {
    name: "FitnexusApp",
    description: {
      vi: "Nền tảng huấn luyện gym online với tính năng AI Trainer phân tích tư thế và gợi ý bài tập, tích hợp thanh toán.",
      en: "An online gym coaching platform with an AI Trainer that analyses posture and recommends exercises, with payments built in.",
    },
    tags: ["React", "Node.js", "Express.js", "YOLOv8-pose", "Groq API (Llama)", "PayOS"],
    repo: "https://github.com/chipkiet/FitnexusApp",
    highlights: [
      {
        vi: "Xây dựng AI Trainer dùng YOLOv8-pose để nhận diện tư thế và Groq API (Llama) để phân tích/gợi ý bài tập.",
        en: "Built the AI Trainer with YOLOv8-pose for posture detection and the Groq API (Llama) for exercise analysis and recommendations.",
      },
      {
        vi: "Tích hợp cổng thanh toán PayOS cho cả client-side và server-side.",
        en: "Integrated the PayOS payment gateway across both client-side and server-side flows.",
      },
      {
        vi: "Áp dụng BMAD Method để chia nhỏ yêu cầu thành các user story nguyên tử, cho output ổn định.",
        en: "Applied the BMAD Method to break requirements into atomic user stories for predictable output.",
      },
    ],
  },
  {
    name: "CourtMate",
    description: {
      vi: "Ứng dụng web đặt sân thể thao, giúp người chơi tìm và đặt sân nhanh chóng.",
      en: "A sports court booking web app that helps players find and book courts quickly.",
    },
    tags: ["JavaScript", "Web App"],
    repo: "https://github.com/Duan0603/CourtMate",
    demo: "https://web-eight-self-61.vercel.app",
  },
  {
    name: "TerraWatch",
    description: {
      vi: "Dự án web theo dõi / giám sát dữ liệu môi trường (giao diện web).",
      en: "A web project for tracking and monitoring environmental data (web interface).",
    },
    tags: ["HTML", "Web"],
    repo: "https://github.com/Duan0603/TerraWatch",
  },
  {
    name: "SDN English Learning",
    description: {
      vi: "Ứng dụng học tiếng Anh xây dựng với Python.",
      en: "An English learning application built with Python.",
    },
    tags: ["Python"],
    repo: "https://github.com/Duan0603/SDN_EnglishLearning",
  },
  {
    name: "Resource Allocation Management System",
    description: {
      vi: "Hệ thống quản lý và phân bổ tài nguyên viết bằng Python.",
      en: "A resource management and allocation system written in Python.",
    },
    tags: ["Python"],
    repo: "https://github.com/Duan0603/ResourceAllocationManagementSystem",
  },
  {
    name: "Spotify Clone",
    description: {
      vi: "Bản sao giao diện ứng dụng nghe nhạc Spotify, xây dựng với TypeScript.",
      en: "A clone of the Spotify music app interface, built with TypeScript.",
    },
    tags: ["TypeScript", "React"],
    repo: "https://github.com/Duan0603/spotify_clone",
  },
];
