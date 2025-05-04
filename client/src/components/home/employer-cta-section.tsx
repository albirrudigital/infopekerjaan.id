import { motion } from "framer-motion";
import { Link } from "wouter";
import { Check } from "lucide-react";

const features = [
  "Akses ke database talenta berkualitas dan terverifikasi",
  "Posting lowongan dengan mudah dan pantau aplikasi masuk",
  "Filter kandidat berdasarkan keahlian, pengalaman, dan lokasi",
  "Bangun branding perusahaan dengan halaman profil menarik"
];

const EmployerCtaSection = () => {
  return (
    <section className="bg-primary-900 text-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 md:pr-8 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Untuk Perusahaan</h2>
            <p className="mb-6 text-primary-100">
              Temukan talenta terbaik untuk mendukung pertumbuhan bisnis Anda
            </p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                >
                  <Check className="text-primary-300 mt-1 mr-2" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link href="/auth?tab=register&type=employer">
                <a className="inline-block bg-white text-primary hover:bg-primary-50 font-medium px-6 py-3 rounded-md transition duration-150 ease-in-out">
                  Daftar Sebagai Perusahaan
                </a>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1573164574511-73c773193279?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
              alt="Meeting di kantor modern" 
              className="rounded-lg shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EmployerCtaSection;
