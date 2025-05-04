import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Siap Memulai Karir Baru?
        </motion.h2>
        <motion.p 
          className="text-primary-100 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Bergabunglah dengan ribuan pencari kerja yang telah menemukan pekerjaan impian mereka melalui infopekerjaan.id
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/auth?tab=register">
            <Button variant="secondary" size="lg">
              Buat Akun Gratis
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg" className="bg-primary-700 text-white border-primary-700 hover:bg-primary-800 hover:text-white">
              Cari Lowongan
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
