import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { BLOG_POSTS } from "@/lib/constants";
import BlogCard from "@/components/blog-card";

const BlogSection = () => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">Tips & Inspirasi Karir</h2>
            <p className="mt-2 text-secondary-600">Wawasan dan saran untuk membantu Anda dalam perjalanan karir</p>
          </div>
          <Link href="/blog">
            <a className="hidden md:inline-flex items-center text-primary hover:text-primary-700">
              <span>Lihat semua artikel</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-8 md:hidden">
          <Link href="/blog">
            <a className="inline-flex items-center text-primary hover:text-primary-700">
              <span>Lihat semua artikel</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
