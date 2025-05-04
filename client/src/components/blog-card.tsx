import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    date: string;
  };
}

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden h-full hover:shadow-md transition-shadow duration-200">
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={`${post.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80`} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center text-sm text-secondary-500 mb-3">
          <Calendar className="mr-2 h-4 w-4" />
          <span>{post.date}</span>
          <span className="mx-2">•</span>
          <span>{post.category}</span>
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <Link href={`/blog/${post.id}`}>
          <a className="text-primary hover:text-primary-700 font-medium inline-flex items-center group">
            <span>Baca selengkapnya</span>
            <ArrowRight className="ml-2 text-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Link>
      </div>
    </Card>
  );
};

export default BlogCard;
