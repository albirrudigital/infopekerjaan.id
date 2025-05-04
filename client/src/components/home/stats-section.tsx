import { motion } from "framer-motion";

const statsData = [
  { value: "10,000+", label: "Lowongan Aktif" },
  { value: "5,000+", label: "Perusahaan" },
  { value: "1 Juta+", label: "Pencari Kerja" },
  { value: "500+", label: "Penempatan/Hari" }
];

const StatsSection = () => {
  return (
    <div className="bg-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-secondary-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
