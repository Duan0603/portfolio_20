import type { L } from "./data";

// Project relevance mapping for the skills inspector
export const skillMeta: Record<string, { projects: L; highlight: L }> = {
  "YOLOv8": {
    projects: { vi: "Smart Waste Sorting System, FitnexusApp", en: "Smart Waste Sorting System, FitnexusApp" },
    highlight: {
      vi: "Model nhận diện rác thải & phân tích tư thế tập gym (YOLOv8-pose)",
      en: "Waste detection model and gym posture analysis (YOLOv8-pose)",
    },
  },
  "TensorRT": {
    projects: { vi: "Smart Waste Sorting System", en: "Smart Waste Sorting System" },
    highlight: {
      vi: "Tối ưu hóa model sang .engine tăng tốc suy luận trên NVIDIA Jetson",
      en: "Compiling models to .engine to accelerate inference on the NVIDIA Jetson",
    },
  },
  "NVIDIA Jetson": {
    projects: { vi: "Smart Waste Sorting System", en: "Smart Waste Sorting System" },
    highlight: {
      vi: "Triển khai suy luận Edge AI và điều khiển phần cứng I2C servo",
      en: "Edge AI inference deployment and I2C servo hardware control",
    },
  },
  "OpenCV": {
    projects: { vi: "Smart Waste Sorting System", en: "Smart Waste Sorting System" },
    highlight: {
      vi: "Pipeline thị giác máy tính MOG2 background subtraction & camera stream",
      en: "Computer-vision pipeline with MOG2 background subtraction and camera streaming",
    },
  },
  "PyTorch": {
    projects: { vi: "AI / Edge Projects", en: "AI / Edge Projects" },
    highlight: {
      vi: "Huấn luyện và tinh chỉnh mô hình học sâu cho bài toán thị giác máy tính",
      en: "Training and fine-tuning deep learning models for computer-vision tasks",
    },
  },
  "React.js": {
    projects: { vi: "FitnexusApp, Spotify Clone", en: "FitnexusApp, Spotify Clone" },
    highlight: {
      vi: "Xây dựng giao diện tương tác cao với state management và component tối ưu",
      en: "Highly interactive interfaces with state management and optimised components",
    },
  },
  "Next.js (SSR)": {
    projects: { vi: "Portfolio, Web Platforms", en: "Portfolio, Web Platforms" },
    highlight: {
      vi: "Server-side rendering, App Router tối ưu SEO và tốc độ tải trang",
      en: "Server-side rendering and the App Router for SEO and fast page loads",
    },
  },
  "Angular": {
    projects: { vi: "Cinema Ticket Booking Platform", en: "Cinema Ticket Booking Platform" },
    highlight: {
      vi: "Xây dựng sơ đồ ghế tương tác đa chiều và luồng đặt vé thời gian thực",
      en: "An interactive seat map and a real-time booking flow",
    },
  },
  "RxJS": {
    projects: { vi: "Cinema Ticket Booking Platform", en: "Cinema Ticket Booking Platform" },
    highlight: {
      vi: "Xử lý stream dữ liệu sự kiện đặt vé và kết nối WebSocket / microservices",
      en: "Handling booking event streams and WebSocket / microservice connections",
    },
  },
  "Tailwind CSS": {
    projects: { vi: "CourtMate Web, Portfolio", en: "CourtMate Web, Portfolio" },
    highlight: {
      vi: "Thiết kế hệ thống giao diện chuẩn responsive, dark mode và animation",
      en: "Responsive interface systems with dark mode and animation",
    },
  },
  "TypeScript": {
    projects: {
      vi: "CourtMate Web, Cinema Booking, Spotify Clone",
      en: "CourtMate Web, Cinema Booking, Spotify Clone",
    },
    highlight: {
      vi: "Định kiểu tĩnh nghiêm ngặt trên toàn bộ kiến trúc frontend và backend",
      en: "Strict static typing across the whole frontend and backend architecture",
    },
  },
  "JavaScript": {
    projects: { vi: "CourtMate, Web Apps", en: "CourtMate, Web Apps" },
    highlight: {
      vi: "Nền tảng phát triển ứng dụng web hiện đại và tương tác DOM",
      en: "The foundation for modern web apps and DOM interaction",
    },
  },
  "Python": {
    projects: {
      vi: "Smart Waste Sorting, SDN English, RAMS",
      en: "Smart Waste Sorting, SDN English, RAMS",
    },
    highlight: {
      vi: "Xây dựng pipeline AI, backend Flask và ứng dụng tự động hóa",
      en: "AI pipelines, Flask backends and automation apps",
    },
  },
  "Java": {
    projects: { vi: "Hệ thống phần mềm FPTU", en: "FPTU software systems" },
    highlight: {
      vi: "Lập trình hướng đối tượng, cấu trúc dữ liệu và giải thuật nâng cao",
      en: "Object-oriented programming, data structures and advanced algorithms",
    },
  },
  "NestJS": {
    projects: { vi: "Cinema Ticket Booking Platform", en: "Cinema Ticket Booking Platform" },
    highlight: {
      vi: "Kiến trúc microservices, API Gateway, TCP/RabbitMQ liên service",
      en: "Microservice architecture, API Gateway and TCP/RabbitMQ between services",
    },
  },
  "Node.js": {
    projects: { vi: "FitnexusApp, Cinema Booking", en: "FitnexusApp, Cinema Booking" },
    highlight: {
      vi: "Xây dựng server backend hiệu năng cao, RESTful APIs và Webhooks",
      en: "High-performance backend servers, RESTful APIs and webhooks",
    },
  },
  "Express.js": {
    projects: { vi: "FitnexusApp Backend", en: "FitnexusApp Backend" },
    highlight: {
      vi: "Tích hợp cổng thanh toán PayOS và webhook xử lý giao dịch thời gian thực",
      en: "PayOS payment gateway integration and real-time transaction webhooks",
    },
  },
  "Spring Boot": {
    projects: { vi: "Enterprise Backend", en: "Enterprise Backend" },
    highlight: {
      vi: "Xây dựng REST API bảo mật với kiến trúc đa tầng (Layered Architecture)",
      en: "Secure REST APIs on a layered architecture",
    },
  },
  "Flask": {
    projects: { vi: "Smart Waste Sorting System", en: "Smart Waste Sorting System" },
    highlight: {
      vi: "Dashboard đa luồng phục vụ stream MJPEG real-time từ Jetson",
      en: "A multi-threaded dashboard serving real-time MJPEG streams from the Jetson",
    },
  },
  "PostgreSQL": {
    projects: { vi: "Cinema Ticket Booking Platform", en: "Cinema Ticket Booking Platform" },
    highlight: {
      vi: "Thiết kế cơ sở dữ liệu quan hệ, database-per-service microservices",
      en: "Relational database design with database-per-service microservices",
    },
  },
  "MongoDB": {
    projects: { vi: "Full-Stack Web Apps", en: "Full-Stack Web Apps" },
    highlight: {
      vi: "Lưu trữ dữ liệu phi cấu trúc, indexing và aggregation pipeline",
      en: "Unstructured data storage, indexing and aggregation pipelines",
    },
  },
  "TypeORM": {
    projects: { vi: "Cinema Ticket Booking Platform", en: "Cinema Ticket Booking Platform" },
    highlight: {
      vi: "Quản lý migration, quan hệ thực thể phức tạp (phòng vé, ghế đôi SweetBox)",
      en: "Migrations and complex entity relations (rooms, SweetBox companion seats)",
    },
  },
  "Docker": {
    projects: {
      vi: "Cinema Platform, Smart Waste Sorting",
      en: "Cinema Platform, Smart Waste Sorting",
    },
    highlight: {
      vi: "Container hóa microservices và môi trường chạy edge trên Jetson",
      en: "Containerising microservices and the edge runtime on the Jetson",
    },
  },
  "Git/GitHub": {
    projects: { vi: "Toàn bộ dự án", en: "All projects" },
    highlight: {
      vi: "Quản lý mã nguồn, Git flow, CI/CD và review code nhóm",
      en: "Source control, Git flow, CI/CD and team code review",
    },
  },
  "Postman": {
    projects: { vi: "Tất cả backend APIs", en: "All backend APIs" },
    highlight: {
      vi: "Kiểm thử API, tự động hóa test script và tài liệu hóa endpoint",
      en: "API testing, automated test scripts and endpoint documentation",
    },
  },
  "Jira": {
    projects: { vi: "Dự án phát triển phần mềm", en: "Software development projects" },
    highlight: {
      vi: "Quản lý tiến độ sprint, backlog và theo dõi bug",
      en: "Sprint progress, backlog management and bug tracking",
    },
  },
  "Agile/Scrum": {
    projects: { vi: "Quy trình phát triển dự án", en: "Project development process" },
    highlight: {
      vi: "Áp dụng BMAD method, chia nhỏ user story nguyên tử cho output chuẩn",
      en: "Applying the BMAD method, splitting work into atomic user stories",
    },
  },
};
