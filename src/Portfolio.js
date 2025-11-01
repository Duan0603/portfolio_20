"use client"; // Giữ lại directive này nếu bạn đang dùng Next.js App Router
import { useState } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaEnvelope } from "react-icons/fa";
import { ReactTyped } from "react-typed";
import StarBorder from "./components/StarBorder/StarBorder";
// ĐÃ XÓA: import SplashCursor from "./components/SplashCursor"; // <-- Xóa dòng này

export default function Portfolio() {
  const [typingDone, setTypingDone] = useState(false);

  // 🎨 Nút
  const Button = ({ children, href, icon, variant = "solid" }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md 
      ${
        variant === "solid"
          ? "bg-yellow-400 text-red-900 hover:bg-yellow-300 shadow-yellow-400/50"
          : "border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-red-900"
      }`}
    >
      {icon}
      {children}
    </a>
  );

  // ✨ Card dự án (đã chỉnh lại căn đều và thẳng hàng)
  const Card = ({ title, desc, link }) => (
    <StarBorder
      as={motion.div}
      color="#facc15"
      thickness={2}
      whileHover={{ scale: 1.05 }}
      // Đã sửa lại CSS của Card để nó trông đẹp hơn với StarBorder
      className="flex flex-col justify-between bg-red-900/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-[0_0_25px_rgba(252,204,21,0.5)] transition-all duration-300 h-full"
    >
      <div>
        <h3 className="text-2xl font-bold text-yellow-400 mb-2">{title}</h3>
        <p className="text-yellow-100 mb-4">{desc}</p>
      </div>
      <a
        href={link}
        className="text-yellow-300 hover:underline mt-auto pt-2"
        target="_blank"
        rel="noreferrer"
      >
        🔗 Xem dự án
      </a>
    </StarBorder>
  );

  // 🔥 Hiệu ứng lấp lánh cho tên
  const SparkleName = ({ text }) => (
    <motion.h1
      className="text-6xl md:text-7xl font-extrabold mb-4 text-yellow-400 relative"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <span className="relative z-10 drop-shadow-[0_0_10px_#facc15]">
        {text}
      </span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-red-400 to-yellow-300 blur-2xl opacity-40 animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />
    </motion.h1>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-yellow-100 overflow-hidden">
      {/* ĐÃ XÓA: <SplashCursor /> */} {/* <-- Xóa component này */}
      {/* Hero Section */}
      {/* Bọc toàn bộ section Hero vào motion.div để tạo hiệu ứng fade-in */}
      <motion.section
        initial={{ opacity: 0 }} // Bắt đầu với opacity 0
        animate={{ opacity: 1 }} // Chuyển đến opacity 1
        transition={{ duration: 1, delay: 0.5 }} // Thời gian chuyển đổi 1s, delay 0.5s để đồng bộ với tên
        className="flex flex-col justify-center items-center text-center h-screen px-6 relative z-10"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/BacHo2.jpg)`, // <-- Đường dẫn đến ảnh của bạn
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay để giảm độ chói của ảnh nền và tăng độ đọc của chữ */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        {/* Đặt nội dung Hero trong một div riêng để có z-index cao hơn overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center">
          <SparkleName text="Hoàng Đức Duẫn" />
          <ReactTyped
            className="text-xl md:text-2xl text-yellow-200 mt-4"
            strings={[
              "06/03/2005",
              "Front-End Developer",
              "ReactJS • TailwindCSS • UX/UI Enthusiast",
              "Sinh viên Kỹ thuật phần mềm tại FPT Đà Nẵng",
              "Cháu ngoan Bác Hồ",
              "Sống, học tập và làm việc theo tư tưởng Hồ Chí Minh",
            ]}
            typeSpeed={50}
            backSpeed={30}
            loop={false}
            showCursor={false}
            onComplete={() => setTypingDone(true)}
          />

          {typingDone && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex gap-6 mt-10"
            >
              <Button
                href="https://mail.google.com/mail/?view=cm&fs=1&to=hoangduan06032005@gmail.com"
                icon={<FaEnvelope size={20} />}
              >
                Liên hệ
              </Button>
              <Button
                href="https://github.com/Duan0603"
                icon={<FaGithub size={20} />}
                variant="outline"
              >
                GitHub
              </Button>
            </motion.div>
          )}
        </div>
      </motion.section>{" "}
      {/* <-- Đã thay section bằng motion.section */}
      {/* Giới thiệu */}
      <section className="py-20 px-6 md:px-24 relative z-10">
        <motion.div
          // Dùng lại style của Card
          className="bg-red-900/60 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-lg border border-yellow-500/40"
          // Thêm hiệu ứng trượt vào
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }} // Chỉ chạy 1 lần khi cuộn tới
        >
          <h2 className="text-3xl font-semibold text-yellow-400 mb-6">
            Giới thiệu
          </h2>
          <p className="text-yellow-100 leading-relaxed">
            Mình hiện là sinh viên năm 3 ngành Kỹ thuật phần mềm tại Đại học FPT
            Đà Nẵng. Mình muốn tập trung tập trung phát triển kỹ năng Front-End
            với ReactJS, TailwindCSS và chú trọng đến trải nghiệm người dùng
            (UX/UI). Mục tiêu của mình là tạo ra những sản phẩm web đẹp, tối ưu
            và thân thiện.
          </p>
        </motion.div>
      </section>
      {/* Dự án */}
      <section className="py-20 px-6 md:px-24 relative z-10">
        <h2 className="text-3xl font-semibold text-yellow-400 mb-10 text-center">
          Dự án nổi bật
        </h2>
        <div className="flex justify-center">
          <div className="grid md:grid-cols-1 place-items-center gap-8 max-w-3xl w-full">
            <Card
              title="Fitnexus App"
              desc="Ứng dụng web giúp người dùng theo dõi và lập kế hoạch luyện tập, sử dụng ReactJS và REST API. Giao diện tối ưu, hỗ trợ responsive và UX tốt."
              link="https://github.com/chipkiet/FitnexusApp"
            />
            {/* Nếu bạn muốn thêm Portfolio 3D trở lại, bạn có thể uncomment nó */}
            {/* <Card
              title="Portfolio 3D"
              desc="Trang portfolio cá nhân với hiệu ứng động hiện đại, sử dụng Framer Motion và TailwindCSS."
              link="https://github.com/Duan0603"
            /> */}
          </div>
        </div>
      </section>
      {/* Kỹ năng */}
      <section className="py-20 px-6 md:px-24 relative z-10">
        <h2 className="text-3xl font-semibold text-yellow-400 mb-10 text-center">
          Kỹ năng
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            "HTML",
            "CSS",
            "JavaScript",
            "ReactJS",
            "TailwindCSS",
            "Git & GitHub",
            "Figma",
            "Docker",
          ].map((skill, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              className="bg-red-900/50 p-4 rounded-xl text-center border border-yellow-400/20 hover:shadow-[0_0_20px_#facc15] transition"
            >
              {skill}
            </motion.div>
          ))}
        </div>
      </section>
      {/* Liên hệ */}
      <section className="py-20 text-center bg-transparent relative z-10">
        <h2 className="text-3xl font-semibold text-yellow-400 mb-4">Liên hệ</h2>
        <p className="text-yellow-200 mb-6">
          Hãy kết nối với mình qua email hoặc GitHub để cùng trao đổi và hợp tác
          nhé!
        </p>
        <Button
          href="https://mail.google.com/mail/?view=cm&fs=1&to=hoangduan06032005@gmail.com"
          variant="solid"
          icon={<FaEnvelope size={20} />}
        >
          Gửi Email
        </Button>
      </section>
    </div>
  );
}
