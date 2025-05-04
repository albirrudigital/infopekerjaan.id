import { motion } from "framer-motion";
import { UserPlus, Search, Send } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="h-6 w-6" />,
    title: "1. Buat Akun",
    description: "Daftar akun gratis dan lengkapi profil Anda beserta unggah CV terbaru"
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "2. Cari Lowongan",
    description: "Gunakan filter pencarian untuk menemukan pekerjaan yang sesuai dengan keahlian dan preferensi Anda"
  },
  {
    icon: <Send className="h-6 w-6" />,
    title: "3. Lamar Pekerjaan",
    description: "Kirim lamaran dengan mudah dan pantau status aplikasi melalui dashboard Anda"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Cara Kerja infopekerjaan.id</h2>
          <p className="mt-2 text-secondary-600">Temukan pekerjaan impian Anda dalam 3 langkah mudah</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary text-2xl mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">{step.title}</h3>
              <p className="text-secondary-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <motion.a 
            href="/auth?tab=register"
            className="inline-block bg-primary hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-md transition duration-150 ease-in-out"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Sekarang
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
