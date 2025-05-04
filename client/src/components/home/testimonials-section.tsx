import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import TestimonialCard from "@/components/testimonial-card";

const TestimonialsSection = () => {
  return (
    <section className="bg-secondary-50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Testimoni Pencari Kerja</h2>
          <p className="mt-2 text-secondary-600">Lihat apa kata mereka yang telah menemukan pekerjaan impian melalui infopekerjaan.id</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
